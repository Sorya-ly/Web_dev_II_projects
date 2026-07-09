import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderNavBar(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavBar />
    </MemoryRouter>
  );
}

describe("NavBar", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders the brand and all nav links", () => {
    renderNavBar();

    expect(screen.getByText("CodeQuiz")).toBeInTheDocument();
    expect(screen.getByText("Home (Nested)")).toBeInTheDocument();
    expect(screen.getByText("Quiz")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("Performance Board")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("navigates home when the brand is clicked", async () => {
    renderNavBar();
    const user = userEvent.setup();

    await user.click(screen.getByText("CodeQuiz"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders 'Home (Nested)' as a plain Link to '/'", () => {
    renderNavBar();

    expect(screen.getByText("Home (Nested)").closest("a")).toHaveAttribute("href", "/");
  });

  // NOTE: this currently fails. Results.jsx navigates to "/results" (plural),
  // but this NavLink points to "/result" (singular) — they don't match.
  it("points the Result link at the app's actual results route (/results)", () => {
    renderNavBar();

    expect(screen.getByText("Result").closest("a")).toHaveAttribute("href", "/results");
  });

  // NOTE: this currently fails. Results.jsx and PerformanceBoard.jsx both use
  // "/performance", but this NavLink points to "/performanceboard".
  it("points the Performance Board link at the app's actual route (/performance)", () => {
    renderNavBar();

    expect(screen.getByText("Performance Board").closest("a")).toHaveAttribute("href", "/performance");
  });

  it("points the Profile link at /profile", () => {
    renderNavBar();

    expect(screen.getByText("Profile").closest("a")).toHaveAttribute("href", "/profile");
  });

  it("marks the Profile NavLink active when the current route is /profile", () => {
    renderNavBar("/profile");

    expect(screen.getByText("Profile").closest("a")).toHaveClass("active");
    expect(screen.getByText("Quiz").closest("a")).not.toHaveClass("active");
  });

  it("does not mark any NavLink active on an unrelated route", () => {
    renderNavBar("/some-other-page");

    expect(screen.getByText("Quiz").closest("a")).not.toHaveClass("active");
    expect(screen.getByText("Result").closest("a")).not.toHaveClass("active");
    expect(screen.getByText("Performance Board").closest("a")).not.toHaveClass("active");
    expect(screen.getByText("Profile").closest("a")).not.toHaveClass("active");
  });

  it("never applies an 'active' class to the plain Link, even on its own route", () => {
    renderNavBar("/");

    // Link (unlike NavLink) has no active-state logic in this component at all.
    expect(screen.getByText("Home (Nested)").closest("a")).not.toHaveClass("active");
  });
});
