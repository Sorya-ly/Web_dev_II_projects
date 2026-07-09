import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { QuizProvider, useQuiz } from "./QuizContext.jsx";

const wrapper = ({ children }) => <QuizProvider>{children}</QuizProvider>;

function makeQuestions(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    question: `Q${i}`,
    answer: "correct",
  }));
}

describe("QuizContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.setSystemTime(new Date("2026-07-09T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws a clear error if useQuiz() is called outside the provider", () => {
    expect(() => renderHook(() => useQuiz())).toThrow(
      "useQuiz must be used inside QuizProvider"
    );
  });

  it("starts with default user state when localStorage is empty", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(result.current.user.streak).toBe(0);
    expect(result.current.user.bestScore).toBe(0);
    expect(result.current.user.history).toEqual([]);
  });

  it("submitAnswer records correct/incorrect answers and awards points by difficulty", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    const questions = makeQuestions(2);

    act(() => result.current.startSession(questions, "javascript", "medium"));
    act(() => result.current.submitAnswer("correct")); // right
    act(() => result.current.submitAnswer("wrong")); // wrong

    const session = result.current.session;
    expect(session.answers).toHaveLength(2);
    expect(session.answers[0].correct).toBe(true);
    expect(session.answers[0].points).toBe(20); // medium = 20
    expect(session.answers[1].correct).toBe(false);
    expect(session.answers[1].points).toBe(0);
    expect(session.score).toBe(1); // score counts correct answers, not points
    expect(session.currentIndex).toBe(2);
  });

  it("finishSession totals points, updates bestScore, and starts a streak of 1 on first play", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    const questions = makeQuestions(3);

    act(() => result.current.startSession(questions, "python", "hard"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.submitAnswer("wrong"));

    let record;
    act(() => {
      record = result.current.finishSession(result.current.session);
    });

    expect(record.score).toBe(60); // 2 correct * 30 (hard) points
    expect(record.correct).toBe(2);
    expect(record.total).toBe(3);

    expect(result.current.user.bestScore).toBe(60);
    expect(result.current.user.streak).toBe(1);
    expect(result.current.user.totalQuestions).toBe(3);
    expect(result.current.user.history[0]).toMatchObject({ score: 60, correct: 2 });
  });

  it("bestScore only increases, never decreases after a lower-scoring session", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    act(() => result.current.startSession(makeQuestions(1), "java", "hard"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.finishSession(result.current.session));
    expect(result.current.user.bestScore).toBe(30);

    act(() => result.current.startSession(makeQuestions(1), "java", "easy"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.finishSession(result.current.session));
    expect(result.current.user.bestScore).toBe(30); // unchanged, 10 < 30
  });

  it("persists user data to localStorage after every update", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    act(() => result.current.updateUser({ name: "Evelyn" }));

    const stored = JSON.parse(localStorage.getItem("codequiz_data"));
    expect(stored.user.name).toBe("Evelyn");
  });

  it("rehydrates user data from localStorage on mount", () => {
    localStorage.setItem(
      "codequiz_data",
      JSON.stringify({ user: { name: "Saved User", totalQuestions: 42, bestScore: 100, streak: 3, lastPlayDate: null, history: [] } })
    );

    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(result.current.user.name).toBe("Saved User");
    expect(result.current.user.totalQuestions).toBe(42);
  });

  it("resetAllData clears both in-memory state and localStorage", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    act(() => result.current.updateUser({ name: "Temp" }));
    expect(localStorage.getItem("codequiz_data")).not.toBeNull();

    act(() => result.current.resetAllData());
    expect(result.current.user.name).toBe("");
    expect(result.current.session).toBeNull();
    expect(localStorage.getItem("codequiz_data")).toBeNull();
  });

  it("caps history at 50 most-recent entries", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    for (let i = 0; i < 55; i++) {
      act(() => result.current.startSession(makeQuestions(1), "java", "easy"));
      act(() => result.current.submitAnswer("correct"));
      act(() => result.current.finishSession(result.current.session));
    }

    expect(result.current.user.history).toHaveLength(50);
  });

  it("getPerformanceBoard aggregates score per language and sorts descending", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });

    // python: 2 correct * hard(30) = 60
    act(() => result.current.startSession(makeQuestions(2), "python", "hard"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.finishSession(result.current.session));

    // java: 1 correct * easy(10) = 10
    act(() => result.current.startSession(makeQuestions(1), "java", "easy"));
    act(() => result.current.submitAnswer("correct"));
    act(() => result.current.finishSession(result.current.session));

    const board = result.current.getPerformanceBoard();
    expect(board[0]).toEqual({ language: "python", score: 60 });
    expect(board[1]).toEqual({ language: "java", score: 10 });
  });

  it("submitAnswer is a no-op if there is no active session", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    act(() => result.current.submitAnswer("correct"));
    expect(result.current.session).toBeNull();
  });
});
