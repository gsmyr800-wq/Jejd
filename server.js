const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// الإعدادات من الـ ENV
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const LINK = process.env.LINK;       // الرابط الأساسي
const LINK_BOT = process.env.LINK_BOT; // رابط البوت

// معرفات الخدمات الثلاث المطلوبة
const SERVICES = [
    { id: process.env.SERVICE_ID_1, target: LINK },     // خدمة 1 (ستارت)
    { id: process.env.SERVICE_ID_2, target: LINK_BOT }, // خدمة 2 (بوت)
    { id: process.env.SERVICE_ID_3, target: LINK_BOT }  // خدمة 3 (بوت)
];

// مساعد التوقيت العشوائي
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// دالة تنفيذ الطلب
async function placeOrder() {
    // اختيار خدمة عشوائية من الـ 3 خدمات
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const quantity = randomBetween(10, 20); // كمية عشوائية بين 10 و 25

    try {
        await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: service.id,
            link: service.target,
            quantity: quantity
        });
        console.log(`تم طلب خدمة ${service.id} بكمية ${quantity} للرابط ${service.target}`);
    } catch (e) {
        console.error("خطأ في الطلب:", e.message);
    }

    // الانتظار لفترة عشوائية بين 10 إلى 40 دقيقة قبل الطلب التالي
    const nextDelay = randomBetween(10, 25) * 60 * 1000;
    setTimeout(placeOrder, nextDelay);
}

app.get("/", (req, res) => res.send("Bot System Active"));

app.listen(PORT, () => {
    console.log("نظام السلوك البشري يعمل الآن...");
    placeOrder(); // بدء الحلقة
});
