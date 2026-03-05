const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const SERVICE_ID = process.env.SERVICE_ID;
const SERVICE_ID_2 = process.env.SERVICE_ID_2;
const LINK = process.env.LINK;

let dailyTotal = 0;
let dailyTotalService2 = 0;

let nextRunTime = null;
let nextRunTimeService2 = null;

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
    dailyTotalService2 = 0;
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

  scheduleNext(randomBetween(5, 15));
}

function scheduleNext(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTime = new Date(Date.now() + delay);

  console.log("Service 1 next run in", minutes, "minutes");

  setTimeout(sendOrder, delay);
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
    scheduleNextService2(randomBetween(15, 40));
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

  scheduleNextService2(randomBetween(15, 40));
}

function scheduleNextService2(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTimeService2 = new Date(Date.now() + delay);

  console.log("Service 2 next run in", minutes, "minutes");

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
    service1: {
      dailyTotal: dailyTotal,
      nextRun: nextRunTime
    },
    service2: {
      dailyTotal: dailyTotalService2,
      nextRun: nextRunTimeService2
    }
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
  scheduleNextService2(randomBetween(15, 30));
});
