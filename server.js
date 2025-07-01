import fetch from "node-fetch";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Client } from "@gradio/client";
import diseaseRoutes from "./disease.js"; // ✅ Import router


dotenv.config({ path: "./backend/.env" });
console.log("HF token:", process.env.HF_API_TOKEN?.slice(0, 8) + "…");

console.log("🤖 Chatbot ID:", process.env.CHATBASE_BOT_ID);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Mount disease prediction route
app.use("/api", diseaseRoutes);

// 🔹 Fertilizer Prediction Endpoint
app.post("/predict-fertilizer", async (req, res) => {
    const { temp, humidity, moisture, soil, crop, N, P, K } = req.body;

    try {
        const client = await Client.connect("Trisita/crop_and_fertilizer_recommendation_system");
        const result = await client.predict("/predict_1", {
            temp: Number(temp),
            humidity: Number(humidity),
            moisture: Number(moisture),
            soil,
            crop,
            N: Number(N),
            P: Number(P),
            K: Number(K),
        });

        console.log("Fertilizer Result:", result);
        res.json({ prediction: result.data[0] });
    } catch (error) {
        console.error("Fertilizer prediction error:", error);
        res.status(500).json({ error: "Fertilizer prediction failed" });
    }
});

// 🔹 Crop Recommendation Endpoint
app.post("/predict-crop", async (req, res) => {
    console.log("📥 /predict-crop endpoint hit", req.body);

    const { temp, humidity, ph, rainfall, N, P, K } = req.body;

    try {
        const client = await Client.connect("Trisita/crop_and_fertilizer_recommendation_system");
        const result = await client.predict("/predict", {
            temp: Number(temp),
            humidity: Number(humidity),
            ph: Number(ph),
            rainfall: Number(rainfall),
            N: Number(N),
            P: Number(P),
            K: Number(K),
        });

        console.log("Crop Prediction Result:", result);
        res.json({ recommendedCrop: result.data[0] });
    } catch (err) {
        console.error("Crop prediction error:", err);
        res.status(500).json({ error: "Crop prediction failed" });
    }
});

// 🔹 Chatbase chatbot route
app.post("/chatbase", async (req, res) => {
    const { message } = req.body;

    try {
        const response = await fetch("https://www.chatbase.co/api/v1/chat", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.CHATBASE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chatbotId: process.env.CHATBASE_BOT_ID,
                messages: [{ role: "user", content: message }],
            }),
        });

        const data = await response.json();
        console.log("🔁 Chatbase Response:", data);

        res.status(200).json(data);
    } catch (err) {
        console.error("❌ Chatbase API error:", err);
        res.status(500).json({ error: "Chatbase response failed" });
    }
});

app.get("/chatbase-test", (req, res) => {
    res.send("Chatbase route is reachable ✅");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
