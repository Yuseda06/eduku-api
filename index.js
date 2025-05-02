import dotenv from "dotenv";
dotenv.config(); // NI WAJIB ADA sebelum guna process.env



import express from "express";
import getResponseRoute from "./routes/getResponse.js";
import getTranslationRoute from "./routes/getTranslation.js";
import getSentenceRoute from "./routes/getSentence.js";
import generateImageRoute from "./routes/generateImage.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/api/getResponse", getResponseRoute);
app.use("/api/getTranslation", getTranslationRoute);
app.use("/api/getSentence", getSentenceRoute);
app.use("/api/generateImage", generateImageRoute);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
