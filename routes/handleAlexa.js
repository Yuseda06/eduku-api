import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const intentName = req.body.request?.intent?.name;
  const session = req.body.session || {};
  const sessionAttributes = session.attributes || {}; // Backup session state

  // ✅ Basic response structure ikut Alexa spec
  const response = {
    version: "1.0",
    sessionAttributes: {}, // ✅ Mesti kat sini, bukan dalam `response`
    response: {
      shouldEndSession: false,
      outputSpeech: {
        type: "PlainText",
        text: "",
      },
    },
  };

  // ✅ Handle "start quiz"
  if (intentName === "QuizIntent") {
    try {
      const quizRes = await fetch("https://eduku-api.vercel.app/api/getQuizQuestion");
      const quiz = await quizRes.json();

      if (!quiz?.question || !quiz?.choices || !quiz?.answer) {
        throw new Error("Incomplete quiz data");
      }

      // ✅ Simpan jawapan ke session
      response.sessionAttributes.correctAnswer = quiz.answer;

      // ✅ Bentuk soalan & pilihan jawapan
      response.response.outputSpeech.text = `${quiz.question} Your options are: A, ${quiz.choices[0]}; B, ${quiz.choices[1]}; C, ${quiz.choices[2]}; D, ${quiz.choices[3]}. What's your answer?`;
    } catch (err) {
      console.error("QuizIntent error:", err);
      response.response.outputSpeech.text = "Sorry, I couldn't load the question. Please try again later.";
    }

  // ✅ Handle "user jawab"
  } else if (intentName === "AnswerIntent") {
    const userAnswer = req.body.request.intent?.slots?.option?.value;
    const correct = sessionAttributes?.correctAnswer;

    if (!correct) {
      response.response.outputSpeech.text = "Please start a quiz first by saying 'start quiz'.";
    } else if (userAnswer?.toLowerCase() === correct.toLowerCase()) {
      response.response.outputSpeech.text = "Correct! You earned 1 point. Say 'start quiz' for another question.";
    } else {
      response.response.outputSpeech.text = `Oops, the correct answer is ${correct}. Try another question by saying 'start quiz'.`;
    }

    response.sessionAttributes.correctAnswer = null;

  // ❌ Fallback (intent tak kenal)
  } else {
    response.response.outputSpeech.text = "Sorry, I didn't understand that. Try saying 'start quiz'.";
  }

  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Alexa webhook is up and running.");
});

export default router;
