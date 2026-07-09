import { javascript } from "./javascript";
import { python } from "./python";
import { java } from "./java";
import { htmlcss } from "./htmlcss";

export const LANGUAGES = {
  javascript: { id: "javascript", label: "JavaScript", data: javascript },
  python: { id: "python", label: "Python", data: python },
  java: { id: "java", label: "Java", data: java },
  htmlcss: { id: "htmlcss", label: "HTML & CSS", data: htmlcss },
};

export const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", points: 10, color: "#16a34a", bg: "#dcfce7" },
  medium: { label: "Medium", points: 20, color: "#d97706", bg: "#fef3c7" },
  hard: { label: "Hard", points: 30, color: "#dc2626", bg: "#fee2e2" },
};

export const TIME_PER_QUESTION = 20; // seconds, per requirements
export const QUESTIONS_PER_QUIZ = 10; // random 10 from pool of 100/30

export function getRandomQuestions(languageId, difficulty, count = QUESTIONS_PER_QUIZ) {
  const pool = LANGUAGES[languageId]?.data?.[difficulty] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
