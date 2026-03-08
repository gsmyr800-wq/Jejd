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

const SERVICE_ID = process.env.SERVICE_ID;
const SERVICE_ID_2 = process.env.SERVICE_ID_2;
const SERVICE_ID_3 = process.env.SERVICE_ID_3;
const SERVICE_ID_4 = process.env.SERVICE_ID_4;

// ===== HELPERS =====
function randomBetween(min,max){
 return Math.floor(Math.random()*(max-min+1))+min;
}

function delay(min,max){
 return randomBetween(min,max)*60*1000;
}

// تأخير قصير (burst)
function shortDelay(){
 return randomBetween(20,60)*1000;
}

// احتمال حدوث burst
async function maybeBurst(fn){

 if(Math.random()<0.15){
  setTimeout(fn,shortDelay());
 }

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

  maybeBurst(service1);

 }catch(e){
  console.log("Service1 error",e.message);
 }

}

// ============================
// SERVICE 2 (مستقل)
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

  maybeBurst(service2);

 }catch(e){
  console.log("Service2 error",e.message);
 }

 let nextDelay=delay(5,15);

 // احتمال فترة هدوء
 if(Math.random()<0.1){
  nextDelay+=delay(20,45);
 }

 setTimeout(service2,nextDelay);
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

  maybeBurst(service3);

 }catch(e){
  console.log("Service3 error",e.message);
 }

}

// ============================
// SERVICE 4
// ============================
async function service4(){

 const quantity=randomBetween(10,17);

 try{

  await axios.post(API_URL_2,{
   key:API_KEY_2,
   action:"add",
   service:SERVICE_ID_4,
   link:LINK,
   quantity
  });

  console.log("Service4:",quantity);

  maybeBurst(service4);

 }catch(e){
  console.log("Service4 error",e.message);
 }

}

// ============================
// LOOP SYSTEM
// ============================
async function startSequence(){

 await service1();

 let d=delay(5,15);

 if(Math.random()<0.1){
  d+=delay(5,15);
 }

 setTimeout(step2,d);

}

async function step2(){

 await service3();

 let d=delay(4,20);

 if(Math.random()<0.1){
  d+=delay(5,10);
 }

 setTimeout(step3,d);

}

async function step3(){

 await service4();

 let d=delay(10,25);

 if(Math.random()<0.1){
  d+=delay(10,20);
 }

 setTimeout(startSequence,d);

}

// ============================
// SERVER
// ============================
app.get("/",(req,res)=>{
 res.send("Bot running");
});

app.listen(PORT,()=>{

 console.log("Server started");

 service2();       // النظام المستقل
 startSequence();  // التسلسل

});
