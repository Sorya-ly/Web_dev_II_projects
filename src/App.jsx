import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuizProvider } from "./context/QuizContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import PerformanceBoard from "./pages/PerformanceBoard";
import Profile from "./pages/Profile";
import "./App.css";

export default function App() {
    return (
        <div className="app">
            <NavBar /> 

            <main className="content"> 
                <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/performance" element={<PerformanceBoard />} />

                    <Route path="/quiz" element={<Quiz />} />

                    <Route path="/result" element={<Results />} />

                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </main>

        </div>
    )
}
