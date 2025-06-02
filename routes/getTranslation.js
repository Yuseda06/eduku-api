import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Please translate the following text to Bahasa Malaysia and change the word to root word, keeping the response under 20 words. If there are multiple meanings, list them numerically as shown below:
            1. Meaning 1
            2. Meaning 2
            3. Meaning 3
            Translate: ${text}`,
        },
      ],
      stream: false,
    });

    const messageContent = response.choices[0].message.content;
    return res.json({ result: messageContent });
  } catch (error) {
    console.error("Error fetching translation:", error);
    return res.status(500).json({ error: "Translation failed." });
  }
});

export default router;