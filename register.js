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
  {
    name: "jira-comments",
    description: "ดูคอมเม้นของ Jira issue",
    options: [
      {
        name: "issue",
        description: "Issue key เช่น PROJ-123",
        type: 3, // STRING
        required: true,
      },
    ],
  },
  {
    name: "jira-status",
    description: "ดู Jira issues ที่อยู่ใน status ที่ต้องการ",
    options: [
      {
        name: "status",
        description: "เลือก status",
        type: 3, // STRING
        required: true,
        choices: [
          { name: "PENDING", value: "PENDING" },
          { name: "TO DO", value: "To Do" },
          { name: "IN PROGRESS", value: "In Progress" },
          { name: "TEST", value: "TEST" },
          { name: "TESTING", value: "TESTING" },
          { name: "TESTING ACC", value: "TESTING ACC" },
          { name: "UAT", value: "UAT" },
          { name: "UAT FAIL", value: "UAT FAIL" },
          { name: "READY TO DEPLOY", value: "READY TO DEPLOY" },
          { name: "CR REJECT", value: "CR REJECT" },
          { name: "DEPLOYED", value: "DEPLOYED" },
          { name: "REPOST", value: "REPOST" },
          { name: "REPOST FAIL", value: "REPOST FAIL" },
          { name: "SMOKE TEST", value: "SMOKE TEST" },
          { name: "SMOKE TEST FAIL", value: "SMOKE TEST FAIL" },
          { name: "CLOSED", value: "CLOSED" },
        ],
      },
      {
        name: "project",
        description: "(เลือกได้) จำกัด project key เช่น SE",
        type: 3, // STRING
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
