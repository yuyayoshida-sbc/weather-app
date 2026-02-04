"use client";

import { useState, useEffect, useRef } from "react";
import { SavedPhrase } from "@/types/reservation";
import {
  loadPhrases,
  savePhrase,
  deletePhrase,
  incrementPhraseUsage,
} from "@/utils/phrasesStorage";

interface SavedPhrasesProps {
  onSelect: (text: string) => void;
  currentInput: string;
  disabled?: boolean;
}

export default function SavedPhrases({
  onSelect,
  currentInput,
  disabled = false,
}: SavedPhrasesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phrases, setPhrases] = useState<SavedPhrase[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // フレーズを読み込み
  useEffect(() => {
    setPhrases(loadPhrases());
  }, [isOpen]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSavePrompt(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // フレーズ選択
  const handlePhraseSelect = (phrase: SavedPhrase) => {
    incrementPhraseUsage(phrase.id);
    onSelect(phrase.text);
    setIsOpen(false);
  };

  // フレーズ削除
  const handleDelete = (e: React.MouseEvent, phraseId: string) => {
    e.stopPropagation();
    deletePhrase(phraseId);
    setPhrases(loadPhrases());
  };

  // 長押し開始
  const handleLongPressStart = () => {
    if (currentInput.trim()) {
      longPressTimer.current = setTimeout(() => {
        setShowSavePrompt(true);
      }, 500);
    }
  };

  // 長押し終了
  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // フレーズ保存
  const handleSavePhrase = () => {
    if (currentInput.trim()) {
      savePhrase(currentInput.trim());
      setPhrases(loadPhrases());
      setShowSavePrompt(false);
    }
  };

  // ボタンクリック
  const handleButtonClick = () => {
    if (!showSavePrompt) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleButtonClick}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        disabled={disabled}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isOpen
            ? "bg-yellow-100 text-yellow-600"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title="よく使うフレーズ（長押しで保存）"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isOpen ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </button>

      {/* フレーズ保存プロンプト */}
      {showSavePrompt && currentInput.trim() && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
          <p className="text-sm text-gray-700 mb-2">
            「{currentInput.slice(0, 20)}
            {currentInput.length > 20 ? "..." : ""}」を保存しますか？
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSavePhrase}
              className="flex-1 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => setShowSavePrompt(false)}
              className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* フレーズリスト */}
      {isOpen && !showSavePrompt && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-500 font-medium">よく使うフレーズ</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {phrases.length === 0 ? (
              <p className="p-3 text-sm text-gray-400 text-center">
                フレーズがありません
              </p>
            ) : (
              phrases.map((phrase) => (
                <div
                  key={phrase.id}
                  onClick={() => handlePhraseSelect(phrase)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 group"
                >
                  <span className="text-sm text-gray-700 truncate flex-1">
                    {phrase.text}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, phrase.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="削除"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              長押しで現在の入力を保存
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
