const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// إعدادات البيئة
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const LINK = process.env.LINK;
const LINK_BOT = process.env.LINK_BOT;

// فصلنا الخدمات لمجموعتين لتشتغل بشكل متزامن (تتزامن بدون مشاكل)
const REACTION_SERVICES = [
    { id: process.env.SERVICE_ID_1, target: LINK_BOT, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_2, target: LINK, sent: 0, targetDaily: 0 }
];

const START_SERVICES = [
    { id: process.env.SERVICE_ID_3, target: LINK_BOT, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_4, target: LINK, sent: 0, targetDaily: 0 }
];

let currentDay = new Date().getDate();

// دالة عشوائية
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// توزيع الأهداف اليومية بشكل مستقل لكل مجموعة
function generateDailyTargets() {
    // 1. توزيع خدمات التفاعل (تارجت تقريبي 1000)
    let totalReactions = random(950, 1100);
    REACTION_SERVICES[0].targetDaily = Math.floor(totalReactions / 2) + random(-50, 50);
    REACTION_SERVICES[1].targetDaily = totalReactions - REACTION_SERVICES[0].targetDaily;
    REACTION_SERVICES.forEach(s => s.sent = 0);

    // 2. توزيع خدمات الستارت (تارجت تقريبي 500)
    let totalStarts = random(480, 550);
    START_SERVICES[0].targetDaily = Math.floor(totalStarts / 2) + random(-30, 30);
    START_SERVICES[1].targetDaily = totalStarts - START_SERVICES[0].targetDaily;
    START_SERVICES.forEach(s => s.sent = 0);

    console.log(`[${new Date().toLocaleDateString()}] New Targets - Reactions: ~${totalReactions}, Starts: ~${totalStarts}`);
}

generateDailyTargets();

// حساب "مضاعف النشاط" لمحاكاة اليوم البشري بشكل واقعي
function getActivityWeight() {
    const hour = new Date().getHours();
    if (hour >= 1 && hour <= 7) return random(2, 4) / 10;     // نوم
    if (hour >= 8 && hour <= 12) return random(8, 10) / 10;   // صباح
    if (hour >= 13 && hour <= 18) return random(10, 12) / 10; // ظهيرة
    if (hour >= 19 && hour <= 23) return random(13, 16) / 10; // ذروة مسائية
    return 1.0;
}

// حساب التأخير القادم بناءً على نوع المجموعة لضبط الوصول للتارجت
function getNextDelay(groupType) {
    const weight = getActivityWeight();
    
    // التفاعل يحتاج عدد طلبات أكثر للوصول لـ 1000 (تأخير أقل)
    // الستارت يحتاج طلبات أقل للوصول لـ 500 (تأخير أكثر)
    let minBase = groupType === 'Reactions' ? 15 : 35;
    let maxBase = groupType === 'Reactions' ? 35 : 65;
    
    const baseDelay = random(minBase, maxBase) * 60 * 1000; 
    const adjustedDelay = baseDelay / weight;
    const jitter = adjustedDelay * (Math.random() * 0.3 - 0.15); // تذبذب 15%
    
    return adjustedDelay + jitter;
}

// اختيار الخدمة بذكاء 
function pickBestService(servicesArray) {
    const hour = new Date().getHours();
    const dayProgress = (hour + 1) / 24; 

    const available = servicesArray.filter(s => {
        const serviceProgress = s.sent / s.targetDaily;
        return serviceProgress < 1 && serviceProgress <= (dayProgress + 0.15);
    });

    if (available.length === 0) return servicesArray.find(s => s.sent < s.targetDaily) || null;
    return available[random(0, available.length - 1)];
}

// المعالج الأساسي الذي سيعمل كـ Loop لكل مجموعة بشكل منفصل
async function executeGroupTask(servicesArray, groupType) {
    const today = new Date().getDate();
    if (today !== currentDay) {
        currentDay = today;
        generateDailyTargets();
    }

    const service = pickBestService(servicesArray);

    if (!service) {
        console.log(`[${groupType}] All limits reached for now. Resting for 30 mins...`);
        setTimeout(() => executeGroupTask(servicesArray, groupType), 30 * 60 * 1000);
        return;
    }

    // الكمية الأساسية
    let quantity = random(10, 22); 
    if (Math.random() < 0.15) quantity = random(25, 35); // قفزة نشاط مفاجئة 15%

    const remaining = service.targetDaily - service.sent;
    
    // ضبط الكمية بحيث لا تقل أبدًا عن 10 حتى لو تجاوزنا التارجت (لأنه بدون حد أعلى)
    if (quantity > remaining && remaining >= 10) {
        quantity = remaining;
    } else if (remaining < 10) {
        quantity = 10; // ضمان أقل حد للأوردر
    }

    try {
        await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: service.id,
            link: service.target,
            quantity: quantity
        });

        service.sent += quantity;
        console.log(`[${new Date().toLocaleTimeString()}] [${groupType}] Service ${service.id}: +${quantity} (Total: ${service.sent}/${service.targetDaily})`);
    } catch (err) {
        console.error(`[${groupType}] API Error:`, err.message);
    }

    // جدولة المهمة القادمة لهذه المجموعة
    const delay = getNextDelay(groupType);
    const nextInMinutes = (delay / 60000).toFixed(1);
    console.log(`[${groupType}] Next action in ${nextInMinutes} minutes...`);
    setTimeout(() => executeGroupTask(servicesArray, groupType), delay);
}

// عرض الحالة في المتصفح
app.get("/", (req, res) => {
    let stats = "";
    let totalSentReacts = 0, totalTargetReacts = 0;
    let totalSentStarts = 0, totalTargetStarts = 0;

    REACTION_SERVICES.forEach(s => { 
        totalSentReacts += s.sent; totalTargetReacts += s.targetDaily; 
        stats += `R(${s.id}): ${s.sent}/${s.targetDaily} | `; 
    });
    
    START_SERVICES.forEach(s => { 
        totalSentStarts += s.sent; totalTargetStarts += s.targetDaily; 
        stats += `S(${s.id}): ${s.sent}/${s.targetDaily} | `; 
    });
    
    res.send(`
        <h3>Engine Running</h3>
        <p><b>Reactions (1, 2):</b> ${totalSentReacts} / ${totalTargetReacts}</p>
        <p><b>Starts (3, 4):</b> ${totalSentStarts} / ${totalTargetStarts}</p>
        <p><b>Detailed Services:</b> ${stats}</p>
    `);
});

app.listen(PORT, () => {
    console.log(`System Online on port ${PORT}`);
    
    // تشغيل مسار التفاعل
    executeGroupTask(REACTION_SERVICES, 'Reactions');
    
    // تشغيل مسار الستارت بعد تأخير بسيط 5 ثوانٍ لمنع إرسال طلبين في نفس اللحظة عند الإقلاع
    setTimeout(() => {
        executeGroupTask(START_SERVICES, 'Starts');
    }, 5000);
});
