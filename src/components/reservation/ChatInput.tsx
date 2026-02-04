"use client";

import { useState, KeyboardEvent, CompositionEvent } from "react";
import VoiceInputButton from "./VoiceInputButton";
import ImageUploader from "./ImageUploader";
import SavedPhrases from "./SavedPhrases";

interface ChatInputProps {
  onSend: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "メッセージを入力...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false); // IME変換中かどうか
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((trimmed || pendingImage) && !disabled) {
      onSend(trimmed, pendingImage || undefined);
      setInput("");
      setPendingImage(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME変換中はEnterで送信しない
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // IME変換開始
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // IME変換終了
  const handleCompositionEnd = (e: CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);
    // 変換確定後の値を反映
    setInput(e.currentTarget.value);
  };

  // 音声入力の結果を受け取る
  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => prev + text);
  };

  // 画像選択
  const handleImageSelect = (imageData: string) => {
    setPendingImage(imageData);
  };

  // 画像キャンセル
  const handleImageCancel = () => {
    setPendingImage(null);
  };

  // フレーズ選択
  const handlePhraseSelect = (text: string) => {
    setInput(text);
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {/* 画像プレビュー */}
      {pendingImage && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <img
              src={pendingImage}
              alt="送信する画像"
              className="max-h-24 rounded-lg border border-gray-200"
            />
            <button
              onClick={handleImageCancel}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
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
        </div>
      )}

      {/* 入力エリア */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* 音声入力ボタン */}
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            disabled={disabled}
          />

          {/* 画像アップロードボタン */}
          <ImageUploader
            onImageSelect={handleImageSelect}
            disabled={disabled}
          />

          {/* テキスト入力 */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />

          {/* フレーズボタン */}
          <SavedPhrases
            onSelect={handlePhraseSelect}
            currentInput={input}
            disabled={disabled}
          />

          {/* 送信ボタン */}
          <button
            onClick={handleSend}
            disabled={disabled || (!input.trim() && !pendingImage)}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
