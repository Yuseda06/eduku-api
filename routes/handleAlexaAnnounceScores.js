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
            text: "There was an error fetching the scores.",
          },
          shouldEndSession: true,
        },
      });
    }

    const scores = data.reduce((acc, row) => {
      const name = row.child_id?.toLowerCase();
      acc[name] = (acc[name] || 0) + (row.score ?? 0);
      return acc;
    }, {});

    const allScores = [
      { name: "Irfan", score: scores["irfan"] ?? 0 },
      { name: "Naufal", score: scores["naufal"] ?? 0 },
      { name: "Zakwan", score: scores["zakwan"] ?? 0 },
    ];

    const sorted = [...allScores].sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    // Ayat untuk markah semua
    const fullScoresText = `Irfan has ${scores["irfan"] ?? 0}, Naufal has ${
      scores["naufal"] ?? 0
    }, and Zakwan has ${scores["zakwan"] ?? 0} points.`;

    // 5 random template
    const templates = [
      `<speak>
        <amazon:emotion name="excited" intensity="high">The quiz battle is heating up!</amazon:emotion>
        <break time="0.3s"/>
        ${first.name} is currently in the lead with ${first.score}.
        ${second.name} and ${third.name}, can you beat that?
        <break time="0.4s"/>
        ${fullScoresText}
      </speak>`,

      `<speak>
        <amazon:emotion name="excited" intensity="medium">Here's the latest score update!</amazon:emotion>
        <break time="0.2s"/>
        ${fullScoresText} 
        <break time="0.3s"/> Keep it going!
      </speak>`,

      `<speak>
        Oh wow! ${first.name} is crushing it with ${first.score} points!
        <break time="0.3s"/>
        But hey, ${second.name} and ${third.name} are still in the game.
        <break time="0.3s"/>
        ${fullScoresText}
      </speak>`,

      `<speak>
        <amazon:emotion name="excited" intensity="low">It’s a close race!</amazon:emotion>
        <break time="0.2s"/>
        ${first.name} leads, but everyone’s doing great.
        <break time="0.3s"/>
        ${fullScoresText}

        
      </speak>`,

      `<speak>
        Time for a score check!
        <break time="0.3s"/>
        ${fullScoresText}
        <break time="0.3s"/>
        Let's see who climbs to the top next!
      </speak>`,
      `<speak><amazon:emotion name="excited" intensity="high">${first.name} paling hebat dengan ${first.score} markah! ${second.name} dan ${third.name}, jangan mengalah!</amazon:emotion></speak>`,
      `<speak>Pertandingan semakin sengit! ${first.name} sedang mendahului dengan ${first.score} markah. ${second.name} di tempat kedua, dan ${third.name} sedang cuba mengejar!</speak>`,
      `<speak>Markah terkini diumumkan! ${first.name}: ${first.score}, ${second.name}: ${second.score}, ${third.name}: ${third.score}. Teruskan usaha semua!</speak>`,
      `<speak>Hebat! ${first.name} sedang mendahului. Tapi ${second.name} dan ${third.name} masih ada peluang untuk potong!</speak>`,
      `<speak>${first.name} di tempat pertama dengan ${first.score}. ${second.name} dan ${third.name}, semangat kena kekal tinggi!</speak>`,
    ];

    const randomIndex = Math.floor(Math.random() * templates.length);
    const ssml = templates[randomIndex];

    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "SSML",
          ssml,
        },
        shouldEndSession: true,
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Sorry, something went wrong.",
        },
        shouldEndSession: true,
      },
    });
  }
});

export default router;
