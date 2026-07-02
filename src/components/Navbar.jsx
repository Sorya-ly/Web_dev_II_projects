import { NavLink, Link } from "react-router-dom";

export default function NavBar () {
    return (
        <nav className="navbar">
            {/* Plain link: no "active" awareness */}
            <Link to="/">Home (Nested)</Link>

            {/* NavLink: Style/className changes automatically when active */}
            <NavLink to="/quiz">
                Quiz
            </NavLink>

            <NavLink to="/result">
                Result
            </NavLink>

            <NavLink to="/performanceboard">
                Performance Board
            </NavLink>

            <NavLink to="/profile">
                Profile
            </NavLink>
        </nav>
    )
}