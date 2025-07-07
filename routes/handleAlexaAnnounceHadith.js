// import express from "express";
// import dotenv from "dotenv";

// dotenv.config();
// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     // Fetch dari API hadith
//     const fetchRes = await fetch("https://random-hadith-generator.vercel.app/muslim");
//     const { data } = await fetchRes.json();

//     const hadith = data.hadith_english?.replace(/\s+/g, " ").trim();
//     const header = data.header?.replace(/\s+/g, " ").trim();
//     const refno = data.refno;

//     const response = {
//       version: "1.0",
//       response: {
//         outputSpeech: {
//           type: "PlainText",
//           text: `${header} ${hadith} (Hadith Number: ${refno})`,
//         },
//         shouldEndSession: true,
//       },
//     };

//     return res.json(response);
//   } catch (error) {
//     console.error("Error fetching hadith:", error);
//     return res.status(500).json({ error: "Hadith processing failed." });
//   }
// });



// export default router;
import express from "express";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Ayat Yusuf 1 - 60 sahaja
    const randomAyah = Math.floor(Math.random() * 60) + 1; // 1 - 60
    const verseKey = `12:${randomAyah}`; // Surah Yusuf

    // Fetch dari alquran.cloud
    const fetchRes = await fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.alafasy`);
    const result = await fetchRes.json();

    if (result.code !== 200) throw new Error("Fetch failed");

    const ayah = result.data;
    const text = ayah.text?.replace(/\s+/g, " ").trim();
    const audioUrl = ayah.audio;
    const surah = ayah.surah?.englishName;
    const verseNo = ayah.numberInSurah;

    const response = {
      version: "1.0",
      response: {
        shouldEndSession: true,
        outputSpeech: {
          type: "PlainText",
          text: `Surah ${surah}, Ayat ${verseNo}.`,
        },
        directives: [
          {
            type: "AudioPlayer.Play",
            playBehavior: "REPLACE_ALL",
            audioItem: {
              stream: {
                token: `Yusuf-${verseNo}`,
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
    console.error("Error Yusuf:", err.message);
    return res.status(500).json({ error: "Failed to fetch ayah from Surah Yusuf." });
  }
});

export default router;
