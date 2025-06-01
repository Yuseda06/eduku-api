import express from "express";

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
    // ❗ Guna dummy data terus
    const quiz = {
      question: "What is the meaning of 'Lari'?",
      choices: ["Run", "Eat", "Sleep", "Jump"],
      answer: "Run",
      sentence: "She likes to run in the park every morning.",
    };
    response.sessionAttributes = response.sessionAttributes || {};
    response.sessionAttributes.correctAnswer = quiz.answer;
    
    response.response.outputSpeech.text = `${quiz.question} Your options are: A, ${quiz.choices[0]}; B, ${quiz.choices[1]}; C, ${quiz.choices[2]}; D, ${quiz.choices[3]}. What's your answer?`;
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
  res.status(200).send("Alexa webhook dummy is up.");
});

export default router;
