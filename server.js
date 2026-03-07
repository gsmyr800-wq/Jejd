const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// متغيرات البيئة
// =====================
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const LINK = process.env.LINK;

const SERVICE_ID = process.env.SERVICE_ID;       // الخدمة 1
const SERVICE_ID_2 = process.env.SERVICE_ID_2;   // الخدمة 2
const SERVICE_ID_3 = process.env.SERVICE_ID_3;   // الخدمة 3 (موازية 1)
const SERVICE_ID_4 = process.env.SERVICE_ID_4;   // الخدمة 4 (موازية 2)

// =====================
// عدادات يومية
// =====================
let dailyTotal = 0;
let dailyTotalService2 = 0;
let dailyTotalService3 = 0;
let dailyTotalService4 = 0;

let nextRunTime = null;
let nextRunTimeService2 = null;

// =====================
// دوال مساعدة
// =====================

// رقم عشوائي بين min و max
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// إعادة تعيين العدادات يومياً عند منتصف الليل
function resetDailyCounter() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = midnight - now;

  setTimeout(() => {
    dailyTotal = 0;
    dailyTotalService2 = 0;
    dailyTotalService3 = 0;
    dailyTotalService4 = 0;
    console.log("Daily counters reset");
    resetDailyCounter();
  }, timeUntilMidnight);
}

// =====================
// SERVICE 1
// =====================
async function sendOrder() {
  if (dailyTotal >= 5000) {
    console.log("Service 1 daily limit reached. Waiting...");
    scheduleNext(30);
    return;
  }

  const quantity = randomBetween(10, 20);
  if (dailyTotal + quantity > 5000) {
    console.log("Service 1 skipping to avoid exceeding limit.");
    scheduleNext(randomBetween(5, 15));
    return;
  }

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID,
      link: LINK,
      quantity: quantity
    });

    dailyTotal += quantity;
    console.log("Service 1 Sent:", quantity);
    console.log("Service 1 Daily total:", dailyTotal);
    console.log("Service 1 Response:", response.data);
  } catch (err) {
    console.error("Service 1 Error:", err.message);
  }
}

// =====================
// SERVICE 2
// =====================
async function sendOrderService2() {
  if (dailyTotalService2 >= 5000) {
    console.log("Service 2 daily limit reached. Waiting...");
    scheduleNextService2(30);
    return;
  }

  const quantity = randomBetween(10, 20);
  if (dailyTotalService2 + quantity > 5000) {
    console.log("Service 2 skipping to avoid exceeding limit.");
    scheduleNextService2(randomBetween(7, 15));
    return;
  }

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID_2,
      link: LINK,
      quantity: quantity
    });

    dailyTotalService2 += quantity;
    console.log("Service 2 Sent:", quantity);
    console.log("Service 2 Daily total:", dailyTotalService2);
    console.log("Service 2 Response:", response.data);
  } catch (err) {
    console.error("Service 2 Error:", err.message);
  }
}

// =====================
// SERVICE 3 (موازية 1)
// =====================
async function sendOrderService3() {
  if (dailyTotalService3 >= 5000) {
    console.log("Service 3 daily limit reached.");
    return;
  }

  const quantity = randomBetween(10, 20);
  if (dailyTotalService3 + quantity > 5000) {
    console.log("Service 3 skipping to avoid exceeding limit.");
    return;
  }

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID_3,
      link: LINK,
      quantity: quantity
    });

    dailyTotalService3 += quantity;
    console.log("Service 3 Sent:", quantity);
    console.log("Service 3 Daily total:", dailyTotalService3);
    console.log("Service 3 Response:", response.data);
  } catch (err) {
    console.error("Service 3 Error:", err.message);
  }
}

// =====================
// SERVICE 4 (موازية 2)
// =====================
async function sendOrderService4() {
  if (dailyTotalService4 >= 5000) {
    console.log("Service 4 daily limit reached.");
    return;
  }

  const quantity = randomBetween(10, 20);
  if (dailyTotalService4 + quantity > 5000) {
    console.log("Service 4 skipping to avoid exceeding limit.");
    return;
  }

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID_4,
      link: LINK,
      quantity: quantity
    });

    dailyTotalService4 += quantity;
    console.log("Service 4 Sent:", quantity);
    console.log("Service 4 Daily total:", dailyTotalService4);
    console.log("Service 4 Response:", response.data);
  } catch (err) {
    console.error("Service 4 Error:", err.message);
  }
}

// =====================
// جدولة الخدمات مع نصف وقت التناوب
// =====================
function scheduleNext(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTime = new Date(Date.now() + delay);
  console.log("Service 1 next run in", minutes, "minutes");

  // شغّل Service 3 بعد ضعف الوقت
  setTimeout(sendOrderService3, delay * 2);

  setTimeout(sendOrder, delay);
}

function scheduleNextService2(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTimeService2 = new Date(Date.now() + delay);
  console.log("Service 2 next run in", minutes, "minutes");

  // شغّل Service 4 بعد نصف الوقت
  setTimeout(sendOrderService4, delay / 2);

  setTimeout(sendOrderService2, delay);
}

// =====================
// ROUTES
// =====================
app.get("/", (req, res) => {
  res.send("Bot is running...");
});

app.get("/status", (req, res) => {
  res.json({
    service1: { dailyTotal, nextRun: nextRunTime },
    service2: { dailyTotal: dailyTotalService2, nextRun: nextRunTimeService2 },
    service3: { dailyTotal: dailyTotalService3 },
    service4: { dailyTotal: dailyTotalService4 }
  });
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);

  resetDailyCounter();

  // تشغيل أولي سريع
  scheduleNext(randomBetween(3, 5));
  scheduleNextService2(randomBetween(3, 5));
});
