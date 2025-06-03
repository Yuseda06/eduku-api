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
    const { data, error } = await supabase
      .from("alexa_score")
      .select("child_id, score");

    if (error || !data || data.length === 0) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch scores" });
    }

    // Group & sum by child
    const scores = data.reduce((acc, row) => {
      const name = row.child_id?.toLowerCase();
      acc[name] = (acc[name] || 0) + (row.score ?? 0);
      return acc;
    }, {});

    const irfan = scores["irfan"] ?? 0;
    const naufal = scores["naufal"] ?? 0;
    const zakwan = scores["zakwan"] ?? 0;

    const allScores = [
      { name: "Irfan", score: irfan },
      { name: "Naufal", score: naufal },
      { name: "Zakwan", score: zakwan }
    ];

    const sorted = allScores.sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    const announcement = `${first.name} leads with ${first.score} points. ${second.name} is second with ${second.score}, and ${third.name} is third with ${third.score}. Keep it up everyone!`;

    // Call VoiceMonkey v2 API
    const vmResponse = await axios.post(
      "https://api.voicemonkey.io/v2/monkey/trigger",
      {
        monkey: "quiz_score", // Monkey name (lowercase)
        announcement,
        device: "all" // or specify device if needed
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VM_API_TOKEN}`
        }
      }
    );

    return res.status(200).json({
      message: "VoiceMonkey announcement triggered",
      vmResponse: vmResponse.data
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
});

export default router;
