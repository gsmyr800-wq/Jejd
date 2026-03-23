const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const LINK = process.env.LINK;
const LINK_BOT = process.env.LINK_BOT;

const SERVICES = [
    { id: process.env.SERVICE_ID_1, target: LINK_BOT, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_2, target: LINK, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_3, target: LINK_BOT, sent: 0, targetDaily: 0 },
    { id: process.env.SERVICE_ID_4, target: LINK, sent: 0, targetDaily: 0 }
];

let currentDay = new Date().getDate();

const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

function generateDailyTargets() {
    SERVICES.forEach(s => {
        s.sent = 0;
        s.targetDaily = random(430, 620);
    });

    console.log("Daily targets:");
    SERVICES.forEach(s =>
        console.log(`Service ${s.id} → ${s.targetDaily}`)
    );
}

generateDailyTargets();

function checkNewDay() {
    const today = new Date().getDate();

    if (today !== currentDay) {
        currentDay = today;
        generateDailyTargets();
        console.log("New day started");
    }
}

function activityMultiplier() {
    const hour = new Date().getHours();

    if (hour >= 3 && hour <= 7) return 0.4;
    if (hour >= 8 && hour <= 12) return 0.8;
    if (hour >= 13 && hour <= 17) return 1.0;
    if (hour >= 18 && hour <= 23) return 1.5;

    return 0.7;
}

function getDelay() {
    const base = random(2, 8) * 60 * 1000;
    const multiplier = 2 - activityMultiplier();
    return base * multiplier;
}

function pickService() {

    const remaining = SERVICES.filter(s => s.sent < s.targetDaily);

    if (!remaining.length) return null;

    remaining.sort(
        (a, b) =>
            a.sent / a.targetDaily - b.sent / b.targetDaily
    );

    return remaining[0];
}

async function sendOrder(service) {

    let quantity = random(10, 25);

    if (Math.random() < 0.15) {
        quantity = random(30, 60);
    }

    const remaining = service.targetDaily - service.sent;

    if (quantity > remaining) quantity = remaining;

    try {

        await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: service.id,
            link: service.target,
            quantity
        });

        service.sent += quantity;

        console.log(
            `[${new Date().toLocaleTimeString()}] S${service.id} +${quantity} → ${service.sent}/${service.targetDaily}`
        );

    } catch (err) {

        console.log("API error:", err.message);
    }
}

async function engine() {

    checkNewDay();

    const service = pickService();

    if (!service) {

        console.log("All targets reached for today");

        setTimeout(engine, 30 * 60 * 1000);
        return;
    }

    await sendOrder(service);

    setTimeout(engine, getDelay());
}

app.get("/", (req, res) => res.send("Human Simulation Engine Running"));

app.listen(PORT, () => {

    console.log("System started");

    engine();
});
