const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== بياناتك من Environment Variables ======
const API_URL = process.env.API_URL;       // https://domain.com/api/v2
const API_KEY = process.env.API_KEY;
const SERVICE_ID = process.env.SERVICE_ID; // 16606
const LINK = process.env.LINK;             // @AiCryptoGPTbot

// ====== دالة رقم عشوائي ======
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ====== إرسال الطلب ======
async function sendOrder() {
  const quantity = randomBetween(10, 20);

  try {
    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service: SERVICE_ID,
      link: LINK,
      quantity: quantity
    });

    console.log("Sent:", quantity, "users");
    console.log("Response:", response.data);

  } catch (err) {
    console.error("Error:", err.message);
  }

  scheduleNext();
}

// ====== جدولة عشوائية ======
function scheduleNext() {
  const minutes = randomBetween(5, 15);
  const delay = minutes * 60 * 1000;

  console.log("Next order in", minutes, "minutes");

  setTimeout(sendOrder, delay);
}

// ====== Web Service endpoint ======
app.get("/", (req, res) => {
  res.send("Bot is running...");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  scheduleNext();
});
