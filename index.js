import dotenv from "dotenv";
dotenv.config(); // WAJIB sebelum mana-mana guna process.env

import express from "express";
import cors from "cors";

import getResponseRoute from "./routes/getResponse.js";
import getTranslationRoute from "./routes/getTranslation.js";
import getSentenceRoute from "./routes/getSentence.js";
import generateImageRoute from "./routes/generateImage.js";

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: "https://www.c3app.net", 
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }));


app.use(cors());

app.use(express.json());

// ✅ Routes
app.use("/api/getResponse", getResponseRoute);
app.use("/api/getTranslation", getTranslationRoute);
app.use("/api/getSentence", getSentenceRoute);
app.use("/api/generateImage", generateImageRoute);

// ✅ Start server 
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
