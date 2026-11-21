const pdfParse = require('pdf-parse');
const {GenerateInterviewReport,GenerateResumePdf} = require('../services/Ai.service');
const InterviewReport = require('../models/interviewreport.mofel');

/**
 * Generate an interview report based on job description, resume, and self-description
 * @param {string} jobDescription - The job description
 * @param {Object} resume - The resume file
 * @param {string} selfDescription - The self description
 * @returns {Promise<Object>} - The generated interview report
 */


const SKILL_TERMS = [
    "node.js", "express.js", "express", "mongodb", "mongoose", "redis", "rabbitmq", "kafka",
    "javascript", "typescript", "react", "next.js", "angular", "vue.js", "html", "css",
    "tailwind css", "bootstrap", "sass", "redux", "zustand", "graphql", "rest api", "rest",
    "python", "django", "flask", "fastapi", "java", "spring boot", "spring", "c++", "c#", ".net",
    "php", "laravel", "ruby", "rails", "go", "golang", "rust", "sql", "mysql", "postgresql",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github actions", "jenkins", "cicd",
    "linux", "microservices", "system design", "data structures", "algorithms", "jest", "mocha",
    "chai", "cypress", "playwright", "selenium", "oauth", "jwt", "rabbitmq", "firebase",
    "webpack", "vite", "figma", "agile", "scrum", "ci/cd", "unit testing", "api testing"
];

function normalizeSkillText(text) {
    return (text || "")
        .toLowerCase()
        .replace(/[^a-z0-9+#./-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function skillTextMatches(text, skill) {
    const paddedText = ` ${text} `;
    return paddedText.includes(` ${skill} `);
}

function calculateMatchScore(jobDescription, resumeText) {
    const jd = normalizeSkillText(jobDescription);
    const resume = normalizeSkillText(resumeText);

    if (!jd || !resume) return 0;

    const requiredSkills = [...new Set(SKILL_TERMS.filter((skill) => skillTextMatches(jd, skill)))];

    if (requiredSkills.length === 0) return 0;

    const matchedSkills = requiredSkills.filter((skill) => skillTextMatches(resume, skill));

    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
}

async function GenerateInterviewReportController(req, res) {
    try {
        const { selfDescription = "", jobDescription = "" } = req.body;

        if (!jobDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required"
            });
        }

        const meaningfulWords = jobDescription
            .toLowerCase()
            .match(/[a-z][a-z0-9+#.-]{2,}/g) || [];
        const uniqueWords = new Set(meaningfulWords);

        if (
            jobDescription.trim().length < 40 ||
            meaningfulWords.length < 8 ||
            uniqueWords.size < 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a real, detailed job description instead of random or incomplete text"
            });
        }

        if (!req.file && !selfDescription.trim()) {
            return res.status(400).json({
                success: false,
                message: "Resume file or self-description is required"
            });
        }

        let resumeText = selfDescription.trim();
        if (req.file) {
            if (req.file.mimetype !== "application/pdf") {
                return res.status(400).json({
                    success: false,
                    message: "Only PDF resume files are supported"
                });
            }

            const resumeContent = await new pdfParse.PDFParse(
                Uint8Array.from(req.file.buffer)
            ).getText();
            resumeText = resumeContent.text?.trim() || "";

            if (!resumeText) {
                return res.status(400).json({
                    success: false,
                    message: "The resume PDF did not contain readable text"
                });
            }
        }

        const calculatedMatchScore = calculateMatchScore(jobDescription, resumeText);

        const interviewReportByAI = await GenerateInterviewReport({
            jobDescription,
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            matchScore: calculatedMatchScore
        });

        const interviewReport = new InterviewReport({
            user: req.user.id,
            jobDescription,
            resume: resumeText,
            selfDescription: selfDescription.trim(),
            title: interviewReportByAI.title || jobDescription.slice(0, 100),
            ...interviewReportByAI
        });

        await interviewReport.save();

        return res.status(201).json({
            message: "Interview report generated successfully",
            success: true,
            data: interviewReport
        });
    } catch (error) {
        console.error("Error generating interview report:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate interview report"
        });
    }
}

async function GetInterviewReportByIdController(req, res) {
    const {interviewId} = req.params;
    try {
        const interviewReport = await InterviewReport.findById(interviewId);
        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            });
        }
        interviewReport.matchScore = calculateMatchScore(
            interviewReport.jobDescription,
            interviewReport.resume || interviewReport.selfDescription
        );
        return res.status(200).json({
            message: "Interview report fetched successfully for the given ID",
            success: true,
            data: interviewReport
        });
    } catch (error) {
        console.error("Error fetching interview report:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch interview report"
        });
    }
}

async function GetAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await InterviewReport.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('title matchScore resume selfDescription jobDescription createdAt');

        const recalculatedReports = interviewReports.map((report) => {
            const data = report.toObject();
            data.matchScore = calculateMatchScore(data.jobDescription, data.resume || data.selfDescription);
            delete data.resume;
            delete data.jobDescription;
            delete data.selfDescription;
            return data;
        });

        return res.status(200).json({
            message: "Interview reports fetched successfully",
            success: true,
            data: recalculatedReports
        });
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch interview reports"
        });
    }
}

async function GenerateResumePdfController(req, res) {
    const {interviewId} = req.params;
    try {
        const interviewReport = await InterviewReport.findById(interviewId);
        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            });
        }

        const {resume, selfDescription, jobDescription} = interviewReport;

        const pdfBuffer = await GenerateResumePdf({resume, selfDescription, jobDescription});

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="interview_report_${interviewId}.pdf"`,
            'Content-Length': pdfBuffer.length
        })

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating resume PDF:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate resume PDF"
        });
    }
}

module.exports={GenerateInterviewReportController, GetInterviewReportByIdController, GetAllInterviewReportsController, GenerateResumePdfController};