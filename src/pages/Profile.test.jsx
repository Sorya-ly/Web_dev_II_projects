import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Profile from "./Profile";
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
  },
  DIFFICULTY_CONFIG: {
    easy: { label: "Easy", color: "#16a34a", bg: "#dcfce7" },
    hard: { label: "Hard", color: "#dc2626", bg: "#fee2e2" },
  },
}));

function renderProfile() {
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}

function baseUser(overrides = {}) {
  return {
    name: "Ada",
    bestScore: 100,
    streak: 2,
    history: [
      { id: 1, language: "python", difficulty: "easy", score: 50, correct: 8, total: 10, date: "2026-07-01" },
      { id: 2, language: "javascript", difficulty: "hard", score: 30, correct: 3, total: 10, date: "2026-07-02" },
    ],
    ...overrides,
  };
}

describe("Profile", () => {
  let updateUser, resetAllData;

  beforeEach(() => {
    mockNavigate.mockReset();
    updateUser = vi.fn();
    resetAllData = vi.fn();
  });

  it("shows an empty-state tagline when there is no history", () => {
    useQuiz.mockReturnValue({ user: baseUser({ history: [] }), updateUser, resetAllData });

    renderProfile();

    expect(screen.getByText(/No games yet/i)).toBeInTheDocument();
  });

  it("computes and displays total points as the sum of history scores", () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();

    // 50 + 30 = 80
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("computes per-difficulty accuracy correctly", () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();

    // easy: 8/10 = 80%, hard: 3/10 = 30%
    expect(screen.getByText("80% accuracy")).toBeInTheDocument();
    expect(screen.getByText("30% accuracy")).toBeInTheDocument();
  });

  it("lists each distinct language played with its session count", () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();

    expect(screen.getByText(/Python/)).toBeInTheDocument();
    expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
  });

  it("enters edit mode and saves a trimmed name", async () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();
    const user = userEvent.setup();

    await user.click(screen.getByText(/Edit/));
    const input = screen.getByDisplayValue("Ada");
    await user.clear(input);
    await user.type(input, "  Grace  ");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(updateUser).toHaveBeenCalledWith({ name: "Grace" });
  });

  it("does not save an empty name", async () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();
    const user = userEvent.setup();

    await user.click(screen.getByText(/Edit/));
    const input = screen.getByDisplayValue("Ada");
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("cancels editing without saving", async () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();
    const user = userEvent.setup();

    await user.click(screen.getByText(/Edit/));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(updateUser).not.toHaveBeenCalled();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("requires a confirmation click before resetting all data", async () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /reset all data/i }));
    expect(resetAllData).not.toHaveBeenCalled();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /yes, reset everything/i }));
    expect(resetAllData).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("cancels the reset confirmation without resetting", async () => {
    useQuiz.mockReturnValue({ user: baseUser(), updateUser, resetAllData });

    renderProfile();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /reset all data/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(resetAllData).not.toHaveBeenCalled();
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });
});
