# ระบบจัดการคำขอติดตั้งเครื่องผ่าน LINE Bot (Machine Installation Ticket System)

## รายละเอียดโครงการ

ระบบจัดการคำขอติดตั้งเครื่องผ่าน LINE Bot และ Admin Dashboard สำหรับติดตามและบริหารจัดการรายการติดตั้งเครื่อง

ผู้ใช้งานสามารถส่งคำขอติดตั้งผ่าน LINE ได้อย่างสะดวก ขณะที่ผู้ดูแลระบบสามารถตรวจสอบ ติดตาม และอัปเดตสถานะงานผ่านหน้าเว็บได้แบบเรียลไทม์

โครงการนี้จัดทำขึ้นเพื่อใช้เป็นผลงานประกอบการสมัครฝึกงานในตำแหน่ง Software Engineer

---

## ความสามารถของระบบ

### ฝั่งผู้ใช้งาน (LINE Bot)

* เข้าสู่ระบบด้วย LINE
* กรอกข้อมูลคำขอติดตั้งเครื่อง
* ระบุรายละเอียดเครื่องจักร
* ระบุสถานที่ติดตั้ง
* ส่งคำขอติดตั้งเข้าสู่ระบบ
* ติดตามสถานะการดำเนินงาน

### ฝั่งผู้ดูแลระบบ (Admin Dashboard)

* ดูรายการคำขอติดตั้งทั้งหมด
* ดูรายละเอียดของแต่ละรายการ
* อัปเดตสถานะงาน
* ลบรายการคำขอ
* ติดตามงานติดตั้งที่อยู่ระหว่างดำเนินการ

---

## เทคโนโลยีที่ใช้

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* LINE LIFF SDK

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* LINE Messaging API

### Deployment

* Render
* MongoDB Atlas

---

## โครงสร้างการทำงานของระบบ

```text
ผู้ใช้งาน
    │
    ▼
LINE Bot / LIFF
    │
    ▼
Frontend (React)
    │
    ▼
Backend API (Express)
    │
    ▼
MongoDB Atlas
```

---

## การติดตั้งระบบ

### Clone Project

```bash
git clone https://github.com/xXtwoXx25/line-ticket-system
cd line-ticket-system
```

### ติดตั้ง Backend

```bash
cd backend
npm install
npm run dev
```

### ติดตั้ง Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API หลักของระบบ

### จัดการ Ticket

| Method | Endpoint                | รายละเอียด      |
| ------ | ----------------------- | --------------- |
| POST   | /api/tickets            | สร้าง Ticket    |
| GET    | /api/tickets            | ดูรายการทั้งหมด |
| GET    | /api/tickets/:id        | ดูรายละเอียด    |
| PUT    | /api/tickets/:id/status | เปลี่ยนสถานะ    |
| DELETE | /api/tickets/:id        | ลบรายการ        |

### LINE Webhook

| Method | Endpoint     |
| ------ | ------------ |
| POST   | /api/webhook |

---

## โครงสร้างโปรเจกต์

```text
line-ticket-system
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│   └── assets
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── services
│   └── config
│
└── README.md
```

---

## การใช้งาน

1. เพิ่มเพื่อน LINE Bot
2. เข้าสู่ระบบผ่าน LINE
3. กรอกข้อมูลคำขอติดตั้งเครื่อง
4. ส่งข้อมูลเข้าสู่ระบบ
5. ผู้ดูแลระบบตรวจสอบผ่าน Admin Dashboard
6. อัปเดตสถานะการดำเนินงาน
7. ผู้ใช้งานสามารถติดตามสถานะได้

---

## ลิงก์สำหรับทดสอบระบบ

### LINE Bot

LINE ID : @XXXXXXXX

### Frontend

https://line-ticket-system-frontend.onrender.com/

### Backend

https://line-ticket-system-backend.onrender.com/

---

## ผู้พัฒนา

นายสุชาครีย์ พันชมภู

นักศึกษาสาขาวิทยาการคอมพิวเตอร์ประยุกต์
คณะวิทยาศาสตร์
มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี (KMUTT)

---

## หมายเหตุ

โครงการนี้จัดทำขึ้นเพื่อใช้เป็นผลงานประกอบการสมัครฝึกงานและการเรียนรู้ด้านการพัฒนาระบบ Full Stack Web Application ร่วมกับ LINE Platform
