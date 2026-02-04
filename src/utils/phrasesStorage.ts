// よく使うフレーズの保存・読み込みユーティリティ

import { SavedPhrase } from "@/types/reservation";

const STORAGE_KEY = "clinic_saved_phrases";
const MAX_PHRASES = 10; // 最大保存数

/**
 * フレーズを読み込み
 */
export function loadPhrases(): SavedPhrase[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultPhrases();
    return JSON.parse(stored) as SavedPhrase[];
  } catch (error) {
    console.error("Failed to load phrases:", error);
    return getDefaultPhrases();
  }
}

/**
 * フレーズを保存
 */
export function savePhrase(text: string): SavedPhrase | null {
  if (typeof window === "undefined") return null;
  if (!text.trim()) return null;

  try {
    const phrases = loadPhrases();

    // 既存のフレーズか確認
    const existingIndex = phrases.findIndex(
      (p) => p.text.toLowerCase() === text.toLowerCase().trim()
    );

    if (existingIndex >= 0) {
      // 既存の場合は使用回数を増やす
      phrases[existingIndex].usageCount += 1;
    } else {
      // 新規追加
      const newPhrase: SavedPhrase = {
        id: `phrase-${Date.now()}`,
        text: text.trim(),
        usageCount: 1,
        createdAt: new Date().toISOString(),
      };
      phrases.unshift(newPhrase);

      // 最大数を超えたら古いものを削除
      if (phrases.length > MAX_PHRASES) {
        // 使用回数が少ないものを削除
        phrases.sort((a, b) => b.usageCount - a.usageCount);
        phrases.splice(MAX_PHRASES);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
    return phrases.find((p) => p.text === text.trim()) || null;
  } catch (error) {
    console.error("Failed to save phrase:", error);
    return null;
  }
}

/**
 * フレーズを削除
 */
export function deletePhrase(phraseId: string): void {
  if (typeof window === "undefined") return;

  try {
    const phrases = loadPhrases().filter((p) => p.id !== phraseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
  } catch (error) {
    console.error("Failed to delete phrase:", error);
  }
}

/**
 * フレーズの使用回数を増やす
 */
export function incrementPhraseUsage(phraseId: string): void {
  if (typeof window === "undefined") return;

  try {
    const phrases = loadPhrases();
    const phrase = phrases.find((p) => p.id === phraseId);
    if (phrase) {
      phrase.usageCount += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
    }
  } catch (error) {
    console.error("Failed to increment phrase usage:", error);
  }
}

/**
 * フレーズをリセット（デフォルトに戻す）
 */
export function resetPhrases(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getDefaultPhrases()));
  } catch (error) {
    console.error("Failed to reset phrases:", error);
  }
}

/**
 * デフォルトのフレーズ
 */
function getDefaultPhrases(): SavedPhrase[] {
  return [
    {
      id: "default-1",
      text: "予約したいです",
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "default-2",
      text: "料金を教えてください",
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "default-3",
      text: "キャンセルしたいです",
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "default-4",
      text: "営業時間は？",
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "default-5",
      text: "麻酔は使えますか？",
      usageCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * 使用頻度順にソートしたフレーズを取得
 */
export function getPhrasesOrderedByUsage(): SavedPhrase[] {
  const phrases = loadPhrases();
  return phrases.sort((a, b) => b.usageCount - a.usageCount);
}
