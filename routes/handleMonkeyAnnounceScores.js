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
      return res.status(500).json({ error: "Failed to fetch scores" });
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

    const message = `<speak>
      <amazon:emotion name='excited' intensity='high'>
        Hebat! ${first.name} leads dengan ${first.score} markah!
      </amazon:emotion>
      <break time='0.5s'/>
      ${second.name} ada ${second.score} markah, dan ${third.name} pula ${third.score}.
      <break time='0.4s'/>
      Teruskan usaha semua!
    </speak>`;

    const response = await axios.post("https://api-v2.voicemonkey.io/announcement", {
      device: "echo-dot",
      announcement: message,
      ssml: true
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.VM_API_TOKEN}`
      }
    });

    return res.json({
      message: "VoiceMonkey announcement sent",
      data: response.data
    });

  } catch (err) {
    console.error("VoiceMonkey Trigger Error:", err.message);
    return res.status(500).json({ error: "Something went wrong", detail: err.message });
  }
});

export default router;
