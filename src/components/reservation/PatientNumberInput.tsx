"use client";

import { useState, useEffect } from "react";
import {
  loadRememberedPatientNumber,
  saveRememberedPatientNumber,
  clearRememberedPatientNumber,
} from "@/utils/customerSession";

interface PatientNumberInputProps {
  onSubmit: (patientNumber: string, rememberMe: boolean) => void;
  onSkip?: () => void;
  error?: string;
  isLoading?: boolean;
}

export default function PatientNumberInput({
  onSubmit,
  onSkip,
  error,
  isLoading,
}: PatientNumberInputProps) {
  const [patientNumber, setPatientNumber] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState("");

  // 記憶された診察券番号を読み込み
  useEffect(() => {
    const remembered = loadRememberedPatientNumber();
    if (remembered) {
      setPatientNumber(remembered);
      setRememberMe(true);
    }
  }, []);

  // 診察券番号のバリデーション
  const validatePatientNumber = (value: string): boolean => {
    // 形式: SBC-XXXXXX (6桁の数字)
    const pattern = /^SBC-\d{6}$/i;
    return pattern.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const trimmed = patientNumber.trim().toUpperCase();

    if (!trimmed) {
      setLocalError("診察券番号を入力してください");
      return;
    }

    if (!validatePatientNumber(trimmed)) {
      setLocalError("診察券番号の形式が正しくありません（例: SBC-123456）");
      return;
    }

    // 診察券番号を記憶
    if (rememberMe) {
      saveRememberedPatientNumber(trimmed);
    } else {
      clearRememberedPatientNumber();
    }

    onSubmit(trimmed, rememberMe);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();

    // 自動でSBC-を付ける
    if (value && !value.startsWith("SBC-") && !value.startsWith("SBC")) {
      if (/^\d/.test(value)) {
        value = "SBC-" + value;
      }
    }

    // SBCの後に-がない場合は追加
    if (value.startsWith("SBC") && value.length > 3 && value[3] !== "-") {
      value = "SBC-" + value.slice(3);
    }

    setPatientNumber(value);
    setLocalError("");
  };

  const displayError = error || localError;

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 max-w-sm mx-auto">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🎫</span>
        </div>
        <h3 className="font-semibold text-gray-800 text-lg">診察券番号を入力</h3>
        <p className="text-sm text-gray-500 mt-1">
          お客様情報を確認いたします
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={patientNumber}
            onChange={handleChange}
            placeholder="SBC-123456"
            className={`w-full px-4 py-3 rounded-xl border-2 text-center text-lg font-mono tracking-wider
              text-gray-900 bg-white
              ${displayError ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}
              focus:outline-none transition-colors`}
            disabled={isLoading}
            autoFocus
            maxLength={10}
          />
          {displayError && (
            <p className="text-red-500 text-sm mt-2 text-center">{displayError}</p>
          )}
        </div>

        {/* 診察券番号を記憶 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">診察券番号を記憶する</span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !patientNumber}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all
            ${isLoading || !patientNumber
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              確認中...
            </span>
          ) : (
            "ログイン"
          )}
        </button>

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="w-full py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            初めての方・診察券をお持ちでない方
          </button>
        )}
      </form>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          診察券番号は「SBC-」から始まる6桁の番号です
        </p>
      </div>
    </div>
  );
}
