import mongoose from "mongoose";
import QuizModel from "../models/QuizModel.js";

export const getQuizzes = async (req, res) => {
    try {
        
        const { courseId,title } = req.query;

        const query = {
            title,
            courseId,
        }
          
        const quizzes = await QuizModel.find(query, {
            _id: 1,
            title: 1,
            description: 1,
            createdAt: 1,
        });
        
        console.log("Fetched quizzes:", quizzes);
        return res.status(200).json(quizzes);

    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getQuizAnswers = async (req, res) => {
    const { id } = req.params;
    try {

        const quiz = await QuizModel.findById(id, { 
            title: 1, 
            description: 1, 
            'questions.questionText': 1, 
            'questions.options': 1, 
            'questions.correctAnswerIndex': 1, 
            'questions.correctAnswerDescription': 1, 
            createdAt: 1 
          });
          
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz answers:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const getQuizById = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await QuizModel.findById(id, { 
            title: 1, 
            description: 1, 
            'questions.questionText': 1, 
            'questions.options': 1, 
            createdAt: 1 
          });
          
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const createQuiz = async (req, res) => {
    const {courseId, title,name, description, questions } = req.body;
    try {
        console.log('req body : ', req.body);
        const newQuiz = new QuizModel({courseId,name, title, description, questions });
        await newQuiz.save();
        res.status(201).json({success:true, message: "Quiz created successfully"});
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const updateQuiz = async (req, res) => {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    try {
        const updatedQuiz = await QuizModel.findByIdAndUpdate(id, { title, description, questions }, { new: true });
        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json(updatedQuiz);
    } catch (error) {
        console.error("Error updating quiz:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedQuiz = await QuizModel.findByIdAndDelete(id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Error deleting quiz:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
