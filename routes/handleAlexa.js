import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const requestType = req.body.request?.type;
  const intentName = req.body.request?.intent?.name;
  const session = req.body.session || {};

  const response = {
    version: "1.0",
    response: {
      shouldEndSession: false,
      outputSpeech: {
        type: "PlainText",
        text: "",
      },
    },
    sessionAttributes: {},
  };

  // 👉 BILA USER LAUNCH
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text = "Welcome to Vocab Quiz! Say 'start quiz' to begin.";
    return res.json(response);
  }

  // 👉 START QUIZ
  if (requestType === "IntentRequest" && intentName === "QuizIntent") {
    try {
      const quizRes = await fetch("https://eduku-api.vercel.app/api/getQuizQuestion");
      const quizList = await quizRes.json();
      const quiz = Array.isArray(quizList)
        ? quizList[Math.floor(Math.random() * quizList.length)]
        : quizList;

      if (!quiz || !quiz.answer || !quiz.choices) {
        throw new Error("Incomplete quiz data");
      }

      const choices = Array.isArray(quiz.choices) ? quiz.choices : JSON.parse(quiz.choices);
      const spelling = quiz.word?.split('').join('-').toUpperCase();

      // 👉 Simpan jawapan dan choices dalam session
      response.sessionAttributes.correctAnswer = quiz.answer;
      response.sessionAttributes.choices = choices;

      response.response.outputSpeech.text = 
        `Spell this word: ${spelling}. ` +
        `${quiz.question} Your options are: A, ${choices[0]}; B, ${choices[1]}; C, ${choices[2]}; D, ${choices[3]}. What's your answer?`;
    } catch (err) {
      console.error("QuizIntent error:", err);
      response.response.outputSpeech.text = "Sorry, I couldn't load the question. Please try again later.";
    }

    return res.json(response);
  }

  // 👉 HANDLE JAWAPAN
  if (requestType === "IntentRequest" && intentName === "AnswerIntent") {
    const userAnswer = req.body.request.intent?.slots?.option?.value?.toUpperCase();
    const correctAnswer = session.attributes?.correctAnswer;
    const choices = session.attributes?.choices;

    if (!correctAnswer || !choices) {
      response.response.outputSpeech.text = "Please start a quiz first by saying 'start quiz'.";
    } else {
      const correctOptionIndex = choices.findIndex(c => c.toLowerCase() === correctAnswer.toLowerCase());
      const correctLetter = ["A", "B", "C", "D"][correctOptionIndex];

      if (userAnswer === correctLetter) {
        response.response.outputSpeech.text = "Correct! You earned 1 point. Say 'start quiz' for another question.";
      } else {
        response.response.outputSpeech.text = `Oops, the correct answer is ${correctLetter}, which is ${correctAnswer}. Try another question by saying 'start quiz'.`;
      }
    }

    response.sessionAttributes.correctAnswer = null;
    response.sessionAttributes.choices = null;

    return res.json(response);
  }

  // 👉 DEFAULT
  response.response.outputSpeech.text = "Sorry, I didn't understand that. Try saying 'start quiz'.";
  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Alexa webhook is up and running.");
});

export default router;
