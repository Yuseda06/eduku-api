import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Shuffle helper
function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

router.get("/", async (req, res) => {
  const child = req.query.child;

  if (!child) {
    return res.status(400).json({ error: "Missing child query parameter" });
  }

  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .eq("user_id", child); // guna user_id untuk filter ikut child

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "No vocab found for this child" });
    }

    const vocab = data[Math.floor(Math.random() * data.length)];
    const shuffledChoices = shuffle(vocab.choices);

    return res.json({
      word: vocab.word,
      question: `What is the meaning of "${vocab.word}"?`,
      choices: shuffledChoices,
      answer: vocab.answer,
      sentence: vocab.sentence,
    });
  } catch (err) {
    console.error("Error fetching vocab:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
