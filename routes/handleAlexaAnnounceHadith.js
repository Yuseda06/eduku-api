import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Fetch dari API hadith
    const fetchRes = await fetch("https://random-hadith-generator.vercel.app/muslim");
    const { data } = await fetchRes.json();

    const hadith = data.hadith_english?.replace(/\s+/g, " ").trim();
    const header = data.header?.replace(/\s+/g, " ").trim();
    const refno = data.refno;

    const response = {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: `${header} ${hadith} (Hadith No: ${refno})`,
        },
        shouldEndSession: true,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error("Error fetching hadith:", error);
    return res.status(500).json({ error: "Hadith processing failed." });
  }
});



export default router;