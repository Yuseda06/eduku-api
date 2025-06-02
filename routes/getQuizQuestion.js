import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// ✅ FIX: Pastikan semua logic dalam route handler
router.get("/", async (req, res) => {
  const child = req.query.child?.toLowerCase();

  const CHILD_UUID_MAP = {
    irfan: "aeffb8fa-547a-4c5e-8cf0-2a491816532e",
    naufal: "3e4c5b1d-ccfb-4e93-8de2-c75c30e4642d",
    zakwan: "e56a7fe1-0181-4293-a566-84cd07a384c6",
  };

  const uuid = CHILD_UUID_MAP[child];

  if (!uuid) {
    return res.status(400).json({ error: "Invalid child name" });
  }

  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("*")
      .eq("user_id", uuid);

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
