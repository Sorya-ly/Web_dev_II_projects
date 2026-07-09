import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Home from "./Home";
import { useQuiz } from "../context/QuizContext";

// Mock the whole module, replacing useQuiz with a Vitest mock function
vi.mock("../context/QuizContext", () => ({
  useQuiz: vi.fn(),
}));

// Mock react-router-dom's useNavigate while keeping everything else real
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the name gate without crashing when the user has no name yet", () => {
    useQuiz.mockReturnValue({
      user: { name: "", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser: vi.fn(),
      startSession: vi.fn(),
    });

    renderHome();

    expect(screen.getByText(/welcome to codequiz/i)).toBeInTheDocument();
  });

  it("lets the user submit their name and calls updateUser", async () => {
    const updateUser = vi.fn();
    useQuiz.mockReturnValue({
      user: { name: "", bestScore: 0, streak: 0, totalQuestions: 0, history: [] },
      updateUser,
      startSession: vi.fn(),
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
      startSession: vi.fn(),
    });

    renderHome();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/your name/i), "   ");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(updateUser).not.toHaveBeenCalled();
  });

  it("renders the dashboard once a name is already set, showing stats", () => {
    useQuiz.mockReturnValue({
      user: { name: "Ada", bestScore: 120, streak: 3, totalQuestions: 40, history: [] },
      updateUser: vi.fn(),
      startSession: vi.fn(),
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
      startSession: vi.fn(),
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
      startSession: vi.fn(),
    });

    renderHome();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /start the quiz/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/quiz/python/easy");
  });
});