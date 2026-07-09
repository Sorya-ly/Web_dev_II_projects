import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Results from "./Results";
import { useQuiz } from "../context/QuizContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../context/QuizContext", () => ({
  useQuiz: vi.fn(),
}));

vi.mock("../data", () => ({
  LANGUAGES: {
    python: { id: "python", label: "Python" },
  },
  DIFFICULTY_CONFIG: {
    easy: { label: "Easy", color: "#16a34a", bg: "#dcfce7" },
  },
}));

function renderResults() {
  return render(
    <MemoryRouter>
      <Results />
    </MemoryRouter>
  );
}

function baseSession(overrides = {}) {
  return {
    answers: [
      { question: "2 + 2?", correct: true, points: 10, correctAnswer: "4" },
      { question: "Closures?", correct: false, points: 0, correctAnswer: "A" },
    ],
    ...overrides,
  };
}

function record(pct, overrides = {}) {
  const total = 10;
  const correct = Math.round((pct / 100) * total);
  return {
    difficulty: "easy",
    language: "python",
    correct,
    total,
    score: correct * 10,
    ...overrides,
  };
}

describe("Results", () => {
  let clearSession, finishSession;

  beforeEach(() => {
    mockNavigate.mockReset();
    clearSession = vi.fn();
    finishSession = vi.fn();
  });

  it("redirects to home if there is no active session", () => {
    useQuiz.mockReturnValue({ session: null, clearSession, finishSession });

    renderResults();

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("calls finishSession exactly once even if the component re-renders", async () => {
    finishSession.mockReturnValue(record(90));
    useQuiz.mockReturnValue({ session: baseSession(), clearSession, finishSession });

    const { rerender } = renderResults();
    rerender(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    );

    await waitFor(() => expect(finishSession).toHaveBeenCalledTimes(1));
  });

  it("shows an A+ grade and 'Outstanding!' message for 90%+ accuracy", async () => {
    finishSession.mockReturnValue(record(90));
    useQuiz.mockReturnValue({ session: baseSession(), clearSession, finishSession });

    renderResults();

    await waitFor(() => expect(screen.getByText("A+")).toBeInTheDocument());
    expect(screen.getByText("Outstanding!")).toBeInTheDocument();
    expect(screen.getByText("90% accuracy")).toBeInTheDocument();
  });

  it("shows an F grade for very low accuracy", async () => {
    finishSession.mockReturnValue(record(20));
    useQuiz.mockReturnValue({ session: baseSession(), clearSession, finishSession });

    renderResults();

    await waitFor(() => expect(screen.getByText("F")).toBeInTheDocument());
    expect(screen.getByText("Try again!")).toBeInTheDocument();
  });

  it("renders the question breakdown with correct/wrong markers", async () => {
    finishSession.mockReturnValue(record(50));
    useQuiz.mockReturnValue({ session: baseSession(), clearSession, finishSession });

    renderResults();

    await waitFor(() => expect(screen.getByText("2 + 2?")).toBeInTheDocument());
    expect(screen.getByText("Closures?")).toBeInTheDocument();
    expect(screen.getByText(/Correct answer: A/)).toBeInTheDocument();
  });

  it("omits the breakdown section when there are no answers", async () => {
    finishSession.mockReturnValue(record(50));
    useQuiz.mockReturnValue({ session: baseSession({ answers: [] }), clearSession, finishSession });

    renderResults();

    await waitFor(() => expect(screen.getByText(/accuracy/)).toBeInTheDocument());
    expect(screen.queryByText("Question Breakdown")).not.toBeInTheDocument();
  });

  it("clears the session and navigates home on 'Play Again'", async () => {
    finishSession.mockReturnValue(record(50));
    useQuiz.mockReturnValue({ session: baseSession(), clearSession, finishSession });

    renderResults();
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Play Again/)).toBeInTheDocument());
    await user.click(screen.getByText(/Play Again/));

    expect(clearSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("clears the session and navigates to /performance on 'Performance Board'", async () => {
    finishSession.mockReturnValue(record(50));
    useQuiz.mockReturnValue({ session: baseSession(), clearSession, finishSession });

    renderResults();
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Performance Board/)).toBeInTheDocument());
    await user.click(screen.getByText(/Performance Board/));

    expect(clearSession).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/performance");
  });
});
