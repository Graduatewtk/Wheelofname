# 🎯 วงล้อสุ่มชื่อนักเรียน (Classroom Wheel of Names)

เว็บแอปพลิเคชันวงล้อสุ่มชื่อนักเรียน สไตล์ **Wheel of Names** ที่ออกแบบมาสำหรับคุณครูและห้องเรียนโดยเฉพาะ **ไม่มีโฆษณา 100%** โหลดเร็ว สวยงามในโทนสี **ทอง ขาว ส้ม** พร้อมระบบเสียงสมจริง และระบบจัดการห้องเรียน

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

## ✨ คุณสมบัติเด่น (Features)

1. **🎨 ดีไซน์สวยงามและชัดเจน**:
   - โทนสีทอง ขาว ส้ม หรูหรา สดใส สบายตา
   - ตัวหนังสือขนาดใหญ่ อ่านง่ายชัดเจนจากหลังห้อง (Font: Quark / Prompt / Kanit)
   - ปรับขนาดฟอนต์บนวงล้ออัตโนมัติตามจำนวนรายชื่อ

2. **🎡 วงล้อฟิสิกส์สมจริง (Canvas 60fps)**:
   - การหมุนแบบมีแรงเฉื่อยและการชะลอความเร็ว (Deceleration easing)
   - เข็มชี้มีแอนิเมชันกระดอน (Pointer bounce) ตามซี่วงล้อ
   - สลับธีมสีวงล้อได้ 5 รูปแบบ (*ทอง-ส้ม, ห้องเรียนสดใส, พาสเทล, มิดไนท์โกลด์, สายรุ้ง*)

3. **🔊 ระบบเสียงเสมือนจริง (Web Audio API Synthesizer)**:
   - เสียงติ๊ก (Tick click) ตามจังหวะการหมุน โดยความถี่จะชะลอลงตามวงล้อ
   - เสียงประโคมเฉลิมฉลอง (Victory Fanfare) เมื่อได้ผู้โชคดี
   - ทำงานได้แบบ Offline 100% ไม่ต้องต่อเน็ตเพื่อดึงไฟล์เสียง

4. **👑 หน้าต่างประกาศผลผู้ชนะ & เอฟเฟกต์พลุ (Celebration Modal & Confetti)**:
   - พลุกระดาษเฉลิมฉลองเต็มหน้าจอ
   - ปุ่ม **"ลบชื่อนี้ออก" (Remove Name)** เพื่อไม่ให้สุ่มได้คนซ้ำในคาบเรียนเดียวกัน
   - ปุ่ม **"สุ่มต่อทันที" (Spin Again)** หมุนรอบต่อไปได้สะดวกรวดเร็ว

5. **🏫 ระบบจัดการห้องเรียนและรายชื่อ (Classroom & Roster Manager)**:
   - บันทึกแยกห้องเรียนได้ไม่จำกัด (เช่น ม.1/1, ม.1/2, ชุมนุม, เวรประจำวัน) บันทึกในเครื่องอัตโนมัติ (`localStorage`)
   - ปุ่มสลับตำแหน่งรายชื่อ (Shuffle)
   - ปุ่มเรียงตามตัวอักษร ก-ฮ / A-Z (Sort)
   - ปุ่มใส่เลขที่ 1-30 อัตโนมัติ
   - รองรับการนำเข้าไฟล์รายชื่อ (`.txt` หรือ `.csv`) และดาวน์โหลดไฟล์รายชื่อ

6. **📺 โหมดเต็มจอสำหรับห้องเรียน (Fullscreen Presentation Mode)**:
   - แสดงผลวงล้อขนาดใหญ่เต็มจอสำหรับขึ้นโปรเจกเตอร์หรือ Smart TV หน้าห้อง
   - รองรับการกดแป้น **Spacebar** เพื่อสั่งหมุนวงล้อทันที

---

## 🚀 วิธีนำขึ้น Vercel (How to Deploy to Vercel)

โปรเจกต์นี้รองรับการ Deploy บน Vercel ได้ทันที 100% โดยไม่ต้องตั้งค่า Build Command:

1. ล็อกอินเข้าสู่เว็บไซต์ [Vercel.com](https://vercel.com/)
2. กดปุ่ม **"Add New..."** ➔ เลือก **"Project"**
3. เลือกเชื่อมต่อกับ Repository: **`Graduatewtk/Wheelofname`**
4. ในหน้า Configure Project:
   - **Framework Preset**: เลือก `Other`
   - **Root Directory**: `./`
   - **Build and Output Settings**: เว้นว่างไว้ (ระบบเป็น Static Web App)
5. กดปุ่ม **"Deploy"** 🚀
6. รอประมาณ 10-20 วินาที จะได้รับ URL เว็บไซต์พร้อมใช้งานทันที เช่น `https://wheelofname-xxx.vercel.app`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
Wheelofname/
├── index.html        # โครงสร้างหน้าเว็บหลักและ Modal
├── style.css         # สไตล์ธีมสีทอง ขาว ส้ม และ Responsive Layout
├── js/
│   ├── audio.js      # Web Audio API Synth สำหรับเสียงคลิกและเสียงผู้ชนะ
│   ├── confetti.js   # Particle Engine พลุกระดาษเฉลิมฉลอง
│   ├── wheel.js      # วงล้อฟิสิกส์ Canvas 2D
│   └── app.js        # Controller จัดการข้อมูล, ห้องเรียน, Event, Storage
├── vercel.json       # ไฟล์ตั้งค่าความปลอดภัยและ Routing สำหรับ Vercel
├── package.json      # Metadata และคำสั่ง Start
├── README.md         # เอกสารคู่มือการใช้งาน
└── .gitignore
```

---

## 💻 การเปิดใช้งานในเครื่อง (Local Run)

คุณสามารถเปิดไฟล์ `index.html` บนเบราว์เซอร์ (Chrome, Edge, Safari, Firefox) เพื่อใช้งานได้ทันทีโดยไม่ต้องติดตั้งโปรแกรมเพิ่มเติม หรือใช้คำสั่ง:

```bash
# หากต้องการรันผ่าน Local Server
npx serve .
```

---

สร้างขึ้นเพื่อประโยชน์ทางการศึกษาสำหรับครูและนักเรียน 🌟
