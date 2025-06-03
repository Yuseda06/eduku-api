import express from "express";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", async (req, res) => {
  try {
    // Step 1: Get all scores
    const { data, error } = await supabase
      .from("alexa_score")
      .select("child_id, score");

    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: "Failed to fetch scores" });
    }

    // Step 2: Summarize score per child
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

    // Step 3: Sort
    const sorted = allScores.sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    // Step 4: Randomize announcement
    const messages = [
      "Semangat luar biasa! Irfan mendahului dengan {score} mata!",
      "Wah! Markah tertinggi milik Irfan hari ni, teruskan usaha!",
      "Irfan sedang leading, tapi Naufal dan Zakwan boleh kejar lagi!",
      "Tahniah Irfan! Anda di tempat pertama dengan {score} markah!",
      "Game on! Irfan di depan, siapa nak potong dia?"
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    const finalText = messages[randomIndex].replace("{score}", first.score);

    // Step 5: Send to VoiceMonkey
    const vmResponse = await axios.post(
      "https://webhooks.voicemonkey.io/catch/6a25a12af8d6de8275da7bdf1489511a/55f6c1bbef", // 🔁 Ganti token/id betoi
      {
        announcement: finalText,
        ssml: false,
      }
    );

    return res.json({
      message: "VoiceMonkey announcement sent",
      data: vmResponse.data
    });

  } catch (err) {
    console.error("VoiceMonkey Trigger Error:", err.message);
    return res.status(500).json({
      error: "Something went wrong",
      detail: err.message
    });
  }
});

export default router;
