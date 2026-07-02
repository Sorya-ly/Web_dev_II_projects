import { Routes, Route } from "react-router-dom";

import NavBar from "./components/Navbar";

// import Home from "./pages/Home.jsx";
// import PerformanceBoard from "./pages/PerformanceBoard.jsx";
// import Profile from "./pages/Profile.jsx";
// import Quiz from "./pages/Quiz.jsx";
// import Result from "./pages/Results.jsx";

export default function App() {
    return (
        <div className="app">
            <NavBar /> 

            <main className="content"> 
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/performance" element={<PerformanceBoard />} />

                    <Route path="/quiz" element={<Quiz />} />

                    <Route path="/result" element={<Result />} />
                </Routes>
            </main>

        </div>
    )
}
