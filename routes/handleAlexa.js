import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
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

  if (intentName === "QuizIntent") {

    console.log("📦 Quiz response dari API:", quiz);

    try {
        // const quizRes = await fetch("https://eduku-api.vercel.app/api/getQuizQuestion");
        // const quiz = await quizRes.json();

        const quiz = {
            question: "What is the meaning of 'Lari'?",
            choices: ["Run", "Eat", "Sleep", "Jump"],
            answer: "Run",
            sentence: "She likes to run in the park every morning.",
          };
        
        if (!quiz || !quiz.answer || !quiz.choices) {
          throw new Error("Incomplete quiz data from API.");
        }
        
        // Handle jika choices dalam bentuk string
        const choices = Array.isArray(quiz.choices)
          ? quiz.choices
          : JSON.parse(quiz.choices);
        
        response.sessionAttributes.correctAnswer = quiz.answer;
        
        response.response.outputSpeech.text = `${quiz.question} Your options are: A, ${choices[0]}; B, ${choices[1]}; C, ${choices[2]}; D, ${choices[3]}. What's your answer?`;
        
    } catch (err) {
      console.error("QuizIntent error:", err);
      response.response.outputSpeech.text = "Sorry, I couldn't load the question. Please try again later.";
    }
  } else if (intentName === "AnswerIntent") {
    const userAnswer = req.body.request.intent?.slots?.option?.value;
    const correct = session.attributes?.correctAnswer;

    if (!correct) {
      response.response.outputSpeech.text = "Please start a quiz first by saying 'start quiz'.";
    } else if (userAnswer?.toLowerCase() === correct.toLowerCase()) {
      response.response.outputSpeech.text = "Correct! You earned 1 point. Say 'start quiz' for another question.";
    } else {
      response.response.outputSpeech.text = `Oops, the correct answer is ${correct}. Try another question by saying 'start quiz'.`;
    }

    response.sessionAttributes.correctAnswer = null;
  } else {
    response.response.outputSpeech.text = "Sorry, I didn't understand that. Try saying 'start quiz'.";
  }

  return res.json(response);
});

router.get("/", (req, res) => {
  res.status(200).send("Alexa webhook is up and running.");
});

export default router;
