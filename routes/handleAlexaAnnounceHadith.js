import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { hadith } = req.body;

  if (!hadith) {
    return res.status(400).json({ error: "Hadith text is required." });
  }

  try {
    const response = {
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: `Here is a hadith for you: ${hadith}`,
        },
        shouldEndSession: true,
      },
    };
    return res.json(response);
  } catch (error) {
    console.error("Error processing hadith:", error);
    return res.status(500).json({ error: "Hadith processing failed." });
  }
});

export default router;