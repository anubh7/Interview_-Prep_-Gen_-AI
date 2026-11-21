const mongoose = require('mongoose')

/**
 * job description schema
 * resume text
 * self description
 * 
 * Technical Questions
 *    [{
 *       question: String,
 *       intention: String,
 *       answer: String
 *  }]
 * Behavioral Questions:[{
 *       question: String,
 *       intention: String,
 *       answer: String
 * }]
 * skill gaps : [{
 *                  skill:""
 *                  severity: ""
 *                  type:string
 *                  answer:""
 *              }]
 * preparation tips(plan):[{
 *                          day: number,
 *                          focus: string,
 *                          tasks:string
 *                      }]
 */


const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
    type: String,
    required: [true, "Answer is required"]
}
}, {
    _id: false  //because we don't want to create a separate _id for each technical question, we want to embed them in the interview report document
});

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavioral Question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention is required"]
    },
    answer: {
    type: String,
    required: [true, "Answer is required"]
}
}, {
    _id: false  //because we don't want to create a separate _id for each technical question, we want to embed them in the interview report document
});

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"]
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: [true, "Severity is required"]
    },
    type: {
        type: String,
        required: [true, "Type is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
},{
    _id: false  //because we don't want to create a separate _id for each technical question, we want to embed them in the interview report document
});

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus is required"]
    },
    tasks: {
        type: String,
        required: [true, "Tasks are required"]
    }
});

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job Description is required"]
    },
    resume: {
        type: String,
        required: [true, "Resume is required"]
    },
    selfDescription: {
        type: String,
        default: ""
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    // these are sub schemas for technical questions, behavioral questions, skill gaps, and preparation plan
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    title: {
        type: String,
        required: [true, "Job Title is required"]
    }

},{
    timestamps: true
});

const interviewReportModel = mongoose.model('InterviewReport', interviewReportSchema);

module.exports = interviewReportModel;

