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

    // Kira total markah setiap anak
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

    // Sort desc
    const sorted = allScores.sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    // Random SSML messages
    const templates = [
      `<speak>
        <amazon:emotion name="excited" intensity="high">
          Woohoo! ${first.name} is on fire with ${first.score} points!
        </amazon:emotion>
        <break time="0.5s"/>
        ${second.name} has ${second.score}, ${third.name} not far with ${third.score}.
      </speak>`,

      `<speak>
        Big congrats to ${first.name} for scoring ${first.score} points!
        <break time="0.3s"/>
        ${second.name} and ${third.name}, you're catching up!
      </speak>`,

      `<speak>
        <amazon:emotion name="excited" intensity="medium">
          Heads up! ${first.name} leads with ${first.score} points.
        </amazon:emotion>
        ${second.name} and ${third.name} are close behind.
      </speak>`,

      `<speak>
        The quiz battle is heating up!
        <break time="0.3s"/>
        ${first.name} is currently in the lead with ${first.score}.
        ${second.name} and ${third.name}, can you beat that?
      </speak>`,

      `<speak>
        <amazon:emotion name="excited" intensity="high">
          It's ${first.name} at the top again!
        </amazon:emotion>
        ${second.name} has ${second.score}, ${third.name} got ${third.score}.
        Great job everyone!
      </speak>`
    ];

    const randomIndex = Math.floor(Math.random() * templates.length);
    const ssml = templates[randomIndex];

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
