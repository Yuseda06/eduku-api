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

    // Group and sum
    const scores = data.reduce((acc, row) => {
      const name = row.child_id?.toLowerCase();
      acc[name] = (acc[name] || 0) + (row.score ?? 0);
      return acc;
    }, {});

    const irfan = scores["irfan"] ?? 0;
    const naufal = scores["naufal"] ?? 0;
    const zakwan = scores["zakwan"] ?? 0;

    const text = `Irfan has ${irfan} points. Naufal has ${naufal}. Zakwan has ${zakwan} points.`;

    return res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text
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
