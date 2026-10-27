# 🌟 Joeson Clerve - Software Engineer Portfolio

A personal software engineer portfolio built with the exact fonts, theme, and top navigation from [nonzerosum.games](https://nonzerosum.games/).

## ✨ Features matching nonzerosum.games

1. **Exact Typography**:
   - `MoreSugar-Regular.otf` (bold titles and headings)
   - `MoreSugar-Thin.otf` (normal body text and subtitles)
   - `MoreSugar-Extras.otf` (hand-drawn custom icon glyphs and doodles)
2. **Exact Color Theme & Aesthetics**:
   - Sky Blue primary background (`#55AAE3`) with semi-transparent frosted pills (`rgba(0, 0, 0, 0.15)`)
   - Deep Midnight Indigo Dark Mode (`#2a243d`) with warm peachy sand accents (`#d59b7b`)
   - Rounded pill aesthetic (`border-radius: 30px - 50px`)
   - Tilted links on hover (`font-style: oblique`)
3. **Exact Top Navigation**:
   - Floating pill `.menuColumn`
   - MoreSugar glyph icons (`0` Home, `8` Projects, `*` Skills, `#` Arcade, `.` About, `'` Contact)
   - Smooth hover lift + skew transformation (`transform: translateY(-7px) skewX(-9deg)`) with slide-in label words
   - Idle breathing / peek animation where random icons gently introduce themselves
   - Smooth vertical toggle slider pill for Dark Mode with `localStorage` memory
4. **Interactive Game Theory Arcade**:
   - Fully playable **Iterated Prisoner's Dilemma** simulator
   - Interactive Payoff Matrix (`#payoffTable`) with live cell highlighting
   - Playable strategies: Tit-for-Tat, Grim Trigger, Always Cooperate, Always Defect, Random
   - Real-time tournament scoreboard and round log
5. **Interactive Hero Canvas & Project Showcase**:
   - Dynamic connected cooperative node simulation
   - Responsive cards with scroll-scale effect (`.image-grid` and `.image-item`)
   - Modal deep-dives for DentAI, AI Engineer Essentials, C# .NET Tetris/Banx, LeetCode 365, and Python Math Engine
6. **Multi-Page & Single-Page Support**:
   - `index.html` (Full landing with all sections and anchors)
   - `projects.html` (Dedicated projects deep dive)
   - `arcade.html` (Dedicated game theory lab)
   - `aboutme.html` (Dedicated personal engineering journey)

## 🚀 Quick Start

### Option 1: Open Directly in Any Browser
Double-click `index.html` or open it with your browser:
```bash
xdg-open index.html
```

### Option 2: Run with Python Built-in Server
```bash
cd /home/joeson/art/Protfolio2
python3 -m http.server 3000
```
Then visit `http://localhost:3000`.

### Option 3: Run with Vite Dev Server
```bash
npm install
npm run dev
```
