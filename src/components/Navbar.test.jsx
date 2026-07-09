import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.jsx";

function renderNavbar(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>HOME PAGE</div>} />
        <Route path="/profile" element={<div>PROFILE PAGE</div>} />
        <Route path="/performance" element={<div>PERFORMANCE PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NavBar", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renders the brand and all nav links", () => {
    renderNavBar();

    expect(screen.getByText("DevQuiz")).toBeInTheDocument();
    expect(screen.getByText("Home (Nested)")).toBeInTheDocument();
    expect(screen.getByText("Quiz")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("Performance Board")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("navigates home when the brand is clicked", async () => {
    renderNavBar();
    const user = userEvent.setup();

    await user.click(screen.getByText("DevQuiz"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("the Performance Board link points to a route that actually exists (/performance)", () => {
    renderNavbar();
    fireEvent.click(screen.getByText(/Performance Board/i));
    expect(screen.getByText("PERFORMANCE PAGE")).toBeInTheDocument();
  });

  it("marks the Performance Board link active when on /performance", () => {
    renderNavbar("/performance");
    const link = screen.getByText(/Performance Board/i).closest("a");
    expect(link.className).toContain("active");
  });

  it("marks the Profile link inactive when on a different route", () => {
    renderNavbar("/performance");
    const profileLink = screen.getByText(/My Profile/i).closest("a");
    expect(profileLink.className).not.toContain("active");
  });

  it("clicking the brand navigates back to home", () => {
    renderNavbar("/profile");
    fireEvent.click(screen.getByText("CodeQuiz"));
    expect(screen.getByText("HOME PAGE")).toBeInTheDocument();
  });
});
