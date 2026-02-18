# 🏯 N4KanjiMaster

**AI-Powered Japanese Learning Companion for JLPT N4**

![Version](https://img.shields.io/badge/Version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![AI](https://img.shields.io/badge/Powered%20by-Google%20Gemini-8E75B2) ![License](https://img.shields.io/badge/License-MIT-green)

A modern, interactive React application designed to help students master JLPT N4 Kanji through Audio, Quizzes, and AI-driven explanations.

---

## ✨ Key Features

### 🤖 AI Sensei (Powered by Google Gemini)

- **Kanji Tutor**: Get real-time, context-aware explanations for any Kanji.
- **Mnemonic Generator**: The AI generates unique visual stories to help you remember complex characters.
- **Grammar Breakdown**: Detailed analysis of example sentences to understand the _why_ behind the usage.

### 🔊 Native Audio Engine

- **Text-to-Speech**: High-quality Japanese pronunciation for every word and sentence using Google's Neural Audio models.
- **Contextual Listening**: Hear the Kanji used in real sentences, not just in isolation.

### 🎮 Gamified Learning

- **Adaptive Quizzes**: Test your knowledge with randomized quizzes that shuffle options every time.
- **XP System**: Earn experience points for correct answers to stay motivated.
- **Certificate Mode**: Generate a printable "Certificate of Mastery" upon scoring 80%+ on any level.

### 📚 Comprehensive Dictionary

- **Searchable Database**: Instantly find Kanji by English meaning, Reading, or Character.
- **JLPT Filters**: Toggle between N4 and N5 levels to focus your study.
- **Dark Mode**: Fully optimized dark theme for late-night study sessions.

---

## 🛠️ Technology Stack

| Component      | Technology        | Description                                             |
| :------------- | :---------------- | :------------------------------------------------------ |
| **Frontend**   | React 18          | Component-based architecture for smooth UI.             |
| **Build Tool** | Vite              | Lightning-fast development & HMR.                       |
| **Styling**    | Tailwind CSS      | Utility-first styling for responsiveness and Dark Mode. |
| **AI LLM**     | Google Gemini Pro | Generates explanations and tutoring content.            |
| **Icons**      | Lucide React      | Clean, consistent SVG iconography.                      |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- A valid **Google Gemini API Key** (Free tier available).

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/rah-gif/n4-kanji-app.git
    cd n4-kanji-app
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Run the App**

    ```bash
    npm run dev
    ```

4.  **Enter API Key**:
    When you first launch the app, click the **Settings (⚙️)** icon in the top right and paste your Google Gemini API Key. The key is stored securely in your browser's LocalStorage and is never sent to our servers.

---

## 📂 Project Structure

```
src/
├── components/
│   ├── DictionaryView  # Search & Filter Interface
│   ├── QuizView        # Interactive Question Logic
│   └── SenseiTutor     # AI Integration Component
├── data/
│   └── kanji_data.js   # Static database of 300+ N4/N5 Kanji
├── hooks/
│   └── useAudio.js     # Custom hook for TTS API
└── App.jsx             # Main Application Logic
```

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for new Kanji or better mnemonics:

1.  Fork the repo.
2.  Create a feature branch.
3.  Submit a Pull Request.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Developed with ❤️ by **Chethana Rahul**
