import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Please translate this to Bahasa Malaysia: ${text}`,
        },
      ],
    });

    const result = completion.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed." });
  }
});

export default router;
