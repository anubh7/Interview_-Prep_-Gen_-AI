const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const interviewRouter = express.Router();
const interviewController = require('../controllers/interview.controller');

const upload = require('../middlewares/file.middleware');


/**
 * @route POST /api/interview/generate
 * @description Generate an interview report based on job description, resume, and self-description
 * @access private
 */
interviewRouter.post('/generate', authMiddleware,upload.single('resume'), interviewController.GenerateInterviewReportController);

/**
 * @route GET /api/interview/report/:interviewId
 * @description Get a specific interview report by its ID
 * @access private
 */
interviewRouter.get('/report/:interviewId', authMiddleware, interviewController.GetInterviewReportByIdController);

/**
 * @route GET /api/interview/reports
 * @description Get all interview reports for the authenticated user
 * @access private
 */
interviewRouter.get('/reports', authMiddleware, interviewController.GetAllInterviewReportsController);

/**
 * @route GET /api/interview/resume/PDF/:interviewId
 * @description Generate a PDF from the provided resume text
 * @access private
 */
interviewRouter.post('/resume/PDF/:interviewId', authMiddleware, interviewController.GenerateResumePdfController);


module.exports = interviewRouter;