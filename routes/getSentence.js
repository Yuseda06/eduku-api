import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Make a sentence using the word: ${text}` }],
    });

    const result = completion.choices[0].message.content;
    res.json({ result });
  } catch (err) {
    console.error("❌ Sentence Error:", err);
    res.status(500).json({ error: "Sentence generation failed." });
  }
});

export default router;
