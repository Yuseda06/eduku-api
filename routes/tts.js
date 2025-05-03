import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: text,
    });

    const arrayBuffer = await speech.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    return res.json({ audioBase64: base64Audio });
  } catch (err) {
    console.error("❌ TTS Error:", err);
    return res.status(500).json({ error: "Failed to generate speech." });
  }
});

export default router;
