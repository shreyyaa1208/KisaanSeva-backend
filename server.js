import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { Client } from "@gradio/client";
import diseaseRoutes from "./disease.js";

dotenv.config({ path: "./backend/.env" });

const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "https://kisaan-seva.vercel.app",
    "https://kisaan-seva-6rbl1w0tn-shreyyaa1208s-projects.vercel.app"
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json());

// Mount disease prediction route
app.use("/api", diseaseRoutes);

// Fertilizer Prediction Endpoint
app.post("/api/predict-fertilizer", async (req, res) => {
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

// Crop Recommendation Endpoint
app.post("/api/predict-crop", async (req, res) => {
    console.log("📥 /api/predict-crop endpoint hit", req.body);
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

// Chatbase chatbot route
app.post("/api/chatbase", async (req, res) => {
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

app.get("/api/chatbase-test", (req, res) => {
    res.send("Chatbase route is reachable ✅");
});

app.get("/api", (req, res) => {
    res.send("✅ KisaanSeva backend is running!");
});

// This is important for Vercel
export default app;

// This is for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});