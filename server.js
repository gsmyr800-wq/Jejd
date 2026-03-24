const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات البيئة
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const LINK = process.env.LINK;
const LINK_BOT = process.env.LINK_BOT;

const SERVICES = [
    { id: process.env.SERVICE_ID_1, target: LINK_BOT, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_2, target: LINK, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_3, target: LINK_BOT, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_4, target: LINK, sent: 0, targetDaily: 0 }
];

let currentDay = new Date().getDate();

// دالة عشوائية محسنة
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateDailyTargets() {
    SERVICES.forEach(s => {
        s.sent = 0;
        s.targetDaily = random(430, 620);
    });
    console.log(`[${new Date().toLocaleDateString()}] New Targets Generated.`);
}

generateDailyTargets();

// حساب "مضاعف النشاط" بناءً على الساعة لضمان التوزيع البشري
function getActivityWeight() {
    const hour = new Date().getHours();
    // تقليل النشاط جداً وقت الفجر، وزيادته تدريجياً في المساء
    if (hour >= 1 && hour <= 6) return random(2, 5) / 10;   // 0.2 - 0.5 (خمول)
    if (hour >= 7 && hour <= 11) return random(7, 9) / 10;  // 0.7 - 0.9 (بداية نشاط)
    if (hour >= 12 && hour <= 17) return 1.0;               // 1.0 (نشاط عادي)
    if (hour >= 18 && hour <= 23) return random(12, 15) / 10; // 1.2 - 1.5 (ذروة)
    return 0.8;
}

// حساب التأخير القادم بشكل ديناميكي جداً
function getNextDelay() {
    const weight = getActivityWeight();
    // الأساس بين 3 إلى 10 دقائق
    const baseDelay = random(3, 10) * 60 * 1000; 
    // عكس الوزن: إذا كان الوزن عالياً (ذروة)، يقل التأخير (سرعة تنفيذ)
    const adjustedDelay = baseDelay / weight;
    // إضافة تذبذب عشوائي بسيط (Jitter) بنسبة 15%
    const jitter = adjustedDelay * (Math.random() * 0.3 - 0.15);
    
    return adjustedDelay + jitter;
}

// اختيار الخدمة التي تحتاج "دعم" حالياً (أقل واحدة وصلت لهدفها النسبي)
function pickBestService() {
    const hour = new Date().getHours();
    const dayProgress = (hour + 1) / 24; // نسبة الوقت المنقضي من اليوم

    const available = SERVICES.filter(s => {
        const serviceProgress = s.sent / s.targetDaily;
        // لا تختار الخدمة إذا سبقت الجدول الزمني اليومي بشكل كبير جداً
        return serviceProgress < 1 && serviceProgress <= (dayProgress + 0.1);
    });

    if (available.length === 0) return SERVICES.find(s => s.sent < s.targetDaily) || null;

    // خلط عشوائي للخدمات المتاحة ثم اختيار واحدة
    return available[random(0, available.length - 1)];
}

async function executeTask() {
    const today = new Date().getDate();
    if (today !== currentDay) {
        currentDay = today;
        generateDailyTargets();
    }

    const service = pickBestService();

    if (!service) {
        console.log("All services reached hourly/daily limit. Resting for 15 mins...");
        setTimeout(executeTask, 15 * 60 * 1000);
        return;
    }

    // تقليل الكمية في كل طلب لزيادة عدد الطلبات (تتابعية أكثر)
    let quantity = random(10, 17); 
    if (Math.random() < 0.1) quantity = random(20, 35); // قفزة عشوائية نادرة

    const remaining = service.targetDaily - service.sent;
    if (quantity > remaining) quantity = remaining;

    try {
        await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: service.id,
            link: service.target,
            quantity: quantity
        });

        service.sent += quantity;
        console.log(`[${new Date().toLocaleTimeString()}] Service ${service.id}: +${quantity} (Total: ${service.sent}/${service.targetDaily})`);
    } catch (err) {
        console.error("API Error:", err.message);
    }

    // جدولة المهمة القادمة بتأخير عشوائي
    const delay = getNextDelay();
    const nextInMinutes = (delay / 60000).toFixed(1);
    console.log(`Next action in ${nextInMinutes} minutes...`);
    setTimeout(executeTask, delay);
}

app.get("/", (req, res) => {
    const status = SERVICES.map(s => `${s.id}: ${s.sent}/${s.targetDaily}`).join(" | ");
    res.send(`Engine Running. Status: ${status}`);
});

app.listen(PORT, () => {
    console.log(`System Online on port ${PORT}`);
    executeTask();
});
