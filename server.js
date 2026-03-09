const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ENV
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

const API_URL_2 = process.env.API_URL_2;
const API_KEY_2 = process.env.API_KEY_2;

const LINK = process.env.LINK;
const LINK_BOT = process.env.LINK_BOT; // رابط البوت

const SERVICE_ID = process.env.SERVICE_ID; // service1
const SERVICE_ID_2 = process.env.SERVICE_ID_2; // service2
const SERVICE_ID_3 = process.env.SERVICE_ID_3; // service3
const SERVICE_ID_4 = process.env.SERVICE_ID_4; // service4
const SERVICE_ID_5 = process.env.SERVICE_ID_5; // service5

// ===== HELPERS =====
function randomBetween(min,max){
 return Math.floor(Math.random()*(max-min+1))+min;
}

function delay(min,max){
 return randomBetween(min,max)*60*1000;
}

// ============================
// SERVICE 1
// ============================
async function service1(){
 const quantity=randomBetween(10,20);
 try{
  await axios.post(API_URL,{
   key:API_KEY,
   action:"add",
   service:SERVICE_ID,
   link:LINK,
   quantity
  });
  console.log("Service1:",quantity);
 }catch(e){
  console.log("Service1 error",e.message);
 }
}

// ============================
// SERVICE 2 (منصة ثانية - مستقل)
// ============================
async function service2(){
 const quantity=randomBetween(10,17);
 try{
  await axios.post(API_URL_2,{
   key:API_KEY_2,
   action:"add",
   service:SERVICE_ID_2,
   link:LINK,
   quantity
  });
  console.log("Service2:",quantity);
 }catch(e){
  console.log("Service2 error",e.message);
 }
 setTimeout(service2,delay(20,45));
}

// ============================
// SERVICE 3
// ============================
async function service3(){
 const quantity=randomBetween(10,16);
 try{
  await axios.post(API_URL,{
   key:API_KEY,
   action:"add",
   service:SERVICE_ID_3,
   link:LINK,
   quantity
  });
  console.log("Service3:",quantity);
 }catch(e){
  console.log("Service3 error",e.message);
 }
}

// ============================
// SERVICE 4 (منصة ثانية - رابط البوت)
// ============================
async function service4(){
 const quantity=randomBetween(10,17);
 try{
  await axios.post(API_URL_2,{
   key:API_KEY_2,
   action:"add",
   service:SERVICE_ID_4,
   link:LINK_BOT,
   quantity
  });
  console.log("Service4:",quantity);
 }catch(e){
  console.log("Service4 error",e.message);
 }
}

// ============================
// SERVICE 5 (منصة ثانية - رابط البوت)
// ============================
async function service5(){
 const quantity=randomBetween(10,17);
 try{
  await axios.post(API_URL_2,{
   key:API_KEY_2,
   action:"add",
   service:SERVICE_ID_5,
   link:LINK_BOT,
   quantity
  });
  console.log("Service5:",quantity);
 }catch(e){
  console.log("Service5 error",e.message);
 }
}

// ============================
// LOOP SYSTEM
// ============================
async function startSequence(){
 await service1();
 setTimeout(step2,delay(5,15));
}

async function step2(){
 await service3();
 setTimeout(step3,delay(4,20));
}

async function step3(){
 await service4();
 await service5();
 setTimeout(startSequence,delay(10,25));
}

// ============================
// SERVER
// ============================
app.get("/",(req,res)=>{
 res.send("Bot running");
});

app.listen(PORT,()=>{
 console.log("Server started");

 // تشغيل النظام المستقل
 service2();

 // تشغيل التسلسل
 startSequence();
});
