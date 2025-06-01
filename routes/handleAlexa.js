import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const intent = req.body.request?.intent;
  const userInput = intent?.slots?.option?.value;

  const response = {
    version: "1.0",
    response: {
      shouldEndSession: false,
      outputSpeech: {
        type: "PlainText",
        text: "",
      },
    },
  };

  // Simpan jawapan last soalan (boleh upgrade pakai session or DB)
  const latestAnswer = "Lari"; // hardcoded buat sementara
  const correct = latestAnswer.toLowerCase() === userInput?.toLowerCase();

  response.response.outputSpeech.text = correct
    ? "Correct! You earned one point!"
    : `Oops, the correct answer is ${latestAnswer}.`;

  return res.json(response);
});

export default router;
