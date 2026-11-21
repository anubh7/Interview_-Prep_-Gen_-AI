import { getAllInterviewReports, getInterviewReportById, generateInterviewReport, downloadResumePdf } from "../services/interview.api";
import { useCallback, useContext } from "react";
import { InterviewContext } from "../interview.context.js";

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const GenerateReport = useCallback(async (jobDescription, selfDescription, resumeFile) => {
        setLoading(true);
        try {
            const response = await generateInterviewReport(jobDescription, selfDescription, resumeFile);
            setReport(response.data);
            return response.data;
        } catch (error) {
            console.error("Error generating interview report:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport]);

    const GetReportById = useCallback(async (interviewId) => {
        setLoading(true);
        try {
            const response = await getInterviewReportById(interviewId);
            setReport(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching interview report by ID:", error);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setReport]);

    const GetAllReports = useCallback(async () => {
        try {
            const response = await getAllInterviewReports();
            setReports(response.data);
            return response.data;
        } catch (error) {  
            console.error("Error fetching all interview reports:", error);
        }
    }, [setReports]);

    const DownloadResumePdf = useCallback(async (interviewId) => {
        const blob = await downloadResumePdf(interviewId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `interview-resume-${interviewId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }, []);

    return {
        loading,
        report,
        reports,
        GenerateReport,
        GetReportById,
        GetAllReports,
        DownloadResumePdf
    };
}