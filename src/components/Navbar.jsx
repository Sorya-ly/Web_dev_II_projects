import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/")}>
        <span className="brand-icon-small">{"</>"}</span>
        <span>CodeQuiz</span>
      </div>
      <div className="nav-links">
        <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">👤</span> My Profile
        </NavLink>
        <NavLink to="/performance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <span className="nav-icon">📊</span> Performance Board
        </NavLink>
      </div>
    </nav>
  );
}
