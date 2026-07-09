import { NavLink, Link, useNavigate } from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="nav-brand" onClick={() => navigate("/")}>
                <span className="brand-icon-small">{"</>"}</span>
                <span>DevQuiz</span>
            </div>

            <div className="nav-links">
                <Link to="/">Home (Nested)</Link>

                <NavLink to="/quiz" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <span className="nav-icon"> </span>Quiz
                </NavLink>

                <NavLink to="/results" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <span className="nav-icon"> </span>Result
                </NavLink>

                <NavLink to="/performance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <span className="nav-icon"> </span>Performance Board
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    <span className="nav-icon"> </span>Profile
                </NavLink>
            </div>
        </nav>
    );
}
