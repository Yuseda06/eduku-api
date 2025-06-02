import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
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

    if (error || !data) {
      console.error("Supabase error:", error);
      return res.status(500).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "There was an error fetching the scores."
          },
          shouldEndSession: true
        }
      });
    }

    // Group & sum
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

    // Cari siapa paling tinggi
    const highest = allScores.reduce((a, b) => (b.score > a.score ? b : a), {});

    const ssml = `<speak>
    <amazon:emotion name="excited" intensity="high">
      Yuhuuuu! ${highest.name} is the highest scorer with ${highest.score} points!
    </amazon:emotion>
      <break time="0.5s"/>
      Keep it up ${highest.name}! You're doing awesome!
  </speak>`;
  
  return res.json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "SSML",
        ssml
      },
      shouldEndSession: true
    }
  });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Sorry, something went wrong."
        },
        shouldEndSession: true
      }
    });
  }
});

export default router;
