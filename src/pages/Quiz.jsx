import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { useTimer } from "../hooks/useTimer";
import { DIFFICULTY_CONFIG, LANGUAGES, TIME_PER_QUESTION, getRandomQuestions } from "../data";

export default function Quiz() {
    const { language, difficulty } = useParams();
    const { session, startSession, submitAnswer, finishSession, clearSession } = useQuiz();
    const navigate = useNavigate(); 
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [locked, setLocked] = useState(false);
    const initialized = useRef(false);

    const cfg = DIFFICULTY_CONFIG[difficulty];
    const langInfo = LANGUAGES[language];

    // Initialize session on mount 
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            const question = getRandomQuestions(language, difficulty, 10);
            startSession(question, language, difficulty);
        }
    }, [language, difficulty, startSession]);

    const handleExpire = useCallback(() => {
        if (!locked) {
            setLocked(true);
            setFeedback("timeout");
            submitAnswer(null);
            setTimeout(() => {
                setSelected(null);
                setFeedback(null);
                setLocked(false);
            }, 1200);
        }
    }, [locked, submitAnswer]);

    //timer controls
    const { seconds, start, reset, progress } = useTimer(TIME_PER_QUESTION, handleExpire);

    //reset the timer when a new questions loads
    useEffect(() => {
        if (!session) return;
        reset(TIME_PER_QUESTION);
        setSelected(null);
        setFeedback(null);
        setLocked(false);
        const t = setTimeout(() => start(), 50);
        return () => clearTimeout(t);
    }, [session?.currentIndex]);

    //automatically navi to result once questiosn run out
    useEffect(() => {
        if (!session) return;
        if (session.currentIndex >= session.questions.length) {
        navigate("/results");
        }
    }, [session?.currentIndex]);

    if (!session || !langInfo || !cfg) return null;
    if (session.currentIndex >= session.questions.length) return null;

    //deriving the current question and progress num
    const q = session.questions[session.currentIndex];
    const questionNum = session.currentIndex + 1;
    const total = session.questions.length;

    //handle the answer click
    function handleSelect(option) {
        if (locked) return;
        setLocked(true);
        setSelected(option);
        const correct = option === q.answer;
        setFeedback(correct ? "correct" : "wrong");
        submitAnswer(option);
        setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        setLocked(false);
        }, 1100);
    }

    //timer color based on progress
    const timerColor = progress > 0.5 ? "#16a34a" : progress > 0.25 ? "#d97706" : "#dc2626";

    return ( 
        //     {/* time ring = 20s */}

        //     {/* question rendering 
        //     - Correct while playing, provide the answer
        //     - Score += 1 */}

        //     {/* answer feedback */}

        <div className="quiz-page">
            <div className="quiz-header">
                <div className="quiz-meta">
                    <span className="lang-tag">{langInfo.icon} {langInfo.label}</span>
                    <span className="diff-tag" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    <span className="quiz-progress">{questionNum} / {total}</span>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${(questionNum / total) * 100}%`, background: cfg.color }} />
                </div>
            </div>

            <div className="timer-row">
                <div className="timer-ring" style={{ "--color": timerColor }}>
                <svg viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    <circle
                    cx="24" cy="24" r="20" fill="none" stroke={timerColor} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
                    strokeLinecap="round"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                    />
                </svg>
                <span className="timer-num" style={{ color: timerColor }}>{seconds}</span>
                </div>
            </div>

            <div className={`question-card ${feedback ? `feedback-${feedback}` : ""}`}>
                <p className="question-text">{q.question}</p>
            </div>

            <div className="options-grid">
                {q.options.map((opt, i) => {
                let cls = "option-btn";
                if (selected === opt) cls += feedback === "correct" ? " correct" : " wrong";
                if (feedback && opt === q.answer && selected !== opt) cls += " reveal";
                return (
                    <button key={i} className={cls} onClick={() => handleSelect(opt)} disabled={locked}>
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="option-text">{opt}</span>
                    </button>
                );
                })}
            </div>

            {feedback && (
                <div className={`feedback-toast ${feedback}`}>
                    {feedback === "correct" && `✓ Correct!`}
                    {feedback === "wrong" && `✗ The correct answer was: ${q.answer}`}
                    {feedback === "timeout" && `⏰ Time's up! Answer: ${q.answer}`}
                </div>
            )}

      <button className="btn btn-ghost quit-btn" onClick={() => { clearSession(); navigate("/"); }}>
        Quit Quiz
      </button>
    </div>
    )
}