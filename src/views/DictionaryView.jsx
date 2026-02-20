import React from "react";
import { BookOpen, Search, Printer, Volume2 } from "lucide-react";

export const DictionaryView = ({
  theme,
  searchQuery,
  setSearchQuery,
  filterLevel,
  setFilterLevel,
  handlePrint,
  filteredKanji,
  playAudio,
}) => {
  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800"}`}
    >
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" /> Kanji Dictionary
          </h2>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search English or Kanji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${theme === "dark" ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"}`}
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className={`px-4 py-2 rounded-lg border font-bold ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-300 text-slate-900"}`}
            >
              <option value="ALL">All Levels</option>
              <option value="N4">N4</option>
              <option value="N5">N5</option>
            </select>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 justify-center"
            >
              <Printer className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-4">
          {filteredKanji.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition break-inside-avoid ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded bg-indigo-100 text-indigo-700 print:border print:border-slate-300`}
                >
                  {item.level}
                </span>
                <button
                  onClick={() => playAudio(item.cleanSentence || item.word)}
                  className="text-indigo-400 hover:text-indigo-600 print:hidden p-1 rounded hover:bg-indigo-50"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center mb-4">
                <div className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600 print:text-black">
                  {item.kanji}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white print:text-black">
                  {item.word}
                </div>
                <div
                  className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
                >
                  {item.reading}
                </div>
              </div>
              <div
                className={`text-sm pt-3 border-t ${theme === "dark" ? "border-slate-700 text-slate-300" : "border-slate-100 text-slate-700"}`}
              >
                <p className="font-bold mb-1">
                  Meaning: <span className="font-normal">{item.meaning}</span>
                </p>
                <p className="text-xs opacity-75">On: {item.onyomi}</p>
                <p className="text-xs opacity-75">Kun: {item.kunyomi}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredKanji.length === 0 && (
          <div className="text-center py-12 opacity-50">
            No Kanji found matching your search.
          </div>
        )}
      </main>

      <style>{`
        @media print {
          nav, button { display: none !important; }
          body { background: white; color: black; }
          main { padding: 0; margin: 0; max-width: none; }
          .print\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default DictionaryView;
