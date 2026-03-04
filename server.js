const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const SERVICE_ID = process.env.SERVICE_ID;
const LINK = process.env.LINK;

let dailyTotal = 0;
let nextRunTime = null;

// رقم عشوائي
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// إعادة تعيين يومي الساعة 12 ليلاً
function resetDailyCounter() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const timeUntilMidnight = midnight - now;

  setTimeout(() => {
    dailyTotal = 0;
    console.log("Daily counter reset");
    resetDailyCounter();
  }, timeUntilMidnight);
}

// إرسال الطلب
async function sendOrder() {

  if (dailyTotal >= 5000) {
    console.log("Daily limit reached (2000). Waiting for reset.");
    scheduleNext(30); // يفحص بعد 30 دقيقة
    return;
  }

  const quantity = randomBetween(10, 20);

  if (dailyTotal + quantity > 5000) {
    console.log("Skipping order to avoid exceeding daily limit.");
    scheduleNext(randomBetween(5,15));
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

    console.log("Sent:", quantity);
    console.log("Daily total:", dailyTotal);
    console.log("Response:", response.data);

  } catch (err) {
    console.error("Error:", err.message);
  }

  scheduleNext(randomBetween(5, 15));
}

// جدولة
function scheduleNext(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTime = new Date(Date.now() + delay);

  console.log("Next run in", minutes, "minutes");

  setTimeout(sendOrder, delay);
}

// صفحة رئيسية
app.get("/", (req, res) => {
  res.send("Bot is running...");
});

// حالة النظام
app.get("/status", (req, res) => {
  res.json({
    dailyTotal: dailyTotal,
    nextRun: nextRunTime
  });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  resetDailyCounter();
  scheduleNext(randomBetween(3,5)); // أول تشغيل سريع
});
