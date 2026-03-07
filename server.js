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
const SERVICE_ID_4 = process.env.SERVICE_ID_4;
const SERVICE_ID_5 = process.env.SERVICE_ID_5;

// =====================
// ENABLE
// =====================
const ENABLE_SERVICE_1 = !!SERVICE_ID;
const ENABLE_SERVICE_2 = !!SERVICE_ID_2;
const ENABLE_SERVICE_3 = !!SERVICE_ID_3;
const ENABLE_SERVICE_4 = !!SERVICE_ID_4;
const ENABLE_SERVICE_5 = !!SERVICE_ID_5;

// =====================
// TOTALS
// =====================
let total1 = 0;
let total2 = 0;
let total3 = 0;
let total4 = 0;
let total5 = 0;

// =====================
// DAILY LIMITS
// =====================
let limit2 = rand(1000,1200);
let limit4 = rand(1000,1200);
let limit5 = rand(1000,1200);

// =====================
// NEXT RUN
// =====================
let next1 = null;
let next2 = null;

// =====================
// RANDOM
// =====================
function rand(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

// =====================
// SMART DELAY
// =====================
function smartDelay(total,limit){
  const remaining = Math.max(limit-total,1);
  const avgOrder = 20;
  const ordersLeft = Math.max(Math.floor(remaining/avgOrder),1);
  const minutesPassed = new Date().getHours()*60 + new Date().getMinutes();
  const minutesLeft = Math.max(1440-minutesPassed,1);
  const ideal = Math.floor(minutesLeft/ordersLeft);
  return rand(Math.max(ideal-5,1),ideal+5);
}

// =====================
// RESET DAILY
// =====================
function resetDaily(){
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24,0,0,0);
  const ms = midnight-now;

  setTimeout(()=>{
    total1=0;
    total2=0;
    total3=0;
    total4=0;
    total5=0;

    limit2 = rand(1000,1200);
    limit4 = rand(1000,1200);
    limit5 = rand(1000,1200);

    console.log("Daily reset");

    resetDaily();
  },ms);
}

// =====================
// SERVICE FUNCTIONS
// =====================
async function service1(){
  if(!ENABLE_SERVICE_1){
    schedule1(rand(5,15));
    return;
  }

  const quantity = rand(10,20);

  try{
    await axios.post(API_URL,{
      key:API_KEY,
      action:"add",
      service:SERVICE_ID,
      link:LINK,
      quantity
    });
    total1+=quantity;
    console.log("S1",quantity,"Total:",total1);
  }catch(e){
    console.log("S1 error");
  }

  schedule1(rand(5,15));
}

async function service2(){
  if(!ENABLE_SERVICE_2){
    schedule2(rand(7,15));
    return;
  }

  const quantity = rand(10,30);

  try{
    await axios.post(API_URL,{
      key:API_KEY,
      action:"add",
      service:SERVICE_ID_2,
      link:LINK,
      quantity
    });
    total2+=quantity;
    console.log("S2",quantity,"Total:",total2,"/",limit2);
  }catch(e){
    console.log("S2 error");
  }

  schedule2(smartDelay(total2,limit2));
}

async function service3(){
  if(!ENABLE_SERVICE_3) return;

  const quantity = rand(10,20);

  try{
    await axios.post(API_URL,{
      key:API_KEY,
      action:"add",
      service:SERVICE_ID_3,
      link:LINK,
      quantity
    });
    total3+=quantity;
    console.log("S3",quantity,"Total:",total3);
  }catch(e){
    console.log("S3 error");
  }
}

async function service4(){
  if(!ENABLE_SERVICE_4) return;

  const quantity = rand(10,30);

  try{
    await axios.post(API_URL_2,{
      key:API_KEY_2,
      action:"add",
      service:SERVICE_ID_4,
      link:LINK,
      quantity
    });
    total4+=quantity;
    console.log("S4",quantity,"Total:",total4,"/",limit4);
  }catch(e){
    console.log("S4 error");
  }
}

async function service5(){
  if(!ENABLE_SERVICE_5) return;

  const quantity = rand(10,30);

  try{
    await axios.post(API_URL_2,{
      key:API_KEY_2,
      action:"add",
      service:SERVICE_ID_5,
      link:LINK,
      quantity
    });
    total5+=quantity;
    console.log("S5",quantity,"Total:",total5,"/",limit5);
  }catch(e){
    console.log("S5 error");
  }
}

// =====================
// SCHEDULERS
// =====================
function schedule1(min){
  const delay = min*60*1000;
  next1 = new Date(Date.now()+delay);

  if(ENABLE_SERVICE_3){
    setTimeout(service3,delay*2);
  }

  setTimeout(service1,delay);
}

function schedule2(min){
  const delay = min*60*1000;
  next2 = new Date(Date.now()+delay);

  if(ENABLE_SERVICE_4){
    const d4 = rand(Math.floor(delay*0.1), Math.floor(delay*0.9));
    setTimeout(service4,d4);
  }

  if(ENABLE_SERVICE_5){
    const d5 = rand(Math.floor(delay*0.2), Math.floor(delay));
    setTimeout(service5,d5);
  }

  setTimeout(service2,delay);
}

// =====================
// ROUTES
// =====================
app.get("/",(req,res)=>{
  res.send("Bot running");
});

app.get("/status",(req,res)=>{
  res.json({
    service1:total1,
    service2:{total:total2,target:limit2},
    service3:total3,
    service4:{total:total4,target:limit4},
    service5:{total:total5,target:limit5}
  });
});

// =====================
// START SERVER
// =====================
app.listen(PORT,()=>{
  console.log("Server started");

  resetDaily();

  schedule1(rand(3,5));
  schedule2(rand(3,5));
});
