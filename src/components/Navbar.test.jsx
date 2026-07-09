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

describe("Navbar", () => {
  it("renders the brand and both nav links", () => {
    renderNavbar();
    expect(screen.getByText("DevQuiz")).toBeInTheDocument();
    expect(screen.getByText(/My Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Performance Board/i)).toBeInTheDocument();
  });

  it("the Profile link points to a route that actually exists (/profile)", () => {
    renderNavbar();
    fireEvent.click(screen.getByText(/My Profile/i));
    expect(screen.getByText("PROFILE PAGE")).toBeInTheDocument();
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
    fireEvent.click(screen.getByText("DevQuiz"));
    expect(screen.getByText("HOME PAGE")).toBeInTheDocument();
  });
});
