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

// توزيع 1000 يومياً على كل الخدمات بشكل عشوائي ومترابط
function generateDailyTargets() {
    let remainingTotal = random(950, 1050); // توتل يومي متذبذب حول 1000 لإبعاد الشك
    let totalGenerated = 0;

    SERVICES.forEach((s, index) => {
        s.sent = 0;
        if (index === SERVICES.length - 1) {
            s.targetDaily = remainingTotal; // الخدمة الأخيرة تأخذ الباقي
        } else {
            // توزيع الباقي بشكل متقارب (الربع تقريباً مع نسبة تذبذب)
            let share = Math.floor(remainingTotal / (SERVICES.length - index)) + random(-30, 30);
            s.targetDaily = share;
            remainingTotal -= share;
        }
        totalGenerated += s.targetDaily;
    });
    console.log(`[${new Date().toLocaleDateString()}] New Targets Generated. Total Goal: ~${totalGenerated}`);
}

generateDailyTargets();

// حساب "مضاعف النشاط" لمحاكاة اليوم البشري بشكل واقعي
function getActivityWeight() {
    const hour = new Date().getHours();
    
    // من 1 ليلاً إلى 7 صباحاً: وقت نوم، نشاط بطيء جداً
    if (hour >= 1 && hour <= 7) return random(2, 4) / 10;     // 0.2 - 0.4
    // من 8 صباحاً إلى 12 ظهراً: بداية النشاط
    if (hour >= 8 && hour <= 12) return random(8, 10) / 10;   // 0.8 - 1.0
    // من 1 ظهراً إلى 6 مساءً: نشاط اعتيادي
    if (hour >= 13 && hour <= 18) return random(10, 12) / 10; // 1.0 - 1.2
    // من 7 مساءً إلى منتصف الليل: ذروة النشاط البشري
    if (hour >= 19 && hour <= 23) return random(13, 16) / 10; // 1.3 - 1.6
    
    return 1.0;
}

// حساب التأخير القادم (مبني على متوسط 25 دقيقة)
function getNextDelay() {
    const weight = getActivityWeight();
    
    // الأساس بين 15 إلى 35 دقيقة 
    const baseDelay = random(15, 35) * 60 * 1000; 
    
    // تقسيم التأخير على الوزن (يزيد التأخير وقت النوم، ويقل وقت الذروة)
    const adjustedDelay = baseDelay / weight;
    
    // تذبذب عشوائي (Jitter) بنسبة 15% يمنع تحديد نمط ثابت للروبوت
    const jitter = adjustedDelay * (Math.random() * 0.3 - 0.15);
    
    return adjustedDelay + jitter;
}

// اختيار الخدمة بذكاء بناءً على نسبة الإنجاز والوقت
function pickBestService() {
    const hour = new Date().getHours();
    const dayProgress = (hour + 1) / 24; 

    const available = SERVICES.filter(s => {
        const serviceProgress = s.sent / s.targetDaily;
        return serviceProgress < 1 && serviceProgress <= (dayProgress + 0.15); // مساحة أوسع قليلاً للتقدم
    });

    if (available.length === 0) return SERVICES.find(s => s.sent < s.targetDaily) || null;

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
        console.log("All services reached their current limits. Resting for 20 mins...");
        setTimeout(executeTask, 20 * 60 * 1000);
        return;
    }

    // الكمية: الأقل 10، وتتأرجح للوصول للهدف بشكل طبيعي
    let quantity = random(10, 22); 
    if (Math.random() < 0.15) quantity = random(25, 35); // 15% فرصة لقفزة نشاط مفاجئة

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

    // جدولة المهمة القادمة
    const delay = getNextDelay();
    const nextInMinutes = (delay / 60000).toFixed(1);
    console.log(`Next action in ${nextInMinutes} minutes...`);
    setTimeout(executeTask, delay);
}

app.get("/", (req, res) => {
    let totalSent = 0;
    let totalTarget = 0;
    const status = SERVICES.map(s => {
        totalSent += s.sent;
        totalTarget += s.targetDaily;
        return `${s.id}: ${s.sent}/${s.targetDaily}`;
    }).join(" | ");
    
    res.send(`Engine Running.<br>Total Progress: ${totalSent}/${totalTarget}<br>Services: ${status}`);
});

app.listen(PORT, () => {
    console.log(`System Online on port ${PORT}`);
    executeTask();
});
