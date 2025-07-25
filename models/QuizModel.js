import { model,Schema } from "mongoose";

const quizSchema = new Schema({
    courseId: {
        type:String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    name:{
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    questions: [{
        questionText: {
            type: String,
            required: true,
            trim: true
        },
        options:[
            {
                type: String,
                required: true,
                trim: true
            }
        ],
        correctAnswerIndex: {
            type: Number,
            required: true
        },
        correctAnswerDescription: {
            type: String,
            required: true,
            trim: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const QuizModel = model("Quiz", quizSchema);

export default QuizModel;