import { Booking, ChatMessage, TimeSlot } from "@/types/reservation";
import { CLINIC_INFO, getBusinessHoursForDate } from "@/data/clinic";

const STORAGE_KEYS = {
  BOOKINGS: "clinic_bookings",
  CHAT_HISTORY: "clinic_chat_history",
} as const;

// 予約データの保存・読み込み
export function saveBookings(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addBooking(booking: Booking): void {
  const bookings = loadBookings();
  bookings.push(booking);
  saveBookings(bookings);
}

export function generateBookingId(): string {
  return `BK${Date.now().toString(36).toUpperCase()}`;
}

// チャット履歴の保存・読み込み
export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  const toSave = messages.slice(-50); // 最新50件のみ
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(toSave));
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

// 時間をパース（HH:mm → 分）
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// 分を時間にフォーマット
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// 空き時間スロットを取得
export function getAvailableSlots(dateStr: string, duration: number = 30): TimeSlot[] {
  const date = new Date(dateStr);
  const hours = getBusinessHoursForDate(date);

  if (!hours) return []; // 定休日

  const bookings = loadBookings();
  const dayBookings = bookings.filter(
    (b) => b.date === dateStr && b.status !== "cancelled"
  );

  const slots: TimeSlot[] = [];
  const openTime = parseTime(hours.open);
  const closeTime = parseTime(hours.close);
  const slotDuration = CLINIC_INFO.slotDuration;

  for (let time = openTime; time + duration <= closeTime; time += slotDuration) {
    const timeStr = formatTime(time);
    const endTime = time + duration;

    // この時間帯に予約があるかチェック
    const isBooked = dayBookings.some((booking) => {
      const bookingStart = parseTime(booking.time);
      const bookingEnd = bookingStart + booking.duration;
      // 重複チェック
      return time < bookingEnd && endTime > bookingStart;
    });

    slots.push({
      time: timeStr,
      available: !isBooked,
    });
  }

  return slots;
}

// 日付文字列を生成
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 明日の日付を取得
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateString(tomorrow);
}

// 今日の日付を取得
export function getToday(): string {
  return formatDateString(new Date());
}

// 指定日数後の日付を取得
export function getDateAfterDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}
