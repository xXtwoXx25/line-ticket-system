# LINE Bot Machine Installation Ticket System

Full-stack application for managing machine installation tickets via LINE LIFF and an Admin Dashboard.

## 🛠 Tech Stack
- **Frontend**: React, Vite, TailwindCSS (v4), `@line/liff`, `axios`, `react-router-dom`
- **Backend**: Node.js, Express, MongoDB (Mongoose), `@line/bot-sdk`
- **Architecture**: Clean Architecture Pattern

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or MongoDB Atlas)
- LINE Developer Account (Messaging API channel & LIFF channel)

### 2. LINE Channel Setup
1. ไปที่ [LINE Developers Console](/https://developers.line.biz)
2. สร้าง Provider ใหม่ และสร้าง Channel 2 ประเภท:
   - **Messaging API** (สำหรับ Bot)
   - **LINE Login** (สำหรับ LIFF)
3. ในส่วน **Messaging API**:
   - Issue **Channel access token** (long-lived)
   - คัดลอก **Channel secret** (แท็บ Basic settings)
   - ตั้งค่า Webhook URL เป็น `https://<your-domain>/api/webhook` (ใช้ ngrok หากรันในเครื่อง)
4. ในส่วน **LINE Login** (แท็บ LIFF):
   - เพิ่ม LIFF App กำหนด Size เป็น `Full`
   - Endpoint URL กำหนดเป็น `https://<your-domain>/liff`
   - เปิดใช้งาน `chat_message.write` scope
   - คัดลอก **LIFF ID**

### 3. Backend Setup
1. เปิด Terminal เข้าไปที่โฟลเดอร์ `backend/`
```bash
cd backend
npm install
```
2. แก้ไขไฟล์ `.env` โดยใส่ข้อมูลตามจริง:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/line-bot-ticket
LINE_CHANNEL_ACCESS_TOKEN=YOUR_CHANNEL_ACCESS_TOKEN
LINE_CHANNEL_SECRET=YOUR_CHANNEL_SECRET
LIFF_ID=YOUR_LIFF_ID
FRONTEND_URL=http://localhost:5173
```
3. สั่งรัน Backend
```bash
# สำหรับ Development (ถ้าลง nodemon ไว้) หรือใช้ node
node index.js
```

### 4. Frontend Setup
1. เปิด Terminal เข้าไปที่โฟลเดอร์ `frontend/`
```bash
cd frontend
npm install
```
2. แก้ไขไฟล์ `.env` โดยใส่ข้อมูลตามจริง:
```env
VITE_LIFF_ID=YOUR_LIFF_ID
VITE_API_URL=http://localhost:5000/api
```
3. สั่งรัน Frontend
```bash
npm run dev
```

### 5. การทดสอบการใช้งาน
1. **สำหรับ User**:
   - เพิ่ม Bot เป็นเพื่อน หรือดึงเข้ากลุ่ม
   - พิมพ์ข้อความว่า `นกเหลือง` ในแชท
   - Bot จะตอบกลับ Flex Message พร้อมปุ่ม "ติดตั้ง"
   - กดปุ่มเพื่อเปิด LIFF Form
   - กรอกข้อมูลให้ครบถ้วนแล้วกดยืนยัน
   - ข้อมูลจะถูกบันทึก และ Bot จะส่ง Flex Message ยืนยันเข้ากลุ่ม

2. **สำหรับ Admin**:
   - เปิดเบราว์เซอร์ไปที่ `http://localhost:5173/admin`
   - จะพบรายการ Ticket ทั้งหมดที่ถูกเปิด
   - สามารถค้นหา, กรองสถานะ, ดูรายละเอียด, หรือลบข้อมูลได้

---

## 📂 Folder Structure

```text
📁 backend/
 ┣ 📁 src/
 ┃ ┣ 📁 config/     # Database configuration
 ┃ ┣ 📁 controllers/# API request handlers (Tickets, Webhook)
 ┃ ┣ 📁 models/     # Mongoose Schemas
 ┃ ┣ 📁 routes/     # Express routers
 ┃ ┣ 📁 services/   # LINE SDK integration
 ┃ ┗ 📁 utils/      # Helpers (Generate Ticket No)
 ┣ 📄 index.js      # App entry point
 ┣ 📄 .env          # Environment Variables
 ┗ 📄 package.json  # Dependencies

📁 frontend/
 ┣ 📁 src/
 ┃ ┣ 📁 components/ # Reusable UI components
 ┃ ┣ 📁 pages/      # Page components (LiffForm, AdminDashboard)
 ┃ ┣ 📁 services/   # API requests (Axios)
 ┃ ┣ 📄 App.jsx     # Routing configuration
 ┃ ┣ 📄 index.css   # TailwindCSS v4 imports and themes
 ┃ ┗ 📄 main.jsx    # React entry point
 ┣ 📄 index.html
 ┣ 📄 .env          # Environment Variables
 ┣ 📄 vite.config.js# Vite configuration
 ┗ 📄 package.json  # Dependencies
```
