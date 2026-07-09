import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Quiz from "./Quiz";
import { useQuiz } from "../context/QuizContext";
import { useTimer } from "../hooks/useTimer";
import { getRandomQuestions } from "../data";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ language: "python", difficulty: "easy" }),
  };
});

vi.mock("../context/QuizContext", () => ({
  useQuiz: vi.fn(),
}));

vi.mock("../hooks/useTimer", () => ({
  useTimer: vi.fn(),
}));

vi.mock("../data", () => ({
  LANGUAGES: {
    python: { id: "python", label: "Python" },
  },
  DIFFICULTY_CONFIG: {
    easy: { label: "Easy", color: "#16a34a", bg: "#dcfce7" },
  },
  TIME_PER_QUESTION: 20,
  getRandomQuestions: vi.fn(),
}));

const QUESTIONS = [
  { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
  { question: "What is a closure?", options: ["A", "B", "C", "D"], answer: "A" },
];

function makeSession(overrides = {}) {
  return {
    questions: QUESTIONS,
    currentIndex: 0,
    answers: [],
    language: "python",
    difficulty: "easy",
    ...overrides,
  };
}

function renderQuiz() {
  return render(
    <MemoryRouter initialEntries={["/quiz/python/easy"]}>
      <Quiz />
    </MemoryRouter>
  );
}

describe("Quiz", () => {
  let startSession, submitAnswer, finishSession, clearSession, timerStart, timerReset;

  beforeEach(() => {
    mockNavigate.mockReset();
    startSession = vi.fn();
    submitAnswer = vi.fn();
    finishSession = vi.fn();
    clearSession = vi.fn();
    timerStart = vi.fn();
    timerReset = vi.fn();
    getRandomQuestions.mockReturnValue(QUESTIONS);

    useTimer.mockReturnValue({
      seconds: 20,
      start: timerStart,
      reset: timerReset,
      progress: 1,
    });
  });

  it("initializes a session exactly once on mount", () => {
    useQuiz.mockReturnValue({
      session: null,
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    const { rerender } = renderQuiz();
    rerender(
      <MemoryRouter initialEntries={["/quiz/python/easy"]}>
        <Quiz />
      </MemoryRouter>
    );

    expect(startSession).toHaveBeenCalledTimes(1);
    expect(startSession).toHaveBeenCalledWith(QUESTIONS, "python", "easy");
  });

  it("renders nothing while there is no session yet", () => {
    useQuiz.mockReturnValue({
      session: null,
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    const { container } = renderQuiz();
    expect(container.firstChild).toBeNull();
  });

  it("renders the current question and options once a session exists", () => {
    useQuiz.mockReturnValue({
      session: makeSession(),
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    renderQuiz();

    expect(screen.getByText("What is 2 + 2?")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    QUESTIONS[0].options.forEach((opt) => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
  });

  it("submits the selected answer and shows correct feedback", async () => {
    useQuiz.mockReturnValue({
      session: makeSession(),
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    renderQuiz();
    const user = userEvent.setup();

    await user.click(screen.getByText("4"));

    expect(submitAnswer).toHaveBeenCalledWith("4");
    expect(screen.getByText(/Correct!/)).toBeInTheDocument();
  });

  it("shows the correct answer when the wrong option is picked", async () => {
    useQuiz.mockReturnValue({
      session: makeSession(),
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    renderQuiz();
    const user = userEvent.setup();

    await user.click(screen.getByText("3"));

    expect(submitAnswer).toHaveBeenCalledWith("3");
    expect(screen.getByText(/The correct answer was: 4/)).toBeInTheDocument();
  });

  it("locks options while feedback is showing, preventing double submission", async () => {
    useQuiz.mockReturnValue({
      session: makeSession(),
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    renderQuiz();
    const user = userEvent.setup();

    await user.click(screen.getByText("4"));
    // All option buttons should now be disabled.
    QUESTIONS[0].options.forEach((opt) => {
      expect(screen.getByText(opt).closest("button")).toBeDisabled();
    });
    expect(submitAnswer).toHaveBeenCalledTimes(1);
  });

  it("navigates to /results once currentIndex reaches the end of the question list", () => {
    useQuiz.mockReturnValue({
      session: makeSession({ currentIndex: QUESTIONS.length }),
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    renderQuiz();

    expect(mockNavigate).toHaveBeenCalledWith("/results");
  });

  it("calls clearSession and navigates home when 'Quit Quiz' is clicked", async () => {
    useQuiz.mockReturnValue({
      session: makeSession(),
      startSession,
      submitAnswer,
      finishSession,
      clearSession,
    });

    renderQuiz();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /quit quiz/i }));

    expect(clearSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
