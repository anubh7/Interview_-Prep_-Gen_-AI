import "../style/Home.scss";
import {useInterview} from "../hook/useinterview.js";
import {useEffect,useState,useRef} from "react";
import { useNavigate } from "react-router";

const Home = () => {
    const { GenerateReport, reports, GetAllReports } = useInterview();
    const [jobDescription,setJobDescription] = useState("")
    const [selfDescription,setSelfDescription] = useState("")
    const resumeInputRef = useRef(null)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [resumeName, setResumeName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        GetAllReports();
    }, [GetAllReports]);

    const handleGenerateReport = async () => {
        setError("");
        if (!jobDescription.trim()) {
            setError("Please enter a job description.");
            return;
        }

        const jdWords = jobDescription.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || [];
        const uniqueJdWords = new Set(jdWords);
        if (jobDescription.trim().length < 40 || jdWords.length < 8 || uniqueJdWords.size < 5) {
            setError("Please enter a real, detailed job description instead of random or incomplete text.");
            return;
        }

        const resumeFile = resumeInputRef.current?.files[0];
        if (!resumeFile && !selfDescription.trim()) {
            setError("Upload a resume or enter a self-description.");
            return;
        }

        setLoading(true);
        try {
            const data = await GenerateReport(jobDescription, selfDescription, resumeFile);
            if (data?._id) {
                await GetAllReports();
                navigate(`/interview/${data._id}`);
            } else {
                setError("The interview strategy could not be generated.");
            }
        } catch (requestError) {
            const message = requestError?.response?.data?.message;
            setError(message || "The interview strategy could not be generated.");
        } finally {
            setLoading(false);
        }

    };
    if (loading) {
        return (
            <main className="home">
                <h1>Loading your interview plan...</h1>
            </main>
        );
    }

    return (
        <main className="home">
            <header className="home-header">
                <h1>Create Your Custom <span>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a<br />
                    winning strategy.</p>
                <div className="header-dot" aria-hidden="true">+</div>
            </header>

            <section className="interview-card">
                <div className="job-panel">
                    <div className="panel-heading">
                        <span className="heading-icon">▰</span>
                        <h2>Target Job Description</h2>
                        <span className="required-badge">Required</span>
                    </div>
                    <textarea
                        name="jobDescription"
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here...&#10;&#10;e.g. Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."
                    />
                    <span className="character-count">{jobDescription.length} / 5000 chars</span>
                </div>

                <div className="profile-panel">
                    <div className="panel-heading">
                        <span className="heading-icon">♟</span>
                        <h2>Your Profile</h2>
                    </div>

                    <div className="upload-section">
                        <div className="field-label">
                            <label htmlFor="resume">Upload Resume</label>
                            <span>(Required)</span>
                        </div>
                        <label className="upload-box" htmlFor="resume">
                            <span className="upload-icon">⌃</span>
                            <strong>{resumeName || "Click to upload or drag & drop"}</strong>
                            <small>PDF, Max 3MB</small>
                        </label>
                        <input
                            ref={resumeInputRef}
                            hidden
                            type="file"
                            name="resume"
                            id="resume"
                            accept=".pdf,application/pdf"
                            onChange={(event) => setResumeName(event.target.files[0]?.name || "")}
                        />
                    </div>

                    <div className="or-divider"><span>OR</span></div>

                    <div className="self-description">
                        <div className="field-label">
                            <label htmlFor="selfDescription">Quick Self-Description</label>
                        </div>
                        <textarea
                            onChange={(e) => setSelfDescription(e.target.value)}
                            value={selfDescription}
                            name="selfDescription"
                            id="selfDescription"
                            placeholder="Briefly describe your experience, key skills, and years of experience (if you don't have a resume)"
                        />
                    </div>

                    <div className="info-note">
                        <span>i</span>
                        <p>{error || "Enter a Resume or a Self Description is required to generate a personalized plan."}</p>
                    </div>
                </div>
                <footer className="card-footer">
                    <button onClick={handleGenerateReport} className="generate-btn" type="button">
                        ✦ &nbsp; Generate My Interview Strategy
                    </button>
                </footer>
            </section>

            {reports.length > 0 && (
                <section className="recent-reports">
                    <div className="recent-reports-heading">
                        <h2>Recent Interview Reports</h2>
                        <span>{reports.length} reports</span>
                    </div>
                    <div className="reports-list">
                        {reports.slice(0, 4).map((report) => (
                            <button
                                className="report-card"
                                type="button"
                                key={report._id}
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <span className="report-card-icon">⌁</span>
                                <span className="report-card-copy">
                                    <strong>{report.title || "Interview Preparation"}</strong>
                                    <small>{new Date(report.createdAt).toLocaleDateString()}</small>
                                </span>
                                <span className="report-score">{report.matchScore || 0}%</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <nav className="home-footer" aria-label="Footer navigation">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#help">Help Center</a>
            </nav>

        </main>
    )
}

export default Home