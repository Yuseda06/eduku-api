import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



router.get("/", async (req, res) => {
  console.log("Handler called!");

  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*");

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "No vocab found" });
    }

    // 🎲 Ambil 1 random dari senarai
    const randomIndex = Math.floor(Math.random() * data.length);
    const vocab = data[randomIndex];

    const question = {
      word: vocab.word,
      question: `What is the meaning of "${vocab.word}"?`,
      choices: vocab.choices,
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
