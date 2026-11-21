import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // This is important to include if your server is setting cookies
});

export const generateInterviewReport = async (jobDescription, selfDescription, resumeFile) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    const response = await api.post("/api/interview/generate", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
}

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/reports");
    return response.data;
}

export const downloadResumePdf = async (interviewId) => {
    const response = await api.post(
        `/api/interview/resume/PDF/${interviewId}`,
        {},
        { responseType: "blob" }
    );
    return response.data;
}