import { IntentType, TreatmentMenu } from "@/types/reservation";
import { findMenuByKeyword } from "@/data/menus";

export interface ParsedIntent {
  type: IntentType;
  menu?: TreatmentMenu;
  date?: string;
  time?: string;
}

const INTENT_PATTERNS: { type: IntentType; patterns: string[] }[] = [
  {
    type: "booking_request",
    patterns: ["予約", "よやく", "取りたい", "行きたい", "受けたい", "申し込み"],
  },
  {
    type: "menu_inquiry",
    patterns: ["メニュー", "施術", "コース", "何がある", "できること", "一覧"],
  },
  {
    type: "price_inquiry",
    patterns: ["料金", "値段", "いくら", "価格", "費用", "金額"],
  },
  {
    type: "hours_inquiry",
    patterns: ["営業", "時間", "何時", "いつ", "休み", "定休", "開いて"],
  },
  {
    type: "greeting",
    patterns: ["こんにちは", "はじめまして", "初めまして", "おはよう", "こんばんは", "ありがとう"],
  },
  {
    type: "confirmation",
    patterns: ["はい", "いいえ", "お願い", "確定", "キャンセル", "やめ", "ok", "オーケー"],
  },
];

export function parseIntent(input: string): ParsedIntent {
  const lower = input.toLowerCase();

  // 意図を判定
  let type: IntentType = "unknown";
  for (const pattern of INTENT_PATTERNS) {
    if (pattern.patterns.some((p) => lower.includes(p))) {
      type = pattern.type;
      break;
    }
  }

  // メニューを検索
  const menu = findMenuByKeyword(input);

  // 日付を抽出
  const date = extractDate(input);

  // 時間を抽出
  const time = extractTime(input);

  return { type, menu, date, time };
}

function extractDate(input: string): string | undefined {
  const today = new Date();

  if (input.includes("今日")) {
    return formatDate(today);
  }
  if (input.includes("明日")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  }
  if (input.includes("明後日")) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return formatDate(dayAfter);
  }

  // 「来週の月曜」などのパターン
  const weekdayMatch = input.match(/来週の?(月|火|水|木|金|土|日)/);
  if (weekdayMatch) {
    const dayMap: Record<string, number> = {
      日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6,
    };
    const targetDay = dayMap[weekdayMatch[1]];
    const date = new Date(today);
    const currentDay = date.getDay();
    const daysUntilNextWeek = 7 - currentDay + targetDay;
    date.setDate(date.getDate() + daysUntilNextWeek);
    return formatDate(date);
  }

  // 「12月15日」などのパターン
  const dateMatch = input.match(/(\d{1,2})月(\d{1,2})日/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1], 10) - 1;
    const day = parseInt(dateMatch[2], 10);
    const date = new Date(today.getFullYear(), month, day);
    // 過去の日付なら来年
    if (date < today) {
      date.setFullYear(date.getFullYear() + 1);
    }
    return formatDate(date);
  }

  return undefined;
}

function extractTime(input: string): string | undefined {
  // 「15時」「15:00」「午後3時」などのパターン
  const timeMatch = input.match(/(\d{1,2})[:時](\d{0,2})?/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;

    // 午後の場合
    if (input.includes("午後") && hour < 12) {
      hour += 12;
    }

    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
  }

  return undefined;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
