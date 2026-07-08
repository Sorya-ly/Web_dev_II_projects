import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { DIFFICULTY_CONFIG, LANGUAGES } from "../data";
import { useEffect, useState, useRef } from "react";

export default function Results() {
  const { session, clearSession, finishSession } = useQuiz();
  const navigate = useNavigate();
  const [animIn, setAnimIn] = useState(false);
  const [record, setRecord] = useState(null);
  const finished = useRef(false);

  useEffect(() => {
    if (!session) { navigate("/"); return; }
    if (!finished.current) {
      finished.current = true;
      const r = finishSession(session);
      setRecord(r);
    }
    const t = setTimeout(() => setAnimIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!record || !session) return null;

  const cfg = DIFFICULTY_CONFIG[record.difficulty];
  const langInfo = LANGUAGES[record.language];
  const pct = Math.round((record.correct / record.total) * 100);

  let grade, gradeColor, gradeMsg;
  if (pct >= 90) { grade = "A+"; gradeColor = "#16a34a"; gradeMsg = "Outstanding!"; }
  else if (pct >= 75) { grade = "B"; gradeColor = "#65a30d"; gradeMsg = "Great job!"; }
  else if (pct >= 60) { grade = "C"; gradeColor = "#d97706"; gradeMsg = "Not bad!"; }
  else if (pct >= 40) { grade = "D"; gradeColor = "#ea580c"; gradeMsg = "Keep practicing!"; }
  else { grade = "F"; gradeColor = "#dc2626"; gradeMsg = "Try again!"; }

  const answers = session.answers || [];

  return (
    <div className={`results-page ${animIn ? "anim-in" : ""}`}>
      <div className="results-card">
        <div className="grade-badge" style={{ color: gradeColor, borderColor: gradeColor }}>{grade}</div>
        <h2 className="results-title">{gradeMsg}</h2>
        <p className="results-sub">
          {langInfo?.icon} {langInfo?.label} · {cfg?.label} · {record.correct} of {record.total} correct
        </p>

        <div className="score-display" style={{ color: gradeColor }}>
          {record.correct}<span className="score-max">/{record.total}</span>
        </div>
        <p className="score-points">+{record.score} points earned</p>

        <div className="pct-bar-bg">
          <div className="pct-bar-fill" style={{ width: `${pct}%`, background: gradeColor, transition: "width 1s ease 0.4s" }} />
        </div>
        <p className="pct-label">{pct}% accuracy</p>

        {answers.length > 0 && (
          <div className="answers-breakdown">
            <h3 className="breakdown-title">Question Breakdown</h3>
            {answers.map((a, i) => (
              <div key={i} className={`answer-row ${a.correct ? "correct" : "wrong"}`}>
                <span className="answer-icon">{a.correct ? "✓" : "✗"}</span>
                <div className="answer-info">
                  <p className="answer-q">{a.question}</p>
                  {!a.correct && <p className="answer-correct">Correct answer: {a.correctAnswer}</p>}
                </div>
                <span className="answer-pts">+{a.points}</span>
              </div>
            ))}
          </div>
        )}

        <div className="results-actions">
          <button className="btn btn-primary btn-large full-width" onClick={() => { clearSession(); navigate("/"); }}>
            Play Again
          </button>
          <button className="btn btn-ghost full-width" onClick={() => { clearSession(); navigate("/performance"); }}>
            🏆 Performance Board
          </button>
          <button className="btn btn-ghost full-width" onClick={() => { clearSession(); navigate("/profile"); }}>
            👤 My Profile
          </button>
        </div>
      </div>
    </div>
  );
}
