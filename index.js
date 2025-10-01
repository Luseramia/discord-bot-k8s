require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const DISCORD_TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN; // รองรับทั้งสองชื่อ
const testApi =
  process.env.N8N_TEST_API ||
  "http://192.168.1.53:5678/webhook-test/02bb3007-efbd-414c-8e6c-2cf2718ce984";
const productionApi =
  process.env.N8N_PRODUCTION_API ||
  "http://192.168.1.53:5678/webhook/02bb3007-efbd-414c-8e6c-2cf2718ce984";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  client.destroy();
  process.exit(0);
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

// เพิ่ม reconnect handling
client.on("disconnect", () => {
  console.log("Bot disconnected, attempting to reconnect...");
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  client.destroy();
  process.exit(0);
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  // เราจะดีบักแค่คำสั่งนี้เท่านั้น
  // console.log("ข้อความล่าสุด:", message.content);
  // console.log("Message ID:", message.id);
  // console.log("message", message);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    return interaction.reply("Pong!");
  }

  if (interaction.commandName === "รายจ่าย") {
    await interaction.deferReply(); // ⬅️ บอก Discord ว่าจะตอบทีหลัง

    const username = interaction.user.username;
    const typeOfExpense = interaction.options.getString("ประเภท");
    const amount = interaction.options.getInteger("จำนวน");
    const expenseDiscription = interaction.options.getString("รายละเอียดค่าใช้จ่าย");
    const note = interaction.options.getString("โน๊ต");

    const result = await onCreateExpenses(
      username,
      typeOfExpense,
      amount,
      expenseDiscription,
      note
    );
    console.log('api',productionApi);
    

    if (result.message === "Workflow was started") {
      await interaction.editReply(`รัน workflow เรียบร้อย`);
    } else {
      await interaction.editReply(`เกิดข้อผิดพลาด ${result}`);
    }
    console.log(result);
  }
});

// const testApi = 'http://192.168.1.53:5678/webhook-test/02bb3007-efbd-414c-8e6c-2cf2718ce984'
// const productionApi =  'http://192.168.1.53:5678/webhook/02bb3007-efbd-414c-8e6c-2cf2718ce984'

async function onCreateExpenses(username, typeOfExpense, amount, expenseDiscription, note) {
  try {
    const res = await fetch(productionApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-AUTH": "MTI5OTk0OTgxOTE0MTU1NDE5Nw",
      },
      body: JSON.stringify({
        username,
        typeOfExpense,
        amount,
        date: new Date(),
        expenseDiscription,
        note,
      }),
    });

    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));

    const text = await res.text();
    console.log("Raw response:", text);

    // ถ้าเป็น JSON ค่อย parse
    if (res.headers.get("content-type")?.includes("application/json")) {
      return JSON.parse(text);
    } else {
      return { error: "Not JSON", raw: text };
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return { error: err.message };
  }
}


// 7. ล็อกอินบอท
client.login(DISCORD_TOKEN);
