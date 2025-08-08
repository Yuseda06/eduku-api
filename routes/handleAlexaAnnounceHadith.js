import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Ayat Yusuf 1 - 111
    const randomAyah = Math.floor(Math.random() * 60) + 1;
    const paddedAyah = String(randomAyah).padStart(3, "0");

    // Surah Yusuf = 012
    const audioUrl = `https://everyayah.com/data/Ghamadi_40kbps/012${paddedAyah}.mp3`;

    const response = {
      version: "1.0",
      response: {
        shouldEndSession: true,
        outputSpeech: {
          type: "PlainText",
          text: `Surah Yusuf, Ayat ${randomAyah}`,
        },
        directives: [
          {
            type: "AudioPlayer.Play",
            playBehavior: "REPLACE_ALL",
            audioItem: {
              stream: {
                token: `Yusuf-${randomAyah}`,
                url: audioUrl,
                offsetInMilliseconds: 0,
              },
            },
          },
        ],
      },
    };

    return res.json(response);
  } catch (err) {
    console.error("Error Yusuf Ghamdi:", err.message);
    return res.status(500).json({ error: "Failed to fetch ayah from Surah Yusuf." });
  }
});

export default router;
