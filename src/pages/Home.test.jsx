import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import { useQuiz } from "../context/QuizContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../context/QuizContext", () => ({
  useQuiz: vi.fn(),
}));

vi.mock("../../data", () => ({
  LANGUAGES: {
    python: { id: "python", icon: "🐍", label: "Python" },
    javascript: { id: "javascript", icon: "📜", label: "JavaScript" },
  },
  DIFFICULTY_CONFIG: {
    easy: { label: "Easy", color: "#16a34a", bg: "#dcfce7" },
    medium: { label: "Medium", color: "#d97706", bg: "#fef3c7" },
    hard: { label: "Hard", color: "#dc2626", bg: "#fee2e2" },
  },
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe("Home", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders the name gate without crashing when the user has no name yet", () => {
    // NOTE: this currently fails — Home.jsx references `user` and `updateUser`
    // without destructuring them from useQuiz(), so the component throws.
    useQuiz.mockReturnValue({
      user: { name: "", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser: vi.fn(),
    });

    renderHome();

    expect(screen.getByText(/Welcome to CodeQuiz/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
  });

  it("lets the user submit their name and calls updateUser", async () => {
    const updateUser = vi.fn();
    useQuiz.mockReturnValue({
      user: { name: "", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser,
    });

    renderHome();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/your name/i), "Ada");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(updateUser).toHaveBeenCalledWith({ name: "Ada" });
  });

  it("does not submit an empty/whitespace-only name", async () => {
    const updateUser = vi.fn();
    useQuiz.mockReturnValue({
      user: { name: "", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser,
    });

    renderHome();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/your name/i), "   ");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("renders the dashboard once a name is already set, showing stats", () => {
    // NOTE: this currently fails — `Object.value(LANGUAGES)` should be
    // `Object.values(LANGUAGES)`; the typo throws a TypeError.
    useQuiz.mockReturnValue({
      user: { name: "Ada", bestScore: 120, streak: 3, totalQuestions: 40, history: [] },
      updateUser: vi.fn(),
    });

    renderHome();

    expect(screen.getByText(/Ada/)).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument(); // bestScore
    expect(screen.getByText("3")).toBeInTheDocument(); // streak
    expect(screen.getByText("40")).toBeInTheDocument(); // totalQuestions
  });

  it("lets the user pick a language and difficulty, then navigates to /quiz/:lang/:difficulty", async () => {
    useQuiz.mockReturnValue({
      user: { name: "Ada", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser: vi.fn(),
    });

    renderHome();
    const user = userEvent.setup();

    await user.selectOptions(screen.getByRole("combobox"), "javascript");
    await user.click(screen.getByRole("button", { name: /medium/i }));
    await user.click(screen.getByRole("button", { name: /start the quiz/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/quiz/javascript/medium");
  });

  it("defaults to python + easy when starting without changing selectors", async () => {
    useQuiz.mockReturnValue({
      user: { name: "Ada", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser: vi.fn(),
    });

    renderHome();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /start the quiz/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/quiz/python/easy");
  });
});
