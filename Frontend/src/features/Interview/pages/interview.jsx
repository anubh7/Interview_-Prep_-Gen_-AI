import '../style/interview.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useInterview } from '../hook/useinterview.js'

const splitRoadmapTasks = (tasks) => {
  if (!tasks) return []

  let points = tasks
    .split(/;;|\n|;\s*|\s+(?=\d+[.)]\s)/)
    .map((task) => task.trim())
    .filter(Boolean)

  if (points.length === 1) {
    points = tasks
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map((task) => task.trim())
      .filter(Boolean)
  }

  return points.slice(0, 3).map((task) => task.replace(/^\d+[.)]\s*/, ''))
}

const Interview = () => {
  const { interviewId } = useParams()
  const {report, loading, GetReportById, DownloadResumePdf} = useInterview()
  const [openQuestion, setOpenQuestion] = useState(-1)
  const [activeSection, setActiveSection] = useState('technical')

  useEffect(() => {
    if (interviewId) {
      GetReportById(interviewId)
    }
  }, [GetReportById, interviewId])

  if (loading || !report) {
    return (
      <main className="interview-dashboard">
        <section className="report-shell report-loading">
          <p>{loading ? 'Loading interview report...' : 'Interview report not found.'}</p>
        </section>
      </main>
    )
  }

  const visibleQuestions = activeSection === 'behavioral'
    ? report.behavioralQuestions
    : report.technicalQuestions

  return (
    <main className="interview-dashboard">
      <section className="report-shell">
        <aside className="report-sidebar">
          <p className="sidebar-label">SECTIONS</p>
          <nav className="section-nav" aria-label="Interview report sections">
            <button className={activeSection === 'technical' ? 'active' : ''} type="button" onClick={() => { setActiveSection('technical'); setOpenQuestion(-1) }}><span>◇</span>Technical Questions</button>
            <button className={activeSection === 'behavioral' ? 'active' : ''} type="button" onClick={() => { setActiveSection('behavioral'); setOpenQuestion(-1) }}><span>▣</span>Behavioral Questions</button>
            <button className={activeSection === 'roadmap' ? 'active' : ''} type="button" onClick={() => setActiveSection('roadmap')}><span>⌁</span>Road Map</button>
            <button className="download-resume-btn" type="button" onClick={() => DownloadResumePdf(interviewId)}><span>⇩</span>Download Resume PDF</button>
          </nav>
        </aside>

        <section className={`report-content ${activeSection === 'roadmap' ? 'roadmap-section' : ''}`}>
          {activeSection === 'roadmap' ? (
            <>
              <header className="report-header">
                <h1>Preparation Road Map</h1>
                <span>{report.preparationPlan.length} days</span>
              </header>
              <div className="roadmap-timeline">
                {report.preparationPlan.map((item) => (
                  <article className="roadmap-day" key={item.day}>
                    <span className="timeline-dot" />
                    <div className="roadmap-copy">
                      <h2>Day {item.day}: <span>{item.focus}</span></h2>
                      <ul className="roadmap-tasks">
                        {splitRoadmapTasks(item.tasks)
                          .map((task, taskIndex) => (
                            <li key={`${item.day}-${taskIndex}`}>{task.replace(/^\d+[.)]\s*/, '')}</li>
                          ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <header className="report-header">
                <h1>{activeSection === 'behavioral' ? 'Behavioral Questions' : 'Technical Questions'}</h1>
                <span>{visibleQuestions.length} questions</span>
              </header>
              <div className="question-list">
                {visibleQuestions.map((item, index) => (
                  <article className="question-card" key={item.question}>
                    <button
                      className="question-toggle"
                      type="button"
                      aria-expanded={openQuestion === index}
                      onClick={() => setOpenQuestion(openQuestion === index ? -1 : index)}
                    >
                      <span className="question-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="question-title">{item.question}</span>
                      <span className={`question-chevron ${openQuestion === index ? 'open' : ''}`}>⌄</span>
                    </button>

                    {openQuestion === index && (
                      <div className="question-details">
                        <div className="detail-block">
                          <span>INTENTION</span>
                          <p>{item.intention}</p>
                        </div>
                        <div className="detail-block">
                          <span>MODEL ANSWER</span>
                          <p>{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="skill-panel">
          <p className="sidebar-label">MATCH SCORE</p>
          <div className="score-card">
            <strong>{report.matchScore}<small>%</small></strong>
          </div>
          <p className="score-caption">
            {report.matchScore >= 81 ? 'Strong match for the role' : report.matchScore >= 61 ? 'Good match with some gaps' : report.matchScore >= 41 ? 'Moderate match with notable gaps' : 'Low match for the role'}
          </p>

          <p className="sidebar-label skill-label">SKILL GAPS</p>

          <div className="skill-list">
            {report.skillGaps.map((item) => (
              <article className={`skill-card ${item.severity}`} key={item.skill}>
                <h3>{item.skill}</h3>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default Interview