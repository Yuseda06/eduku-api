// eduku-api/routes/getScores.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("alexa_score")
      .select("child_id, score, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Supabase error" });
    }

    const latestScores = {};
    for (const record of data) {
      if (!latestScores[record.child_id]) {
        latestScores[record.child_id] = record.score;
      }
    }

    return res.json({
      irfan: latestScores.irfan || 0,
      naufal: latestScores.naufal || 0,
      zakwan: latestScores.zakwan || 0,
    });
  } catch (err) {
    console.error("getScores error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
