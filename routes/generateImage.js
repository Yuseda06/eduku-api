import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  const { description } = req.body;

  try {
    const image = await openai.images.generate({
      model: "dall-e-3",
      prompt: description,
      n: 1,
      size: "1024x1024",
    });

    const url = image.data[0].url;
    res.json({ url });
  } catch (err) {
    console.error("❌ Image generation error:", err);
    res.status(500).json({ error: "Image generation failed." });
  }
});

export default router;
