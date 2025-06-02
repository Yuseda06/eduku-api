import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper untuk shuffle array
function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

router.get("/", async (req, res) => {
  const child = req.query.child?.toLowerCase();

  if (!child) {
    return res.status(400).json({ error: "Missing 'child' query parameter" });
  }

  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("word, answer, choices, sentence")
      .eq("user_id", child);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: `No vocab found for child '${child}'` });
    }

    const vocab = data[Math.floor(Math.random() * data.length)];
    const choices = Array.isArray(vocab.choices) ? vocab.choices : JSON.parse(vocab.choices);
    const shuffledChoices = shuffle(choices);

    return res.json({
      word: vocab.word,
      question: `What is the meaning of "${vocab.word}"?`,
      choices: shuffledChoices,
      answer: vocab.answer,
      sentence: vocab.sentence,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});

export default router;
