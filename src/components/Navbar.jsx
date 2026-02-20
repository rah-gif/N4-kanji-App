import React from "react";
import {
  BookOpen,
  GraduationCap,
  Flame,
  Moon,
  Sun,
  Settings,
} from "lucide-react";

export const Navbar = ({
  view,
  setView,
  theme,
  toggleTheme,
  xp,
  onOpenSettings,
}) => (
  <nav
    className={`sticky top-0 z-50 px-4 py-3 shadow-sm border-b transition-colors duration-300 ${theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
  >
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <button
        onClick={() => setView("menu")}
        className="flex items-center gap-2 group"
      >
        <GraduationCap
          className={`w-8 h-8 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}
        />
        <span
          className={`font-bold text-xl tracking-tight ${theme === "dark" ? "text-white" : "text-slate-800"}`}
        >
          N4<span className="text-indigo-500">Master</span>
        </span>
      </button>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="font-bold text-yellow-800 text-sm">
            {typeof xp === "number" ? xp : 0} XP
          </span>
        </div>

        <button
          onClick={() => setView("dictionary")}
          className={`p-2 rounded-lg transition ${view === "dictionary" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"}`}
          title="Dictionary"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSettings}
          className={`p-2 rounded-lg transition text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800`}
          title="API Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition ${theme === "dark" ? "bg-slate-800 text-yellow-400" : "bg-slate-100 text-slate-600"}`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  </nav>
);

export default Navbar;
