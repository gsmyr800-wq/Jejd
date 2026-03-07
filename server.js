const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// ENV
// =====================
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

const API_URL_2 = process.env.API_URL_2; // المنصة الثانية
const API_KEY_2 = process.env.API_KEY_2;

const LINK = process.env.LINK;

const SERVICE_ID = process.env.SERVICE_ID;
const SERVICE_ID_2 = process.env.SERVICE_ID_2;
const SERVICE_ID_3 = process.env.SERVICE_ID_3;
const SERVICE_ID_4 = process.env.SERVICE_ID_4;

// =====================
// ENABLE
// =====================
const ENABLE_SERVICE_1 = !!SERVICE_ID;
const ENABLE_SERVICE_2 = !!SERVICE_ID_2;
const ENABLE_SERVICE_3 = !!SERVICE_ID_3;
const ENABLE_SERVICE_4 = !!SERVICE_ID_4;

// =====================
// DAILY TOTALS
// =====================
let dailyTotal = 0;
let dailyTotalService2 = 0;
let dailyTotalService3 = 0;
let dailyTotalService4 = 0;

let nextRunTime = null;
let nextRunTimeService2 = null;

// =====================
// HELPERS
// =====================
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  if (!ENABLE_SERVICE_1) {
    scheduleNext(randomBetween(5, 15));
    return;
  }

  if (dailyTotal >= 5000) {
    scheduleNext(30);
    return;
  }

  const quantity = randomBetween(10, 20);
  if (dailyTotal + quantity > 5000) {
    scheduleNext(randomBetween(5, 15));
    return;
  }

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID,
      link: LINK,
      quantity
    });
    dailyTotal += quantity;
    console.log("Service 1 Sent:", quantity, "Total:", dailyTotal);
  } catch (err) {
    console.error("Service 1 Error:", err.message);
  }

  scheduleNext(randomBetween(5, 15));
}

// =====================
// SERVICE 2
// =====================
async function sendOrderService2() {
  if (!ENABLE_SERVICE_2) {
    scheduleNextService2(randomBetween(7, 15));
    return;
  }

  if (dailyTotalService2 >= 5000) {
    scheduleNextService2(30);
    return;
  }

  const quantity = randomBetween(10, 20);
  if (dailyTotalService2 + quantity > 5000) {
    scheduleNextService2(randomBetween(7, 15));
    return;
  }

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID_2,
      link: LINK,
      quantity
    });
    dailyTotalService2 += quantity;
    console.log("Service 2 Sent:", quantity, "Total:", dailyTotalService2);
  } catch (err) {
    console.error("Service 2 Error:", err.message);
  }

  scheduleNextService2(randomBetween(7, 15));
}

// =====================
// SERVICE 3
// =====================
async function sendOrderService3() {
  if (!ENABLE_SERVICE_3) return;
  if (dailyTotalService3 >= 5000) return;

  const quantity = randomBetween(10, 20);
  if (dailyTotalService3 + quantity > 5000) return;

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID_3,
      link: LINK,
      quantity
    });
    dailyTotalService3 += quantity;
    console.log("Service 3 Sent:", quantity, "Total:", dailyTotalService3);
  } catch (err) {
    console.error("Service 3 Error:", err.message);
  }
}

// =====================
// SERVICE 4 (منصة ثانية)
// =====================
async function sendOrderService4() {
  if (!ENABLE_SERVICE_4) return;
  if (dailyTotalService4 >= 5000) return;

  const quantity = randomBetween(10, 20);
  if (dailyTotalService4 + quantity > 5000) return;

  try {
    const response = await axios.post(API_URL_2, {
      key: API_KEY_2,
      action: "add",
      service: SERVICE_ID_4,
      link: LINK,
      quantity
    });
    dailyTotalService4 += quantity;
    console.log("Service 4 Sent:", quantity, "Total:", dailyTotalService4);
  } catch (err) {
    console.error("Service 4 Error:", err.message);
  }
}

// =====================
// SCHEDULERS
// =====================
function scheduleNext(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTime = new Date(Date.now() + delay);
  console.log("Service 1 next run in", minutes, "minutes");

  if (ENABLE_SERVICE_3) setTimeout(sendOrderService3, delay * 2);
  setTimeout(sendOrder, delay);
}

function scheduleNextService2(minutes) {
  const delay = minutes * 60 * 1000;
  nextRunTimeService2 = new Date(Date.now() + delay);
  console.log("Service 2 next run in", minutes, "minutes");

  // Service 4 تعمل بعد نصف وقت Service 2
  if (ENABLE_SERVICE_4) setTimeout(sendOrderService4, delay / 2);

  setTimeout(sendOrderService2, delay);
}

// =====================
// ROUTES
// =====================
app.get("/", (req, res) => res.send("Bot is running..."));

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
  scheduleNext(randomBetween(3, 5));
  scheduleNextService2(randomBetween(3, 5));
});
