import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

// --- Mock QuizProvider so App doesn't need a real context implementation ---
vi.mock("./context/QuizContext", () => ({
  QuizProvider: ({ children }) => <div data-testid="quiz-provider">{children}</div>,
}));

// --- Mock Navbar and every page so this file tests App/routing in isolation,
//     not the internals of each page (those get their own test files). ---
vi.mock("./components/Navbar", () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock("./pages/Home", () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}));
vi.mock("./pages/Quiz", () => ({
  default: () => <div data-testid="quiz-page">Quiz Page</div>,
}));
vi.mock("./pages/Results", () => ({
  default: () => <div data-testid="results-page">Results Page</div>,
}));
vi.mock("./pages/PerformanceBoard", () => ({
  default: () => <div data-testid="performance-page">Performance Page</div>,
}));
vi.mock("./pages/Profile", () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>,
}));

// App.jsx hardcodes its own <BrowserRouter>, so to control the route under
// test we set the real browser history before rendering, then restore it.
function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("App", () => {
  afterEach(() => {
    // Reset back to a known location so tests don't leak state into each other
    window.history.pushState({}, "", "/");
  });

  it("renders without crashing and includes the QuizProvider and Navbar", () => {
    renderAt("/");

    expect(screen.getByTestId("quiz-provider")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("renders Home on the root path (/)", () => {
    renderAt("/");

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("renders PerformanceBoard on /performance", () => {
    renderAt("/performance");

    expect(screen.getByTestId("performance-page")).toBeInTheDocument();
  });

  it("renders Quiz on /quiz", () => {
    renderAt("/quiz/:language/:difficulty");

    expect(screen.getByTestId("quiz-page")).toBeInTheDocument();
  });

  it("renders Results on /results", () => {
    renderAt("/results");

    expect(screen.getByTestId("results-page")).toBeInTheDocument();
  });

  it("renders Profile on /profile", () => {
    renderAt("/profile");

    expect(screen.getByTestId("profile-page")).toBeInTheDocument();
  });

  it("renders nothing matching for an unknown route (no route defined for it)", () => {
    renderAt("/this-route-does-not-exist");

    expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quiz-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("results-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("performance-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-page")).not.toBeInTheDocument();
  });

  it("keeps Navbar mounted regardless of the current route", () => {
    renderAt("/profile");

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("profile-page")).toBeInTheDocument();
  });

  it("wraps page content inside the app shell layout (app / content classes)", () => {
    const { container } = renderAt("/");

    expect(container.querySelector(".app")).toBeInTheDocument();
    expect(container.querySelector(".content")).toBeInTheDocument();
  });
});
