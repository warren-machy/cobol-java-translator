# ⚙️ COBOL Modernization Platform

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> An AI-powered toolchain that helps modernize COBOL mainframe applications by converting legacy code to Java, analyzing complexity, generating JUnit tests, and supporting batch processing workflows.

---

## ✨ Key Features

### 🚀 Core Translation
- ✨ **GPT-4 COBOL-to-Java translation**
- 📄 **User story-aware translation context**
- 🧠 **AI-assisted variable mapping and optimization hints**
- ⬇️ Export translated Java code

### 📊 Code Intelligence
- 📈 Metrics dashboard: line counts, structural complexity
- 📦 Batch processing with real-time status updates
- 🔍 Visual stats & suggestions using Recharts

### 🧪 Test Generation
- 🧬 Automated JUnit 5 test cases (normal, edge, error)
- 📝 Built-in documentation for test scenarios

---

## 🖥️ UI Highlights

- 💻 Side-by-side **COBOL ↔ Java** editors (Monaco-based)
- 🌙 Cyberpunk-themed dark mode
- 📱 Fully responsive design
- 🟢 Status indicators: pending, running, completed, failed

![Screenshot](./screenshots/main-interface.png)

---

## 📁 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + custom dark theme
- **Code Editor**: Monaco Editor
- **AI**: OpenAI GPT-4 (via API)
- **Data Viz**: Recharts
- **Infra**: Docker-ready, Vercel/Netlify deployable

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yourusername/cobol-modernization-platform.git
cd cobol-modernization-platform

# 2. Install
npm install

# 3. Add your OpenAI key
echo "VITE_OPENAI_API_KEY=your_key_here" > .env

# 4. Run
npm run dev

