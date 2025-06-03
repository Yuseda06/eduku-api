import express from "express";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    // Step 1: Fetch all scores
    const { data, error } = await supabase
      .from("alexa_score")
      .select("child_id, score");

    if (error || !data) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Gagal ambil markah." });
    }

    const scores = data.reduce((acc, row) => {
      const name = row.child_id?.toLowerCase();
      acc[name] = (acc[name] || 0) + (row.score ?? 0);
      return acc;
    }, {});

    const allScores = [
      { name: "Irfan", score: scores["irfan"] ?? 0 },
      { name: "Naufal", score: scores["naufal"] ?? 0 },
      { name: "Zakwan", score: scores["zakwan"] ?? 0 }
    ];

    const sorted = allScores.sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    // Step 2: Randomize SSML announcement in BM
    const bmMessages = [
      `<speak><amazon:emotion name="excited" intensity="high">${first.name} paling hebat dengan ${first.score} markah! ${second.name} dan ${third.name}, jangan mengalah!</amazon:emotion></speak>`,
      `<speak>Pertandingan semakin sengit! ${first.name} sedang mendahului dengan ${first.score} markah. ${second.name} di tempat kedua, dan ${third.name} sedang cuba mengejar!</speak>`,
      `<speak>Markah terkini diumumkan! ${first.name}: ${first.score}, ${second.name}: ${second.score}, ${third.name}: ${third.score}. Teruskan usaha semua!</speak>`,
      `<speak>Hebat! ${first.name} sedang mendahului. Tapi ${second.name} dan ${third.name} masih ada peluang untuk potong!</speak>`,
      `<speak>${first.name} di tempat pertama dengan ${first.score}. ${second.name} dan ${third.name}, semangat kena kekal tinggi!</speak>`
    ];

    const randomIndex = Math.floor(Math.random() * bmMessages.length);
    const ssml = bmMessages[randomIndex];

    // Step 3: Generate TTS (voice: nova)
    const speech = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "nova",
      input: ssml,
      response_format: "mp3"
    });

    return res.json({
      success: true,
      message: "TTS berjaya dijana",
      base64: speech.audio
    });
  } catch (err) {
    console.error("Nova TTS error:", err);
    return res.status(500).json({ error: "Gagal jana suara.", detail: err.message });
  }
});

export default router;
