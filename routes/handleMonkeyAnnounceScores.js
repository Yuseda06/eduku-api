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
    // Fetch all score data
    const { data, error } = await supabase
      .from("alexa_score")
      .select("child_id, score");

    if (error || !data || data.length === 0) {
      return res.status(500).json({ error: "Failed to fetch scores" });
    }

    // Group & sum scores by child
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

    // Sort dari highest → lowest
    const sorted = allScores.sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    // Text untuk announce
    const announcement = `${first.name} leads with ${first.score} points. ${second.name} follows with ${second.score}, and ${third.name} has ${third.score}. Keep it up!`;

    // Trigger VoiceMonkey Routine Trigger
    const vmResponse = await axios.post(
        "https://api-v2.voicemonkey.io/trigger",
      {
        trigger: "quiz-score", // 🟢 Match dengan Device ID Routine Trigger
        announcement,
        device: "all"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VM_API_TOKEN}`
        }
      }
    );

    return res.status(200).json({
      message: "VoiceMonkey announcement triggered",
      vmResponse: vmResponse.data
    });

  } catch (err) {
    console.error("VoiceMonkey Trigger Error:", err.message);
    return res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
});

export default router;
