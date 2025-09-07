
// 2. Import ไลบรารีที่จำเป็น
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// 3. อ่านค่า Configurations จาก .env
// ตรวจสอบให้แน่ใจว่าค่าเหล่านี้มีอยู่ในไฟล์ .env ของคุณ
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const WORKSHEET_TITLE = process.env.WORKSHEET_TITLE;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN; // รองรับทั้งสองชื่อ
const CHECK_INTERVAL_MS = 60 * 1000; // 1 นาที

// 4. ตั้งค่าการยืนยันตัวตน (แนะนำให้อ่านจาก .env เพื่อความปลอดภัย)
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// 5. ตั้งค่า Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 6. ตัวแปรสำหรับเก็บสถานะของชีต
let previousState = null;
/**
 * ฟังก์ชันสำหรับเปรียบเทียบข้อมูลและแสดงการเปลี่ยนแปลงพร้อมข้อความ
 * @param {GoogleSpreadsheetRow[]} oldRows - ข้อมูลชุดเก่า
 * @param {GoogleSpreadsheetRow[]} newRows - ข้อมูลชุดใหม่
 * @returns {string[]} - รายการการเปลี่ยนแปลง
 */
function compareStates(oldRows, newRows) {
  if (!oldRows || !newRows) {
    console.log(
      "Debug: compareStates received null or undefined rows. Returning no changes."
    );
    return [];
  }

  const changes = [];
  const oldRowObjects = oldRows.map((r) => r.toObject());
  const newRowObjects = newRows.map((r) => r.toObject());

  const headerKeys =
    newRows.length > 0 && newRows[0]
      ? Object.keys(newRows[0].toObject())
      : oldRows.length > 0 && oldRows[0]
      ? Object.keys(oldRows[0].toObject())
      : [];

  if (headerKeys.length === 0) {
    console.log("Debug: No headers found. Assuming no changes.");
    return [];
  }

  // สร้าง serialized string สำหรับเปรียบเทียบแต่ละแถว
  const oldRowStrings = oldRowObjects.map((row) => JSON.stringify(row));
  const newRowStrings = newRowObjects.map((row) => JSON.stringify(row));

  // หาแถวที่เปลี่ยนแปลง
  newRowObjects.forEach((newRow, index) => {
    const currentRowNumber = index + 2; // +2 เพราะแถว 1 เป็น header
    const newRowString = JSON.stringify(newRow);

    // เช็คว่าแถวนี้มีอยู่ในข้อมูลเก่าไหม
    if (!oldRowStrings.includes(newRowString)) {
      // หาข้อความที่ไม่ว่าง
      const nonEmptyValues = [];
      headerKeys.forEach((header) => {
        const value = newRow[header];
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          nonEmptyValues.push(`${header}: "${value}"`);
        }
      });

      if (nonEmptyValues.length > 0) {
        changes.push(
          `📝 **แถว ${currentRowNumber}:** ${nonEmptyValues.join(", ")}`
        );
      } else {
        changes.push(
          `📝 **แถว ${currentRowNumber}:** มีการเปลี่ยนแปลง (ข้อมูลว่าง)`
        );
      }
    }
  });

  // หาแถวที่ถูกลบ (มีในข้อมูลเก่าแต่ไม่มีในข้อมูลใหม่)
  oldRowObjects.forEach((oldRow, index) => {
    const oldRowNumber = index + 2;
    const oldRowString = JSON.stringify(oldRow);

    if (!newRowStrings.includes(oldRowString)) {
      const nonEmptyValues = [];
      headerKeys.forEach((header) => {
        const value = oldRow[header];
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          nonEmptyValues.push(`${header}: "${value}"`);
        }
      });

      if (nonEmptyValues.length > 0) {
        changes.push(
          `🗑️ **ลบแถว ${oldRowNumber}:** ${nonEmptyValues.join(", ")}`
        );
      }
    }
  });

  return changes;
}

async function checkSheetForChanges() {
  try {
    console.log("--- New Check Cycle ---");

    console.log("Step 1: Creating GoogleSpreadsheet instance...");
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

    console.log("Step 2: Loading doc info...");
    await doc.loadInfo();

    console.log("Step 3: Accessing worksheet...");
    const sheet = doc.sheetsByTitle[WORKSHEET_TITLE];
    if (!sheet) {
      console.error(`Worksheet with title "${WORKSHEET_TITLE}" not found!`);
      return;
    }

    console.log("Step 4: Worksheet found. Getting rows...");
    const newRows = await sheet.getRows();
    console.log(
      `Step 5: Found ${newRows.length} rows. Current previousState is ${
        previousState ? `an array with ${previousState.length} items` : "null"
      }.`
    );

    if (previousState === null) {
      console.log(
        "Initial state captured. Monitoring will start on the next check."
      );
      previousState = newRows;
      return;
    }

    console.log("Step 6: Comparing states...");
    const changes = compareStates(previousState, newRows);
    console.log(
      `Step 7: Comparison complete. Found ${changes.length} changes.`
    );

    if (changes.length > 0) {
      console.log("Change detected!");
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      if (channel) {
        const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
        const summary = changes.join("\n");
        console.log(summary);

        const message = `ตรวจพบการเปลี่ยนแปลงใน Google Sheet! 📄\n\n**สรุปรายการเปลี่ยนแปลง:**\n${summary}\n\nตรวจสอบที่ชีตโดยตรง: ${sheetUrl}`;

        if (message.length > 2000) {
          channel.send(
            `ตรวจพบการเปลี่ยนแปลงจำนวนมาก กรุณาตรวจสอบที่ชีตโดยตรง: ${sheetUrl}`
          );
        } else {
          channel.send(message);
        }
      }
      previousState = newRows;
    } else {
      console.log("No changes detected.");
    }
  } catch (error) {
    console.error("Error checking Google Sheet:", error);
  }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log("Starting Google Sheet monitoring...");
  // checkSheetForChanges();
  // setInterval(checkSheetForChanges, CHECK_INTERVAL_MS);
});

client.on("messageCreate", async (message) => {

  if (message.content !== "!checkchannels" || message.author.bot) return;

  // เมื่อได้รับข้อความ !checkchannels ให้ log ทุกอย่างออกมาดู
  console.log(`--- Command Triggered by ${message.author.username} ---`);
  console.log(`Author ID from message: ${message.author.id}`);
  console.log(
    `Is Author ID correct? : ${message.author.id === "436143316950581259"}`
  ); // ควรจะขึ้นว่า true
  console.log(`Executing code inside IF block...`);

  try {
    // 1. ทดลองให้บอท React กลับไปที่ข้อความ
    await message.react("✅"); // React ด้วยเครื่องหมายถูก
    console.log("Successfully reacted to the message.");

    // 2. จากนั้นค่อยทำ Logic เดิม
    const guild = message.guild;
    if (!guild) {
      console.log("Error: Not in a guild.");
      return;
    }

    let channelList = "นี่คือ Text Channels ทั้งหมดที่บอทเห็น:\n\n";
    guild.channels.cache.forEach((channel) => {
      if (channel.type === 0) {
        // 0 = GUILD_TEXT
        channelList += `➡️ **#${channel.name}** \`ID: ${channel.id}\`\n`;
      }
    });

    console.log("Generated channel list. Attempting to reply...");
    await message.reply({
      content: channelList,
      allowedMentions: { repliedUser: false },
    });
    console.log("Successfully replied with channel list.");
  } catch (err) {
    console.error("An error occurred inside the IF block:", err);
  }
});