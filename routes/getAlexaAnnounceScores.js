import { createClient } from "@supabase/supabase-js";
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/score", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("created_at", { ascending: false });

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

    const irfan = data.find(d => d.child === "irfan")?.score ?? 0;
    const naufal = data.find(d => d.child === "naufal")?.score ?? 0;
    const zakwan = data.find(d => d.child === "zakwan")?.score ?? 0;

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
