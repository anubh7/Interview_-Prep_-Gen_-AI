const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("Required numeric match score from 0 to 100"),
    technicalQuestions: z.array(z.string()).length(10).describe("Generate exactly ten technical questions"),
    behavioralQuestions: z.array(z.string()).length(10).describe("Generate exactly ten behavioral questions"),

    skillGaps: z.array(z.string()).min(3).describe("Generate at least three skill gaps"),

    preparationPlan: z.array(z.string()).length(7).describe("Generate exactly seven days of preparation"),
    title: z.string().describe("The title of the jobDescription for which the report is generated"),

});

async function GenerateInterviewReport({ jobDescription, resume, selfDescription, matchScore = 0 }) {
    const prompt = `Generate a complete interview report from the following job description, resume, and self-description.
Return valid JSON matching the provided schema. Do not omit any field or return empty arrays.
Use the supplied calculated matchScore of ${matchScore} as the candidate's final score. It was calculated from exact required-skill overlap between the Job Description and Resume/Self-Description. Do not replace or estimate this score.
Generate exactly 10 technical questions and exactly 10 behavioral questions. For every question,
include the question, intention, and a complete, interview-ready answer in one string using this format:
"Question: ... | Intention: ... | Answer: ...".
Write each Answer as a concise polished spoken response of 120 to 180 words that sounds natural when read aloud. Use short sentences and 2 to 3 short paragraphs.
Start with a direct opening statement, then explain the reasoning in simple language, give one realistic example or structured approach, mention relevant trade-offs or follow-up considerations, and finish with a concise takeaway.
For behavioral questions, answer using a complete STAR-style example with a clear Situation, Task, Action, and measurable or meaningful Result.
For technical questions, explain the key concept first, then practical implementation details, trade-offs, and one realistic example.
Use easy-to-speak wording, avoid jargon unless you briefly explain it, and do not repeat the question or provide a one-line answer.
Generate at least 3 skill gaps using this format:
"Skill: ... | Severity: ... | Type: ... | Answer: ...".
Generate an exactly 7-day preparation plan using this format:
"Day 1 | Focus: ... | Tasks: ...". The Tasks value must contain exactly three specific actions separated with ";;". Use specific details based on the candidate.
    Job Description: ${jobDescription}
    Resume: ${resume}
    Self-Description: ${selfDescription}`;


    const models = [
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash"
    ];
    let response;
    let lastError;

    for (const model of models) {
        try {
            response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: zodToJsonSchema(interviewReportSchema),
                }
            });
            break;
        } catch (error) {
            lastError = error;
            if (error?.status !== 503 && error?.status !== 429) {
                throw error;
            }
        }
    }

    if (!response) {
        throw lastError;
    }

    const parsedResponse = JSON.parse(response.text);
    const report = interviewReportSchema.parse({
        matchScore,
        technicalQuestions: parsedResponse.technicalQuestions ?? parsedResponse.technical_questions,
        behavioralQuestions: parsedResponse.behavioralQuestions ?? parsedResponse.behavioral_questions,
        skillGaps: parsedResponse.skillGaps ?? parsedResponse.skill_gaps,
        title: parsedResponse.title || "Interview Preparation Strategy",
        preparationPlan: parsedResponse.preparationPlan ?? parsedResponse.preparation_plan
    });

    const parseQuestion = (value) => {
        const [question = "", intention = "", answer = ""] = value.split(" | ");
        return {
            question: question.replace(/^Question:\s*/, ""),
            intention: intention.replace(/^Intention:\s*/, ""),
            answer: answer.replace(/^Answer:\s*/, "")
        };
    };

    const parseSkillGap = (value) => {
        const [skill = "", severity = "", type = "", answer = ""] = value.split(" | ");
        return {
            skill: skill.replace(/^Skill:\s*/, ""),
            severity: severity.replace(/^Severity:\s*/, "").trim().toLowerCase(),
            type: type.replace(/^Type:\s*/, ""),
            answer: answer.replace(/^Answer:\s*/, "")
        };
    };

    const parsePreparationPlan = (value, index) => {
        const [day = "", focus = "", tasks = ""] = value.split(" | ");
        const parsedDay = Number(day.match(/^Day\s+(\d+)/)?.[1]);
        return {
            day: parsedDay || index + 1,
            focus: focus.replace(/^Focus:\s*/, ""),
            tasks: tasks.replace(/^Tasks:\s*/, "")
        };
    };

    return {
        title: report.title,
        matchScore: report.matchScore,
        technicalQuestions: report.technicalQuestions.map(parseQuestion),
        behavioralQuestions: report.behavioralQuestions.map(parseQuestion),
        skillGaps: report.skillGaps.map(parseSkillGap),
        preparationPlan: report.preparationPlan.map(parsePreparationPlan)
    };

}

// this function generates a PDF from HTML content using Puppeteer
async function GeneratePdffromHtml(htmlContent) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();
    return pdfBuffer;
}

//this function generates a PDF of the resume based on the provided resume, self-description, and job description
async function GenerateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfschema = z.object({
        html: z.string().describe("HTML content of the resume to be converted to PDF")
    });

    const prompt = `Generate a resume HTML for a candidate based on the following information:
                       resume: ${resume}
                       selfDescription: ${selfDescription}
                       jobDescription: ${jobDescription}

                       The response should be a valid JSON object with a single field "html" containing the HTML content of the resume. The HTML should be well-structured, visually appealing, and suitable for conversion to PDF.
                       The resume should be tailored to the job description, highlighting relevant skills and experiences. Use a professional format with clear sections for contact information, summary, work experience, education, skills, and any other relevant sections. Ensure that the HTML is responsive and can be easily converted to a PDF format.
                       The content of the resume should not sound like it was generated by AI and should be as close to a human-written resume as possible. Avoid generic statements and focus on specific achievements and experiences that align with the job description.
                       You can highlight the content using bold, italics, and headings. Use bullet points for lists and ensure that the overall layout is clean and professional.
                       The resume should be ATS friendly, meaning it should be easily readable by applicant tracking systems. Avoid using images or graphics that may not be parsed correctly by ATS software. Use standard fonts and formatting to ensure compatibility.
                       The resume not be so long, it should be concise and focused on the most relevant information. Aim for a length of 1-page depending on the amount of experience and information provided.`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(resumePdfschema),
        }
    });

    const JsonContent= JSON.parse(response.text);

    const pdfBuffer = await GeneratePdffromHtml(JsonContent.html);

    return pdfBuffer;
}



module.exports = {GenerateInterviewReport, GenerateResumePdf};