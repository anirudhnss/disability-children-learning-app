<div align="center">

# 🌟 Project Tejas AI

**An AI-powered educational companion for children with learning disabilities**

Built with React, Vite, TypeScript, and the Google Gemini API — combining object detection,
handwriting correction, speech practice, and playful games into one friendly, kid-first app.

`React 19` · `TypeScript` · `Vite` · `Gemini API`

</div>

---

## ✨ Features

### 🧒 Login & Onboarding
- **Face login/registration** — kids "log in" with a quick face scan, verified via Gemini
- Standard name/register flow as a fallback

### ✍️ Writing Classroom
- Practice writing letters and characters on a live canvas
- Drawings are analyzed and scored by Gemini in real time (`WRITING_CORRECTION` flow)

### 🔮 AI Super Scanner
| Mode | What it does |
|---|---|
| 📷 **Object Scanner** | Point the camera at anything — Gemini identifies and explains it |
| 🎙️ **Voice Buddy** | Speech-based correction & practice with Gemini + text-to-speech |
| 🎨 **Free Canvas** | Open-ended "magic drawing" mode, no rules attached |

### 🎮 Fun Play Zone
Lightweight games — **Match Buddy** and **Bubble Pop** — for quick engagement breaks between lessons.

### 📊 Lessons & Report Card
Structured lessons across alphabet, words, numbers, colors, emotions, and objects — with
per-student progress tracking (marks, accuracy, time taken, IQ score).

### 🧑‍🏫 Educator Dashboard
A separate educator login for creating lessons, managing exams, and reviewing student reports.

### ✒️ Smart Pen (Hardware)
A companion smart pen that tracks a child's **pulse rate**, **pressure**, and **blood flow**
while writing, and responds in real time through a built-in **vibration motor** — giving
gentle haptic feedback based on the child's physical/emotional state during practice.

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript**, bundled with **Vite**
- **Google Gemini API** (`@google/genai`)
  - `gemini-3-pro-preview` / `gemini-3-flash-preview` — image/vision analysis & face verification
  - `gemini-2.5-flash-preview-tts` — text-to-speech
- Browser **camera** + **microphone** access (declared in `metadata.json`)
- **Smart Pen hardware** — pulse rate, pressure, and blood flow sensors + vibration motor
  for real-time haptic feedback while writing

---

## 🚀 Getting Started

**Prerequisites:** Node.js

```bash
npm install
```

Set your Gemini API key in `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

Run the dev server:

```bash
npm run dev
```

---

## 📁 Project Structure

```
App.tsx                    # Main screen router / state machine (AppScreen enum)
components/
  Camera.tsx                 # Camera capture component
  Icons.tsx                  # Icon set
services/
  geminiService.ts           # Gemini API calls: image analysis, TTS, face verification
types.ts                    # StudentProfile, AppScreen, Lesson types
metadata.json               # App name/description + camera & mic permissions
```

---

## 📝 Notes
- Camera and microphone permissions are required for the scanner, face login, and voice features.
- Designed with accessibility and simplicity in mind — built for young learners and children
  with learning difficulties (ADHD, dyslexia-type writing/speech challenges, and more).

---

<div align="center">
Made with 💜 to make learning a little more fun for every kid.
</div>
