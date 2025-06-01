import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🎲 Function utk shuffle array
function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

router.get("/", async (req, res) => {


  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*");

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "No vocab found" });
    }

    // Ambil satu vocab random
    const randomIndex = Math.floor(Math.random() * data.length);
    const vocab = data[randomIndex];

    // Shuffle pilihan jawapan
    const shuffledChoices = shuffle(vocab.choices);

    const question = {
      word: vocab.word,
      question: `What is the meaning of "${vocab.word}"?`,
      choices: shuffledChoices,
      answer: vocab.answer,
      sentence: vocab.sentence,
    };

    return res.json(question);
  } catch (err) {
    console.error("getQuizQuestion error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
