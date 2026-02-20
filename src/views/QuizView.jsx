import React from "react";
import {
  ArrowLeft,
  Loader2,
  Volume2,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import SenseiTutor from "../components/SenseiTutor";

export const QuizView = ({
  theme,
  quizItems,
  currentQuizIndex,
  quizState,
  selectedOption,
  handleAnswer,
  nextQuestion,
  setView,
  playAudio,
  isPlaying,
  userApiKey,
}) => {
  const currentItem = quizItems[currentQuizIndex];

  if (!currentItem) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const progress = ((currentQuizIndex + 1) / quizItems.length) * 100;

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <div className="max-w-2xl mx-auto p-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setView("menu")}
            className="p-2 hover:bg-slate-200/20 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-2 rounded-full bg-slate-200/20 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="font-bold text-indigo-500">
            {currentQuizIndex + 1}/{quizItems.length}
          </div>
        </div>

        {/* Card */}
        <div
          className={`flex-1 rounded-3xl shadow-2xl overflow-hidden flex flex-col border ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <div className="p-8 text-center border-b border-slate-200/10 relative">
            <button
              onClick={() => playAudio(currentItem.cleanSentence)}
              className="absolute top-6 right-6 p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition"
              title="Play Sentence"
            >
              {isPlaying ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>

            <h2
              className={`text-sm font-bold uppercase tracking-widest mb-6 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
            >
              Select the correct reading
            </h2>
            <p className="text-2xl font-bold leading-relaxed text-slate-900 dark:text-white mb-4">
              {currentItem.sentence.split("**").map((part, i) =>
                i % 2 === 1 ? (
                  <span
                    key={i}
                    className="text-indigo-500 border-b-2 border-indigo-500/30 pb-1"
                  >
                    {part}
                  </span>
                ) : (
                  part
                ),
              )}
            </p>

            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium italic">
              "{currentItem.english}"
            </p>
          </div>

          <div className="p-6 grid gap-3 flex-1 bg-slate-100/50 dark:bg-slate-900/50">
            {currentItem.options.map((opt, i) => {
              let status = "default";
              if (quizState === "feedback") {
                if (i === currentItem.correctIndex) status = "correct";
                else if (i === selectedOption) status = "wrong";
                else status = "dim";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={quizState === "feedback"}
                  className={`
                    w-full p-4 rounded-xl text-lg font-bold flex justify-between items-center transition-all duration-200
                    ${status === "default" ? (theme === "dark" ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-white hover:bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300") : ""}
                    ${status === "correct" ? "bg-green-600 text-white shadow-lg ring-2 ring-green-400 border-green-600" : ""}
                    ${status === "wrong" ? "bg-red-500 text-white shadow-lg ring-2 ring-red-400 border-red-500" : ""}
                    ${status === "dim" ? "opacity-40 grayscale border-transparent" : ""}
                  `}
                >
                  {opt}
                  {status === "correct" && <CheckCircle className="w-6 h-6" />}
                  {status === "wrong" && <XCircle className="w-6 h-6" />}
                </button>
              );
            })}
          </div>

          {quizState === "feedback" && (
            <div
              className={`p-6 border-t animate-in slide-in-from-bottom-4 ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-indigo-50 border-indigo-100"}`}
            >
              <div
                className={`mb-4 font-black uppercase tracking-widest ${selectedOption === currentItem.correctIndex ? "text-green-500" : "text-red-500"}`}
              >
                {selectedOption === currentItem.correctIndex
                  ? "Correct!"
                  : "Incorrect"}
              </div>

              <div className="flex gap-4 mb-4">
                <div
                  className={`w-14 h-14 flex items-center justify-center rounded-xl text-3xl font-black shrink-0 ${theme === "dark" ? "bg-slate-800 text-white" : "bg-white text-indigo-600 shadow-sm border border-indigo-100"}`}
                >
                  {currentItem.kanji}
                </div>
                <div>
                  <div className="font-bold opacity-75 text-xs uppercase mb-1">
                    Meaning & Rationale
                  </div>
                  <div className="font-bold text-lg leading-snug mb-1">
                    {currentItem.meaning}
                  </div>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}
                  >
                    {currentItem.explanation}
                  </p>
                </div>
              </div>

              <SenseiTutor
                item={currentItem}
                theme={theme}
                apiKey={userApiKey}
              />

              <button
                onClick={nextQuestion}
                className="w-full mt-4 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition flex items-center justify-center gap-2"
              >
                {currentQuizIndex === quizItems.length - 1
                  ? "Finish Quiz"
                  : "Next Question"}{" "}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
