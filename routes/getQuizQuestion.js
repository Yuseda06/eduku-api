import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);


router.get("/", async (req, res) => {
  console.log("Handler called!");
  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("Supabase error:", error);
    console.log("Supabase data:", data);

    if (error || !data || data.length === 0) {
      return res.status(404).json({ error: "No vocab found" });
    }

    const questions = data.map(vocab => ({
      word: vocab.word,
      question: `What is the meaning of "${vocab.word}"?`,
      choices: vocab.choices,
      answer: vocab.answer,
      sentence: vocab.sentence,
    }));

    return res.json(questions);
  } catch (err) {
    console.error("getQuizQuestion error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
