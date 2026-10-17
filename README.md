# ♞ Chess Master App

A modern, responsive, feature-packed Chess Web Application built with **React**, **TypeScript**, **Tailwind CSS**, and an **Alpha-Beta Minimax AI Engine**.

---

## 🚀 Quick Start

The app is already running! You can open it in your browser:

- **Local:** [http://localhost:5173/](http://localhost:5173/)
- **Network:** [http://192.168.1.11:5173/](http://192.168.1.11:5173/)

To run the dev server manually in the future:
```bash
cd /Users/uday/.gemini/antigravity/scratch/chess-app
npm run dev
```

---

## ✨ Features

- 🤖 **Play vs Computer (AI Engine)**:
  - **Beginner (~800 Elo)**: Casual moves, blunders often, great for beginners.
  - **Intermediate (~1350 Elo)**: Tactical awareness, solid fundamentals.
  - **Advanced (~1750 Elo)**: Alpha-beta pruning with piece-square position tables and center control.
  - **Master (~2150 Elo)**: Deeper search with quiescence search to resolve sharp capture tactics.
  - Non-blocking asynchronous calculation with an animated "Thinking..." indicator.
- 👥 **Pass & Play (Local 2-Player)**: Play against a friend on the same device.
- 🎨 **Multiple Board Themes**:
  - Classic Green (Chess.com style)
  - Walnut Wood (warm tournament aesthetic)
  - Ice Ocean (cool blue aesthetic)
  - Midnight Slate (sleek dark mode)
- 🎯 **Tactile Interaction**:
  - Click-to-move AND Drag-and-Drop piece controls.
  - Legal move indicators (dots for open squares, targeting rings for captures).
  - Glowing check highlights when the King is in danger.
  - Last-move square indicators.
- 🔊 **Built-in Sound Synthesizer**:
  - Crisp Web Audio API synthesized sound effects for moves, captures, checks, castling, and game results without requiring external audio assets.
- 📊 **Real-time Evaluation Bar & Notation**:
  - Live advantage gauge showing who is ahead in centipawns.
  - Captured pieces tally with material difference score (+1, +3, etc.).
  - Standard algebraic notation (SAN) move log with step-through playback (First, Prev, Next, Current).
- 🏆 **Game State & Rules Handling**:
  - Pawn promotion modal (Queen, Rook, Bishop, Knight).
  - Checkmate, Stalemate, Threefold repetition, and Insufficient material detection.
  - Resign button, Board Flip, Undo & Redo.
  - Confetti celebration upon victory!
