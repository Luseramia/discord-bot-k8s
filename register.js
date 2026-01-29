const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "รายจ่าย",
    description: "เพิ่มรายจ่าย",
    options: [
      {
        name: "ประเภท",
        description: "เลือกประเภทของรายจ่าย",
        type: 3, // STRING
        required: true,
        choices: [
          {
            name: "อาหาร",
            value: "อาหาร",
          },
          {
            name: "เดินทาง",
            value: "เดินทาง",
          },
          {
            name: "ค่าไฟ",
            value: "ค่าไฟ",
          },
          {
            name: "ของใช้",
            value: "ของใช้",
          },
          {
            name: "อื่นๆ",
            value: "อื่นๆ",
          },
        ],
      },
      {
        name: "จำนวน",
        description: "จำนวนเงินที่จ่าย",
        type: 4, // INTEGER
        required: true,
      },
      {
        name: "รายละเอียดค่าใช้จ่าย",
        description: "ระบุสิ่งของแบบชัดเจน",
        type: 3, // STRING
      },
      {
        name: "โน๊ต",
        description: "เพิ่มโน๊ต",
        type: 3, // STRING
      },
    ],
  },
  {
    name: "ตอบกลับchat",
    description: "ส่งข้อความไปที่ chat ws",
    options: [
      {
        name: "ข้อความ",
        description: "ข้อความที่ต้องการส่ง",
        type: 3, // STRING
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    // await rest.put(Routes.applicationCommands(process.env.ClientID), { body: commands });
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.ClientID,
        process.env.GuildID
      ),
      { body: commands }
    );
    // await rest.put(Routes.applicationCommands(process.env.ClientID), {
    //   body: [],
    // });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
