import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { LANGUAGES } from "../data";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function PerformanceBoard() {
  const { user, getPerformanceBoard } = useQuiz();
  const navigate = useNavigate();
  const board = getPerformanceBoard();

  return (
    <div className="performance-page">
      <div className="page-header">
        <h2>🏆 Performance Board</h2>
        <p className="page-sub">Your scores ranked by programming language.</p>
      </div>

      {board.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No games played yet. Start your first quiz!</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>Play Now</button>
        </div>
      ) : (
        <>
          <div className="rank-list">
            {board.map((entry, i) => {
              const lang = LANGUAGES[entry.language];
              return (
                <div key={entry.language} className={`rank-row ${i < 3 ? "top-" + (i + 1) : ""}`}>
                  <span className="rank-position">{MEDALS[i] || `#${i + 1}`}</span>
                  <span className="rank-icon">{lang?.icon}</span>
                  <span className="rank-name">{lang?.label}</span>
                  <span className="rank-score">{entry.score} pts</span>
                </div>
              );
            })}
          </div>

          <h3 className="section-title">Recent Sessions</h3>
          <div className="lb-table">
            <div className="lb-row lb-header">
              <span>Language</span>
              <span>Level</span>
              <span>Score</span>
              <span>Date</span>
            </div>
            {user.history.slice(0, 10).map((game) => {
              const lang = LANGUAGES[game.language];
              return (
                <div key={game.id} className="lb-row">
                  <span className="lb-lang">{lang?.icon} {lang?.label}</span>
                  <span className="lb-diff-text">{game.difficulty}</span>
                  <span className="lb-score">{game.score} pts ({game.correct}/{game.total})</span>
                  <span className="lb-date">{new Date(game.date).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button className="btn btn-primary mt-4" onClick={() => navigate("/")}>Play Again</button>
    </div>
  );
}
