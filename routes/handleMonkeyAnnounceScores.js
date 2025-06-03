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

    // Step 4: Randomize announcement template
    const templates = [
      `<speak><amazon:emotion name="excited" intensity="high">Yuhuuu! ${first.name} is leading with ${first.score} points!</amazon:emotion><break time="0.5s"/> ${second.name} is second with ${second.score}, and ${third.name} is close behind with ${third.score}. Let's keep the fire burning!</speak>`,

      `<speak>${first.name} tops the chart with ${first.score} points. ${second.name} is catching up with ${second.score}, and ${third.name} has ${third.score}. Keep pushing forward!</speak>`,

      `<speak><amazon:emotion name="excited" intensity="medium">Bravo ${first.name}!</amazon:emotion> You've got ${first.score} points. ${second.name} is not far behind with ${second.score}, and ${third.name} has ${third.score}. All of you are amazing!</speak>`,

      `<speak>Here's your current quiz ranking! <break time="0.3s"/> ${first.name}: ${first.score} points. ${second.name}: ${second.score}. ${third.name}: ${third.score}. Well done!</speak>`,

      `<speak>The scoreboard says: ${first.name} is number one with ${first.score}! ${second.name} follows with ${second.score}, and ${third.name} is at ${third.score}. Keep up the good work!</speak>`
    ];

    const randomSSML = templates[Math.floor(Math.random() * templates.length)];

    // Step 5: Trigger VoiceMonkey Webhook
    const response = await axios.post(
      "https://webhooks.voicemonkey.io/catch/6a25a12af8d6de8275da7bdf1489511a/55f6c1bbef",
      {
        announcement: randomSSML,
        ssml: true
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

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
