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

  // Handle "alexa open vocab interaction"
  if (requestType === "LaunchRequest") {
    response.response.outputSpeech.text = "Welcome to Eduku Vocab! Say 'start quiz' to begin.";
    return res.json(response);
  }

  // Start Quiz Intent
  if (requestType === "IntentRequest" && intentName === "QuizIntent") {
    try {
      const quizRes = await fetch("https://eduku-api.vercel.app/api/getQuizQuestion");
      const quizList = await quizRes.json();
      const quiz = Array.isArray(quizList)
        ? quizList[Math.floor(Math.random() * quizList.length)]
        : quizList;

      if (!quiz || !quiz.answer || !quiz.choices) {
        throw new Error("Incomplete quiz data from API.");
      }

      const choices = Array.isArray(quiz.choices) ? quiz.choices : JSON.parse(quiz.choices);
      const shuffledChoices = shuffle(choices);

      const spelling = quiz.word.split('').join('-').toUpperCase();

      response.sessionAttributes.correctAnswer = quiz.answer;
      response.sessionAttributes.choices = shuffledChoices;

      response.response.outputSpeech.text =
        `Spell this word: ${spelling}. ${quiz.question} Your options are: ` +
        `A, ${shuffledChoices[0]}; B, ${shuffledChoices[1]}; C, ${shuffledChoices[2]}; D, ${shuffledChoices[3]}. What's your answer?`;

    } catch (err) {
      console.error("QuizIntent error:", err);
      response.response.outputSpeech.text = "Sorry, I couldn't load the question. Please try again later.";
    }

    return res.json(response);
  }

  // Answer Intent
  if (requestType === "IntentRequest" && intentName === "AnswerIntent") {
    const userAnswer = req.body.request.intent?.slots?.option?.value;
    const correct = session.attributes?.correctAnswer;
    const choices = session.attributes?.choices;

    if (!correct || !choices) {
      response.response.outputSpeech.text = "Please start a quiz first by saying 'start quiz'.";
    } else {
      const optionMap = { a: 0, b: 1, c: 2, d: 3 };
      const index = optionMap[userAnswer?.toLowerCase()];
      const chosenAnswer = choices[index];

      if (chosenAnswer?.toLowerCase() === correct.toLowerCase()) {
        response.response.outputSpeech.text = "Correct! You earned 1 point. Say 'start quiz' for another question.";
      } else {
        response.response.outputSpeech.text = `Oops, the correct answer is ${correct}. Try another question by saying 'start quiz'.`;
      }
    }

    response.sessionAttributes.correctAnswer = null;
    response.sessionAttributes.choices = null;
    return res.json(response);
  }

  // Fallback
  response.response.outputSpeech.text = "Sorry, I didn't understand that. Try saying 'start quiz'.";
  return res.json(response);
});

// Shuffle helper
function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

router.get("/", (req, res) => {
  res.status(200).send("Alexa webhook is up and running.");
});

export default router;
