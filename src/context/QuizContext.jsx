import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DIFFICULTY_CONFIG } from "../data";
import { computeStreak } from "../utils/streak";

const QuizContext = createContext(null);

const STORAGE_KEY = "codequiz_data";

const defaultUser = {
  name: "",
  totalQuestions: 0,
  bestScore: 0,
  streak: 0,
  lastPlayDate: null,
  history: [], // { id, language, difficulty, score, total, correct, date }
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

export function QuizProvider({ children }) {
  const stored = loadFromStorage();
  const [user, setUser] = useState(stored?.user || defaultUser);
  const [session, setSession] = useState(null);

  useEffect(() => {
    saveToStorage({ user });
  }, [user]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  }, []);

  const startSession = useCallback((questions, language, difficulty) => {
    setSession({
      questions,
      language,
      difficulty,
      currentIndex: 0,
      answers: [],
      score: 0,
      startedAt: Date.now(),
    });
  }, []);

  const submitAnswer = useCallback((answer) => {
    setSession((prev) => {
      if (!prev) return prev;
      const q = prev.questions[prev.currentIndex];
      const correct = answer === q.answer;
      const pts = correct ? DIFFICULTY_CONFIG[prev.difficulty].points : 0;
      return {
        ...prev,
        answers: [
          ...prev.answers,
          { questionId: q.id, question: q.question, selected: answer, correctAnswer: q.answer, correct, points: pts },
        ],
        score: prev.score + (correct ? 1 : 0), // Score += 1 per requirement
        currentIndex: prev.currentIndex + 1,
      };
    });
  }, []);

  // Finish the quiz session: update history, totals, best score, and streak
  const finishSession = useCallback((finishedSession) => {
    const s = finishedSession;
    if (!s) return;

    const correctCount = s.answers.filter((a) => a.correct).length;
    const totalPoints = s.answers.reduce((sum, a) => sum + a.points, 0);

    const record = {
      id: Date.now(),
      language: s.language,
      difficulty: s.difficulty,
      score: totalPoints,
      correct: correctCount,
      total: s.questions.length,
      date: new Date().toISOString(),
    };

    setUser((prev) => {
      const { streak, today } = computeStreak(prev.lastPlayDate, prev.streak);
      return {
        ...prev,
        totalQuestions: prev.totalQuestions + s.questions.length,
        bestScore: Math.max(prev.bestScore, totalPoints),
        streak,
        lastPlayDate: today,
        history: [record, ...prev.history].slice(0, 50),
      };
    });

    return record;
  }, []);

  const clearSession = useCallback(() => setSession(null), []);

  const resetAllData = useCallback(() => {
    setUser(defaultUser);
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Performance board: aggregate score by language, ranked top to bottom
  const getPerformanceBoard = useCallback(() => {
    const totals = {};
    user.history.forEach((h) => {
      totals[h.language] = (totals[h.language] || 0) + h.score;
    });
    return Object.entries(totals)
      .map(([language, score]) => ({ language, score }))
      .sort((a, b) => b.score - a.score);
  }, [user.history]);

  return (
    <QuizContext.Provider
      value={{
        user,
        session,
        updateUser,
        startSession,
        submitAnswer,
        finishSession,
        clearSession,
        resetAllData,
        getPerformanceBoard,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used inside QuizProvider");
  return ctx;
}
