# DevQuiz — Programming Trivia App

A React quiz application testing knowledge across JavaScript, Python, Java, and HTML/CSS, with streak tracking, a performance leaderboard, and full localStorage persistence.

## Live Demo

> Deploy to Vercel and paste your URL here.

## Features

- **5 pages/views**: Home, Quiz, Results, Performance Board, Profile
- **4 programming languages**: JavaScript (100 Q per difficulty), Python, Java, HTML & CSS (30 Q per difficulty each)
- **3 difficulty levels**: Easy (10 pts), Medium (20 pts), Hard (30 pts) per correct answer
- **Random 10-question quizzes** pulled from each difficulty's question pool every time
- **20-second countdown per question** with animated SVG timer ring
- **Daily streak system**:
  - Playing the day after your last play → streak +1
  - Playing again same day → streak unchanged
  - Missing days → streak resets to 0, restarts at 1 on next play
- **Performance Board**: total score per language, ranked highest to lowest
- **Profile dashboard**: name, best score/total points, performance by difficulty
- **Full localStorage persistence** — name, scores, streak, and history all survive refresh

## Tech Stack

- React 18 + Vite
- React Router v6 (with dynamic `/quiz/:language/:difficulty` route)
- React Context API for global state
- localStorage for persistence
- Pure CSS, light theme

## Getting Started

```bash
npm install
npm run dev
```
## Testing 
```bash
npm test 
npm test FILE_NAME #Example: npm test useTimer
```


## Project Structure

```
src/
├── context/
│   └── QuizContext.jsx     # Global state: user, session, streak, performance board
├── data/
│   ├── javascript.js       # 300 JS questions (100/100/100)
│   ├── python.js           # 90 Python questions (30/30/30)
│   ├── java.js             # 90 Java questions (30/30/30)
│   ├── htmlcss.js          # 90 HTML/CSS questions (30/30/30)
│   └── index.js            # LANGUAGES config, DIFFICULTY_CONFIG, getRandomQuestions()
├── utils/
│   ├── streak.js           # Streak calculation logic (pure function, easily testable)
│   └── streak.test.js
├── hooks/
│   ├── useTimer.js         # 20s countdown hook
│   └── useTimer.test.js
├── pages/
│   ├── Home.jsx             # Welcome, stats, language/level picker, start quiz
│   ├── Home.test.jsx            
│   ├── Quiz.jsx              # Live gameplay with timer & feedback
│   ├── Quiz.test.jsx             
│   ├── Results.jsx           # Score, grade, correct/incorrect breakdown
│   ├── Results.test.jsx            
│   ├── PerformanceBoard.jsx  # Language ranking + recent sessions
│   ├── PerfromaneBoard.test.jsx            
│   └── Profile.jsx           # Dashboard: name, scores, difficulty stats
│   └── Profile.test.js          
├── components/
│   └── Navbar.jsx
│   └── Navbar.test.jsx            
├── App.jsx
└── App.css
```

## Streak Logic (Implementation Detail)

`src/utils/streak.js` exports `computeStreak(lastPlayDate, currentStreak)`:

1. No `lastPlayDate` → first ever play, streak = 1
2. Same calendar day as last play → streak unchanged
3. Exactly 1 day after last play → streak + 1
4. 2+ days gap (missed a day or more) → streak resets, restarts at 1

This runs inside `finishSession()` in the context every time a quiz completes.

## Deployment

**Netlify**: `npm run build`, drag `dist/` to netlify.com/drop, add `public/_redirects` with `/* /index.html 200`.

**Vercel**: push to GitHub, import on vercel.com, build command `npm run build`, output `dist`.
# Web_dev_II_projects
├── Profile.test.jsx  