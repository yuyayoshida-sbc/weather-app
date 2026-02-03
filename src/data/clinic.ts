import { ClinicInfo } from "@/types/reservation";

export const CLINIC_INFO: ClinicInfo = {
  name: "SBC Men's Flash",
  address: "東京都新宿区西新宿1-1-1 新宿ビル3F",
  phone: "0120-XXX-XXX", // 従来の電話番号（非表示）
  businessHours: [
    { dayOfWeek: 0, open: "", close: "", isClosed: true },      // 日曜定休
    { dayOfWeek: 1, open: "11:00", close: "20:00", isClosed: false },
    { dayOfWeek: 2, open: "11:00", close: "20:00", isClosed: false },
    { dayOfWeek: 3, open: "11:00", close: "20:00", isClosed: false },
    { dayOfWeek: 4, open: "11:00", close: "21:00", isClosed: false }, // 木曜は21時まで
    { dayOfWeek: 5, open: "11:00", close: "20:00", isClosed: false },
    { dayOfWeek: 6, open: "10:00", close: "19:00", isClosed: false }, // 土曜は10時から
  ],
  slotDuration: 30, // 30分単位
};

export const BUSINESS_HOURS_TEXT = `【営業時間】
月〜金：11:00〜20:00
木曜日：11:00〜21:00（夜間営業）
土曜日：10:00〜19:00

【定休日】
日曜日・祝日`;

// チャットサポート案内テキスト
export const CHAT_SUPPORT_TEXT = "💬 チャットでお問い合わせ";
export const CHAT_SUPPORT_NOTE = "予約画面のチャットからいつでもご相談いただけます";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek];
}

export function isClinicOpen(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const hours = CLINIC_INFO.businessHours[dayOfWeek];
  return !hours.isClosed;
}

export function getBusinessHoursForDate(date: Date): { open: string; close: string } | null {
  const dayOfWeek = date.getDay();
  const hours = CLINIC_INFO.businessHours[dayOfWeek];
  if (hours.isClosed) return null;
  return { open: hours.open, close: hours.close };
}

export function formatDateJapanese(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = DAY_NAMES[date.getDay()];
  return `${month}月${day}日（${dayName}）`;
}
