import {Router} from "express";
const router = Router();

import {createQuiz,updateQuiz, getQuizById,getQuizAnswers, getQuizzes,deleteQuiz} from "../controllers/QuizController.js";

router.route("/quiz")
    .get(getQuizzes).post(createQuiz);

router.route("/quiz/:id")
    .get(getQuizById).patch(updateQuiz).delete(deleteQuiz);

router.route("/quiz-answers/:id")
    .get(getQuizAnswers); // Assuming this is to get quiz answers

export default router;