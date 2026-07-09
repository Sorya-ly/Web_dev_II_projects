import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { LANGUAGES, DIFFICULTY_CONFIG } from "../data";


export default function Home() {
  const { user, updateUser, startSession } = useQuiz();
  const navigate = useNavigate();

  const [nameInput, setNameInput] = useState(user.name || "");
  const [nameSet, setNameSet] = useState(!!user.name);
  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");

  function handleSetName(e) {
    e.preventDefault();
    if (nameInput.trim()) {
      updateUser({ name: nameInput.trim() });
      setNameSet(true);
    }
  }

  function handleStartQuiz() {
    navigate(`/quiz/${language}/${difficulty}`);
  }

  if (!nameSet) {
    return (
      <div className="welcome-gate">
        <div className="welcome-card">
          <div className="brand-icon">{"</>"}</div>
          <h1>Welcome to CodeQuiz</h1>
          <p>Enter your name to get started</p>
          <form onSubmit={handleSetName} className="name-form">
            <input
              className="name-input"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={24}
              autoFocus
            />
            <button className="btn btn-primary" type="submit">Continue →</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero / Welcome */}
      <div className="welcome-hero">
        <div className="hero-decor left">
          <span className="decor-chip">{"</>"}</span>
        </div>
        <div className="hero-decor right">
          <span className="trophy">🏆</span>
        </div>
        <h1 className="welcome-text">
          Welcome back,<br />
          <span className="user-name">{user.name} 👋</span>
        </h1>
        <p className="welcome-sub">Test your coding knowledge and level up!</p>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon stat-icon-blue">📄</div>
          <div className="stat-num">{user.totalQuestions}</div>
          <div className="stat-text">Total Questions</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon stat-icon-amber">⭐</div>
          <div className="stat-num">{user.bestScore}</div>
          <div className="stat-text">Best Score</div>
        </div>
        <div className="stat-box">
          <div className="stat-icon stat-icon-green">🔥</div>
          <div className="stat-num">{user.streak}</div>
          <div className="stat-text">Day Streak</div>
        </div>
      </div>

      {/* Start a new quiz */}
      <div className="quiz-setup-card">
        <h2 className="setup-title">Start a New Quiz</h2>

        <div className="setup-row">
          <div className="setup-col">
            <label className="setup-label">Choose Programming Language</label>
            <div className="lang-select-wrap">
              <select
                className="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {Object.values(LANGUAGES).map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="setup-col">
            <label className="setup-label">Choose Level</label>
            <div className="level-pills">
              {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  className={`level-pill ${difficulty === key ? "active" : ""}`}
                  style={difficulty === key ? { borderColor: cfg.color, background: cfg.bg, color: cfg.color } : {}}
                  onClick={() => setDifficulty(key)}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-large full-width start-btn" onClick={handleStartQuiz}>
          ▶ Start the Quiz
        </button>
      </div>
    </div>
  );
}
