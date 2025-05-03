// routes/pronounce.js
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text input." });
    }

    const prompt = `Please pronounce this English word or phrase clearly: ${text}`;

    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice: "echo",
      input: prompt,
    });

    const arrayBuffer = await speech.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    return res.json({ audioBase64: base64Audio });
  } catch (err) {
    console.error("\u274C Pronounce error:", err);
    return res.status(500).json({ error: "Failed to generate pronunciation." });
  }
});

export default router;

