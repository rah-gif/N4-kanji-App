import React from "react";
import { Trophy, BookOpen, RefreshCw, Share2 } from "lucide-react";

export const ResultView = ({
  theme,
  score,
  quizItems,
  activeCategory,
  startQuiz,
  handlePrint,
  setView,
}) => {
  const percentage = Math.round((score / quizItems.length) * 100);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${theme === "dark" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <div
        id="result-card"
        className={`max-w-md w-full rounded-3xl shadow-2xl p-8 text-center border relative overflow-hidden ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
      >
        {percentage >= 80 && (
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-400 via-red-500 to-indigo-500"></div>
        )}

        <div className="relative z-10">
          <div className="mb-6 flex justify-center">
            {percentage >= 80 ? (
              <div className="bg-yellow-100 p-6 rounded-full animate-bounce">
                <Trophy className="w-20 h-20 text-yellow-600" />
              </div>
            ) : (
              <div className="bg-indigo-100 p-6 rounded-full">
                <BookOpen className="w-20 h-20 text-indigo-600" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-black mb-2">
            {percentage >= 80 ? "Certificate of Mastery" : "Training Complete"}
          </h2>
          <p className="opacity-60 mb-8 font-medium uppercase tracking-wider">
            {activeCategory?.title || "N4"} Quiz
          </p>

          <div className="flex justify-center items-end gap-2 mb-8 bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10">
            <span className="text-6xl font-black text-indigo-500">{score}</span>
            <span className="text-xl font-bold opacity-50 mb-2">
              / {quizItems.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 print:hidden">
            <div className="bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
              <div className="text-xs opacity-60 uppercase font-bold">
                XP Earned
              </div>
              <div className="text-xl font-bold text-orange-500">
                +{score * 10} XP
              </div>
            </div>
            <div className="bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
              <div className="text-xs opacity-60 uppercase font-bold">
                Accuracy
              </div>
              <div
                className={`text-xl font-bold ${percentage >= 80 ? "text-green-500" : "text-blue-500"}`}
              >
                {percentage}%
              </div>
            </div>
          </div>

          <div className="space-y-3 print:hidden">
            <button
              onClick={() => startQuiz(activeCategory?.id || "daily_life")}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <RefreshCw className="w-5 h-5" /> Retry Quiz
            </button>
            <button
              onClick={handlePrint}
              className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" /> Save Result as PDF
            </button>
            <button
              onClick={() => setView("menu")}
              className="w-full py-3 opacity-60 hover:opacity-100 transition font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #result-card, #result-card * {
            visibility: visible;
          }
          #result-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            border: 2px solid #333;
            box-shadow: none !important;
            transform: none !important;
          }
          nav, button, .print\\:hidden { 
            display: none !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default ResultView;
