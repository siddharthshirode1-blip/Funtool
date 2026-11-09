# ⚡ FunTools

> **FunTools** is an open-source, zero-tracking, browser-based interactive learning and utility toolkit. It provides real-time encoding tools, educational trainers, and quiz creators—running 100% client-side with zero installations or accounts needed.

---

## 🌟 Featured Tools Suite

### 1. 📡 Morse Code Studio (`Morse_code.html` & `morse_code_learning.html`)
- **Bidirectional Translator**: Instant translation between plain English text and International Morse Code (`.-`).
- **Web Audio Sound Synthesizer**: Realistic dot (80ms) and dash (240ms) tone playback with customizable WPM speeds (8–28 WPM).
- **Optical Signal Lamp**: Real-time visual lamp simulation blinking in sync with Morse transmission.
- **Interactive Trainer & Quiz**: Drill your recognition with flashcards, customizable letter ranges (A–Z), streak counters, and audio cues.

### 2. 💻 Binary Code Converter (`Binary.html`)
- **Standard UTF-8 / ASCII Byte Encoding**: Full bidirectional conversion supporting uppercase, lowercase, punctuation, numbers, and Unicode symbols.
- **Bit Formatting & Live Mode**: Toggle 8-bit byte grouping with space separation.
- **Developer Utilities**: Real-time byte count, character count, instant swap, copy to clipboard, and sample presets.

### 3. ⌨️ Touch Typing Trainer (`touchtyping.html`)
- **Live Virtual Keyboard**: Interactive on-screen QWERTY keyboard actively highlighting target keys and showing recommended finger placement in real-time.
- **Accurate Telemetry**: Real-time Words Per Minute (WPM), Accuracy percentage, Time elapsed, and Raw Typo logging.
- **Mechanical Click Sound**: Web Audio feedback simulating crisp mechanical keystrokes (toggleable on/off).
- **Personal Best & Badges**: Tracks all-time high scores across word modes (15, 25, 50, and custom ranges) and awards rank badges (Beginner to Godlike).

### 4. 🚀 Quick Quiz & MCQ Maker (`AiTest.html`)
- **Instant Topic Presets**: One-click generation for Web Development, Computer Science & Binary, Science & Space, and Trivia.
- **Custom Quiz Builder**: Add, edit, reorder questions, and configure multi-option choices with instant radio grading.
- **Client-Side Encrypted Sharing**: Encodes the entire quiz into a portable, URL-safe payload link. No database or external servers required.
- **Exam & Preview Modes**: Interactive testing interface with instant grading, score review, and answer key breakdown.

### 5. 📬 Feedback Hub (`feedback.html`)
- Interactive star rating widget and suggestion form connected directly to Formspree for community-driven feature requests.

---

## 🛠️ Architecture & Tech Stack

- **Core**: Vanilla HTML5, CSS3, ES6+ JavaScript.
- **Design System**: Responsive modern dark cyberpunk theme with glassmorphism, CSS custom properties (`:root`), and mobile-first layouts.
- **Audio**: Web Audio API (sine, triangle, and square oscillators with gain ramps) for zero-latency synthesized audio without external media assets.
- **Libraries**: Lightweight jQuery (included locally as `jquery-3_6_0.js`).
- **Privacy**: Zero trackers, zero cookies, 100% client-side execution.

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser:

```bash
# Clone or open the folder
cd Funtool-main/Funtool-main

# Open index.html directly
start index.html     # Windows
open index.html      # macOS
xdg-open index.html  # Linux
```

Or serve with any static web server:
```bash
npx serve .
# or
python -m http.server 8000
```

---

## 📄 License & Credits

Distributed under the MIT License. Free for educational and personal use.
