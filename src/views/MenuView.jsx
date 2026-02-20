import React from "react";
import { GraduationCap, Flame, ChevronRight, BookOpen } from "lucide-react";

export const MenuView = ({ theme, xp, categories, startQuiz, setView }) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${theme === "dark" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Road to N4
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}
          >
            Master 300+ Kanji with native audio, AI-powered explanations, and
            adaptive quizzes.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => startQuiz(cat.id)}
              className={`group cursor-pointer rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden ${theme === "dark" ? "bg-slate-800 border-slate-700 hover:border-indigo-500" : "bg-white border-slate-200 hover:border-indigo-400 shadow-md"}`}
            >
              <div
                className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}
              >
                <span className="text-9xl grayscale opacity-10">
                  {cat.icon}
                </span>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-${cat.color}-100`}
              >
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{cat.title}</h2>
              <p
                className={`text-sm mb-4 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                {cat.desc}
              </p>
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                Start Quiz <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => setView("dictionary")}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold transition shadow-lg ${theme === "dark" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200"}`}
          >
            <BookOpen className="w-5 h-5" /> Open Dictionary
          </button>
        </div>
      </main>
    </div>
  );
};

export default MenuView;
