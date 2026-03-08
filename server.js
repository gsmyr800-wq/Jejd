const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// ENV
// =====================
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

const API_URL_2 = process.env.API_URL_2;
const API_KEY_2 = process.env.API_KEY_2;

const LINK = process.env.LINK;

const SERVICE_ID = process.env.SERVICE_ID;
const SERVICE_ID_2 = process.env.SERVICE_ID_2;
const SERVICE_ID_3 = process.env.SERVICE_ID_3;

// =====================
// SETTINGS
// =====================
const DAILY_TARGET = 1000;
const MIN_Q = 10;
const MAX_Q = 20;

// =====================
// TOTALS
// =====================
let total1 = 0;
let total2 = 0;
let total3 = 0;

let next1 = null;
let next2 = null;
let next3 = null;

// =====================
// HELPERS
// =====================
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24,0,0,0);
  return midnight - now;
}

function resetDaily() {
  setTimeout(() => {
    total1 = 0;
    total2 = 0;
    total3 = 0;

    console.log("Daily reset");

    resetDaily();
  }, msUntilMidnight());
}

function calculateDelay(total) {

  const remaining = DAILY_TARGET - total;

  if (remaining <= 0) return 60 * 60 * 1000;

  const timeLeft = msUntilMidnight();

  const estimatedOrders = remaining / ((MIN_Q + MAX_Q) / 2);

  const delay = timeLeft / estimatedOrders;

  const randomFactor = randomBetween(80,120) / 100;

  return delay * randomFactor;
}

// =====================
// SERVICE 1
// =====================
async function service1() {

  if (!SERVICE_ID) return;

  if (total1 >= DAILY_TARGET) return;

  const quantity = randomBetween(MIN_Q, MAX_Q);

  try {

    await axios.post(API_URL,{
      key: API_KEY,
      action:"add",
      service:SERVICE_ID,
      link:LINK,
      quantity
    });

    total1 += quantity;

    console.log("Service1:",quantity,"Total:",total1);

  } catch(err){
    console.log("Service1 Error:",err.message);
  }

  const delay = calculateDelay(total1);

  next1 = new Date(Date.now()+delay);

  setTimeout(service1,delay);
}

// =====================
// SERVICE 2 (منصة ثانية)
// =====================
async function service2() {

  if (!SERVICE_ID_2) return;

  if (total2 >= DAILY_TARGET) return;

  const quantity = randomBetween(MIN_Q, MAX_Q);

  try {

    await axios.post(API_URL_2,{
      key:API_KEY_2,
      action:"add",
      service:SERVICE_ID_2,
      link:LINK,
      quantity
    });

    total2 += quantity;

    console.log("Service2:",quantity,"Total:",total2);

  } catch(err){
    console.log("Service2 Error:",err.message);
  }

  const delay = calculateDelay(total2);

  next2 = new Date(Date.now()+delay);

  setTimeout(service2,delay);
}

// =====================
// SERVICE 3
// =====================
async function service3() {

  if (!SERVICE_ID_3) return;

  if (total3 >= DAILY_TARGET) return;

  const quantity = randomBetween(MIN_Q, MAX_Q);

  try {

    await axios.post(API_URL,{
      key:API_KEY,
      action:"add",
      service:SERVICE_ID_3,
      link:LINK,
      quantity
    });

    total3 += quantity;

    console.log("Service3:",quantity,"Total:",total3);

  } catch(err){
    console.log("Service3 Error:",err.message);
  }

  const delay = calculateDelay(total3);

  next3 = new Date(Date.now()+delay);

  setTimeout(service3,delay);
}

// =====================
// ROUTES
// =====================
app.get("/",(req,res)=>{
  res.send("Bot running");
});

app.get("/status",(req,res)=>{

  res.json({
    service1:{total:total1,next:next1},
    service2:{total:total2,next:next2},
    service3:{total:total3,next:next3}
  });

});

// =====================
// START
// =====================
app.listen(PORT,()=>{

  console.log("Server running on",PORT);

  resetDaily();

  service1();
  service2();
  service3();

});
