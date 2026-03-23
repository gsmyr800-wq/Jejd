const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// الإعدادات من الـ ENV
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const LINK = process.env.LINK;       
const LINK_BOT = process.env.LINK_BOT;

// توزيع الخدمات حسب طلبك:
// 1 و 3 توجيه للتفاعل (LINK_BOT)
// 2 و 4 توجيه للستارت (LINK)
const SERVICES = [
    { id: process.env.SERVICE_ID_1, target: LINK_BOT }, // خدمة 1 (تفاعل)
    { id: process.env.SERVICE_ID_2, target: LINK },     // خدمة 2 (ستارت)
    { id: process.env.SERVICE_ID_3, target: LINK_BOT }, // خدمة 3 (تفاعل)
    { id: process.env.SERVICE_ID_4, target: LINK }      // خدمة 4 (ستارت)
];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// دالة تحديد وقت الانتظار بناءً على الساعة الحالية (سلوك بشري)
function getNextDelay() {
    const hour = new Date().getHours(); // توقيت السيرفر
    
    // من الساعة 2 بعد منتصف الليل حتى 9 صباحاً (وقت خمول بشري)
    if (hour >= 2 && hour <= 9) {
        console.log("--- وضع الخمول الليلي نشط الآن ---");
        return randomBetween(45, 90) * 60 * 1000; // تأخير طويل (45 إلى 90 دقيقة)
    } 
    
    // وقت النشاط الطبيعي (باقي اليوم)
    return randomBetween(6, 18) * 60 * 1000; // تأخير نشط (12 إلى 35 دقيقة)
}

async function placeOrder() {
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const quantity = randomBetween(10, 20); // الكمية المطلوبة 10-20

    try {
        await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: service.id,
            link: service.target,
            quantity: quantity
        });
        console.log(`[${new Date().toLocaleTimeString()}] طلب خدمة ${service.id} | كمية: ${quantity} | هدف: ${service.target}`);
    } catch (e) {
        console.error("خطأ في الطلب:", e.message);
    }

    const delay = getNextDelay();
    console.log(`الطلب القادم بعد ${Math.floor(delay / 60000)} دقيقة...`);
    setTimeout(placeOrder, delay);
}

app.get("/", (req, res) => res.send("System Active with Human Simulation"));

app.listen(PORT, () => {
    console.log("نظام السلوك البشري المتطور يعمل الآن...");
    console.log("توزيع الخدمات: 2 ستارت | 2 تفاعل");
    placeOrder(); 
});
