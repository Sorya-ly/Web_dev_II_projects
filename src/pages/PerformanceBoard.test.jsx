import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PerformanceBoard from "./PerformanceBoard";
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
    javascript: { id: "javascript", label: "JavaScript" },
    rust: { id: "rust", label: "Rust" },
  },
}));

function renderBoard() {
  return render(
    <MemoryRouter>
      <PerformanceBoard />
    </MemoryRouter>
  );
}

describe("PerformanceBoard", () => {
  let getPerformanceBoard;

  beforeEach(() => {
    mockNavigate.mockReset();
    getPerformanceBoard = vi.fn();
  });

  it("shows an empty state with a CTA when there is no board data", async () => {
    getPerformanceBoard.mockReturnValue([]);
    useQuiz.mockReturnValue({ user: { history: [] }, getPerformanceBoard });

    renderBoard();
    const user = userEvent.setup();

    expect(screen.getByText(/No games played yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /play now/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders ranked entries with medals for the top 3", () => {
    getPerformanceBoard.mockReturnValue([
      { language: "python", score: 300 },
      { language: "javascript", score: 200 },
      { language: "rust", score: 100 },
    ]);
    useQuiz.mockReturnValue({ user: { history: [] }, getPerformanceBoard });

    renderBoard();

    expect(screen.getByText("🥇")).toBeInTheDocument();
    expect(screen.getByText("🥈")).toBeInTheDocument();
    expect(screen.getByText("🥉")).toBeInTheDocument();
    expect(screen.getByText("300 pts")).toBeInTheDocument();
  });

  it("falls back to a numeric rank past the top 3", () => {
    getPerformanceBoard.mockReturnValue([
      { language: "python", score: 400 },
      { language: "javascript", score: 300 },
      { language: "rust", score: 200 },
    ]);
    useQuiz.mockReturnValue({
      user: { history: [] },
      getPerformanceBoard: () => [
        ...getPerformanceBoard(),
        { language: "python", score: 100 }, // 4th ranked entry (duplicate id ok for this test)
      ],
    });

    renderBoard();

    expect(screen.getByText("#4")).toBeInTheDocument();
  });

  it("lists up to 10 recent sessions from history", () => {
    getPerformanceBoard.mockReturnValue([{ language: "python", score: 100 }]);
    const history = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      language: "python",
      difficulty: "easy",
      score: 10,
      correct: 8,
      total: 10,
      date: "2026-07-01",
    }));
    useQuiz.mockReturnValue({ user: { history }, getPerformanceBoard });

    renderBoard();

    const rows = screen.getAllByText(/10 pts \(8\/10\)/);
    expect(rows).toHaveLength(10);
  });

  it("navigates home when 'Play Again' is clicked", async () => {
    getPerformanceBoard.mockReturnValue([{ language: "python", score: 100 }]);
    useQuiz.mockReturnValue({ user: { history: [] }, getPerformanceBoard });

    renderBoard();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /play again/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
