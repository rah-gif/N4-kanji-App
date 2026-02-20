import React, { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "./components/Navbar";
import ApiKeyModal from "./components/ApiKeyModal";
import MenuView from "./views/MenuView";
import DictionaryView from "./views/DictionaryView";
import QuizView from "./views/QuizView";
import ResultView from "./views/ResultView";
import { kanjiDatabase, categories } from "./data/kanjiData";
import { pcmToWav } from "./utils/audioUtils";

export default function N4KanjiApp() {
  const [theme, setTheme] = useState("light");
  const [view, setView] = useState("menu");
  const [activeCategory, setActiveCategory] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(1250);
  const [quizState, setQuizState] = useState("question");
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState("ALL");
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // API Key State
  const [userApiKey, setUserApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load API Key from storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) setUserApiKey(storedKey);
  }, []);

  const saveApiKey = (key) => {
    setUserApiKey(key);
    localStorage.setItem("gemini_api_key", key);
    setIsSettingsOpen(false);
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const playAudio = async (text) => {
    if (!userApiKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${userApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say in Japanese: " + text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
              },
            },
          }),
        },
      );
      const data = await response.json();
      const audioData =
        data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const audioBlob = pcmToWav(audioData);
        if (audioBlob) {
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setIsPlaying(false);
          audio.play();
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  // Start Randomized Quiz
  const startQuiz = (catId) => {
    const pool = kanjiDatabase.filter(
      (k) => catId === "all" || k.tags.includes(catId),
    );

    if (pool.length === 0) {
      alert("No questions available for this category yet!");
      return;
    }

    const selectedQuestions = [...pool]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    const randomizedQuizItems = selectedQuestions.map((item) => {
      const optionsWithStatus = item.options.map((opt, i) => ({
        text: opt,
        isCorrect: i === item.correctIndex,
      }));

      const shuffledOptions = optionsWithStatus.sort(() => Math.random() - 0.5);
      const newCorrectIndex = shuffledOptions.findIndex((opt) => opt.isCorrect);

      return {
        ...item,
        options: shuffledOptions.map((opt) => opt.text),
        correctIndex: newCorrectIndex,
      };
    });

    setQuizItems(randomizedQuizItems);
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizState("question");
    setSelectedOption(null);
    setActiveCategory(
      categories.find((c) => c.id === catId) || { title: "Mixed Review" },
    );
    setView("quiz");
  };

  const handleAnswer = (index) => {
    if (quizState === "feedback") return;
    setSelectedOption(index);
    setQuizState("feedback");
    if (
      quizItems[currentQuizIndex] &&
      index === quizItems[currentQuizIndex].correctIndex
    ) {
      setScore((s) => s + 1);
      setXp((x) => x + 10);
    }
  };

  const nextQuestion = () => {
    if (currentQuizIndex < quizItems.length - 1) {
      setCurrentQuizIndex((c) => c + 1);
      setQuizState("question");
      setSelectedOption(null);
    } else {
      setView("result");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredKanji = useMemo(() => {
    return kanjiDatabase.filter((k) => {
      const matchesSearch =
        k.word.includes(searchQuery) ||
        k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kanji.includes(searchQuery);
      const matchesLevel = filterLevel === "ALL" || k.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, filterLevel]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${theme === "dark" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <Navbar
        view={view}
        setView={setView}
        theme={theme}
        toggleTheme={toggleTheme}
        xp={xp}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={saveApiKey}
      />

      {view === "menu" && (
        <MenuView
          theme={theme}
          xp={xp}
          categories={categories}
          startQuiz={startQuiz}
          setView={setView}
        />
      )}

      {view === "dictionary" && (
        <DictionaryView
          theme={theme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          handlePrint={handlePrint}
          filteredKanji={filteredKanji}
          playAudio={playAudio}
        />
      )}

      {view === "quiz" && (
        <QuizView
          theme={theme}
          quizItems={quizItems}
          currentQuizIndex={currentQuizIndex}
          quizState={quizState}
          selectedOption={selectedOption}
          handleAnswer={handleAnswer}
          nextQuestion={nextQuestion}
          setView={setView}
          playAudio={playAudio}
          isPlaying={isPlaying}
          userApiKey={userApiKey}
        />
      )}

      {view === "result" && (
        <ResultView
          theme={theme}
          score={score}
          quizItems={quizItems}
          activeCategory={activeCategory}
          startQuiz={startQuiz}
          handlePrint={handlePrint}
          setView={setView}
        />
      )}
    </div>
  );
}
