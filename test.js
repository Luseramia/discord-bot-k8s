import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs/promises';

const jsonData = await fs.readFile('./google.json', 'utf-8');
const credentials = JSON.parse(jsonData);

// const SCOPES = [
//   'https://www.googleapis.com/auth/spreadsheets',
//   'https://www.googleapis.com/auth/drive.file',
// ];

// const jwt = new JWT({
//   email: creds.client_email,
//   key: creds.private_key,
//   scopes: SCOPES,
// });

// // ✅ ไม่มี useJwtAuth แล้ว ให้ใส่ jwt ตอนสร้าง instance
// const doc = new GoogleSpreadsheet('1067cbmgJm2qM0SHfaTV_17_6cyi9foOuQvc-o8RITiQ', jwt);

// // ✅ จากนั้นโหลดข้อมูล
// await doc.loadInfo();

// console.log(`📄 ชื่อ Spreadsheet: ${doc.title}`);
// test.js



// ใช้ Key ใหม่ล่าสุดที่เราเพิ่งสร้างและเปลี่ยนชื่อ
// const credentials = require('./google-sheet-api.json'); 

// !!! สำคัญ: ใส่ ID ของ Sheet ใหม่ที่คุณเพิ่งสร้างในขั้นตอนที่ 2 ตรงนี้ !!!
const SPREADSHEET_ID = "1067cbmgJm2qM0SHfaTV_17_6cyi9foOuQvc-o8RITiQ";

async function testConnection() {
  try {
    console.log('Attempting to connect with new key and new sheet...');

    const serviceAccountAuth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

    await doc.loadInfo(); // โหลดข้อมูลพื้นฐานของชีต

    console.log(`\n✅ SUCCESS! Connected to sheet with title: "${doc.title}"`);
    console.log('Everything is working correctly!');

  } catch (error) {
    console.error('\n❌ FAILED! The problem persists. Error details:');
    console.error(error);
  }
}

testConnection();