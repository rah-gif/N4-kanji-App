import React, { useState } from "react";
import { Key, X } from "lucide-react";

export const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
  const [inputKey, setInputKey] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Key className="w-5 h-5" /> Enter Gemini API Key
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          To use the AI Tutor and Pronunciation features, you need a Google
          Gemini API Key. Your key is saved locally in your browser.
        </p>
        <input
          type="password"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Paste your API key here..."
          className="w-full p-3 border rounded-xl mb-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onSave(inputKey)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
          >
            Save Key
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
          >
            Cancel
          </button>
        </div>
        <div className="mt-4 text-xs text-center text-slate-400">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-indigo-500"
          >
            Get a free API key from Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
