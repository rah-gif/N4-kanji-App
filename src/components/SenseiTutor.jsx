import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export const SenseiTutor = ({ item, theme, apiKey }) => {
  const [aiContent, setAiContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    if (!apiKey) {
      alert(
        "Please enter your Gemini API Key in Settings to use the AI Tutor.",
      );
      return;
    }
    if (aiContent || loading || !item) return;
    setLoading(true);
    try {
      const prompt = `
        Act as a Japanese Sensei helping a student with the JLPT N4 exam.
        Target Kanji: ${item.kanji} (Reading: ${item.reading}, Meaning: ${item.meaning}).
        Context Sentence: ${item.cleanSentence}
        
        Provide:
        1. 🎨 **Visual Mnemonic**: A short sentence to visualize this Kanji's shape.
        2. 🧠 **Grammar Breakdown**: Explain the sentence structure simply for an N4 student.
        3. 🇯🇵 **Real Japan & Exam**: Is this common in JLPT or daily conversation? Any nuances?
        
        Format with simple Markdown. Be encouraging!
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiContent(
        typeof text === "string" ? text : "Sensei is taking a break.",
      );
    } catch (e) {
      setAiContent("Sensei cannot connect. Please check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div
      className={`mt-4 border rounded-xl p-4 transition-colors ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-indigo-50 border-indigo-100"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`font-bold flex items-center gap-2 ${theme === "dark" ? "text-indigo-300" : "text-indigo-900"}`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Sensei's Corner
        </h3>
        {!aiContent && (
          <button
            onClick={fetchAdvice}
            className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Ask Sensei"
            )}
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4 text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      )}

      {aiContent && (
        <div
          className={`prose prose-sm max-w-none ${theme === "dark" ? "prose-invert text-slate-300" : "text-slate-700"}`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {aiContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default SenseiTutor;
