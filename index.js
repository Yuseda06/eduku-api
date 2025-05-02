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


const allowedOrigins = [
  "http://localhost:3000",
  "https://eduku.vercel.app",
  "https://eduku-api.vercel.app",
  "https://www.c3app.net"
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));
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
