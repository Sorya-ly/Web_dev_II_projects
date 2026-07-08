import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { useState } from "react";
import { DIFFICULTY_CONFIG, LANGUAGES } from "../data";

export default function Profile() {
  const { user, updateUser, resetAllData } = useQuiz();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleSaveName(e) {
    e.preventDefault();
    if (nameInput.trim()) {
      updateUser({ name: nameInput.trim() });
      setEditing(false);
    }
  }

  function handleReset() {
    resetAllData();
    navigate("/");
  }

  // Performance by difficulty (across all languages)
  const diffBreakdown = Object.keys(DIFFICULTY_CONFIG).map((d) => {
    const games = user.history.filter((h) => h.difficulty === d);
    const best = games.reduce((max, g) => Math.max(max, g.score), 0);
    const totalCorrect = games.reduce((sum, g) => sum + g.correct, 0);
    const totalQ = games.reduce((sum, g) => sum + g.total, 0);
    return { difficulty: d, games: games.length, best, accuracy: totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0 };
  });

  const totalPoints = user.history.reduce((sum, g) => sum + g.score, 0);

  return (
    <div className="profile-page">
      <div className="profile-header-card">
        <div className="avatar">{user.name ? user.name[0].toUpperCase() : "?"}</div>
        {editing ? (
          <form className="name-edit-form" onSubmit={handleSaveName}>
            <input className="name-input" value={nameInput} onChange={(e) => setNameInput(e.target.value)} maxLength={24} autoFocus />
            <button className="btn btn-primary" type="submit">Save</button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <div className="profile-name-row">
            <h2 className="profile-name">{user.name || "Anonymous"}</h2>
            <button className="btn btn-ghost btn-small" onClick={() => setEditing(true)}>✏️ Edit</button>
          </div>
        )}
        <p className="profile-tagline">
          {user.history.length === 0 ? "No games yet — start playing!" : `${user.history.length} quiz${user.history.length > 1 ? "zes" : ""} completed`}
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-big">{user.bestScore}</span>
          <span className="stat-lbl">Best Score</span>
        </div>
        <div className="stat-card">
          <span className="stat-big">{totalPoints}</span>
          <span className="stat-lbl">Total Points</span>
        </div>
        <div className="stat-card">
          <span className="stat-big">{user.streak}🔥</span>
          <span className="stat-lbl">Day Streak</span>
        </div>
      </div>

      <div className="diff-breakdown">
        <h3 className="section-title">Performance by Difficulty</h3>
        {diffBreakdown.map(({ difficulty, games, best, accuracy }) => {
          const cfg = DIFFICULTY_CONFIG[difficulty];
          return (
            <div key={difficulty} className="diff-row">
              <span className="diff-label" style={{ color: cfg.color }}>{cfg.label}</span>
              <div className="diff-info">
                <span>{games} game{games !== 1 ? "s" : ""}</span>
                <span>Best: {best} pts</span>
                <span>{accuracy}% accuracy</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="diff-breakdown">
        <h3 className="section-title">Recent Languages Played</h3>
        {user.history.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No quizzes played yet.</p>
        ) : (
          [...new Set(user.history.map((h) => h.language))].map((langId) => {
            const lang = LANGUAGES[langId];
            const count = user.history.filter((h) => h.language === langId).length;
            return (
              <div key={langId} className="diff-row">
                <span className="diff-label">{lang?.icon} {lang?.label}</span>
                <div className="diff-info"><span>{count} session{count !== 1 ? "s" : ""}</span></div>
              </div>
            );
          })
        )}
      </div>

      <div className="danger-zone">
        <h3 className="section-title">Data</h3>
        {!confirmReset ? (
          <button className="btn btn-danger" onClick={() => setConfirmReset(true)}>Reset All Data</button>
        ) : (
          <div className="confirm-reset">
            <p>This will erase all your scores, streak, and history. Are you sure?</p>
            <button className="btn btn-danger" onClick={handleReset}>Yes, reset everything</button>
            <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
