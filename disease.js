import express from "express";
import cors from "cors";
import multer from "multer";
import { Client } from "@gradio/client";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/predict-disease", upload.single("image"), async (req, res) => {
    console.log("✅ /predict-disease endpoint hit");

    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    try {
        // Convert file buffer to Blob
        const imageBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

        const client = await Client.connect("akhaliq/Plant-Disease-Classifier");

        const result = await client.predict("/predict", {
            input_image: imageBlob,
        });

        const prediction = result?.data?.[0]?.label || "No prediction";
        return res.json({ prediction });

    } catch (err) {
        console.error("❌ Disease prediction error:", err);
        return res.status(500).json({ error: "Prediction failed", details: err.message });
    }
});

export default router;
