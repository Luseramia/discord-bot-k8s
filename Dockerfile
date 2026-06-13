# Base image ใช้ Node.js เวอร์ชัน LTS
FROM node:lts-alpine3.22

# ตั้ง working directory
WORKDIR /usr/src/app

# คัดลอก package.json และ package-lock.json ก่อน (เพื่อ cache install)
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install --production


RUN apk add --no-cache curl
# คัดลอก source code ทั้งหมดเข้ามาใน container
COPY . .

# ใส่ environment variable ที่ต้องการ (เช่น token, clientID)
# แนะนำให้ใช้ docker run -e TOKEN=xxx แทนการ hardcode
ENV NODE_ENV=production

# คำสั่งเริ่มรัน bot
CMD [ "node", "index.js" ]

