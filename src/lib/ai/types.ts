import { MenuOption, TimeSlot, BookingConfirmation } from "@/types/reservation";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  menuOptions?: MenuOption[];  // メニュー選択肢
  timeSlots?: TimeSlot[];      // 時間選択肢
  showCalendar?: boolean;      // カレンダー表示フラグ
  showCustomerConfirm?: BookingConfirmation;  // 顧客確認表示
  showPayment?: BookingConfirmation;  // 事前決済表示
  showCustomerForm?: boolean;  // 顧客情報入力フォーム表示
}

export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
}

export interface AIProvider {
  name: string;
  sendMessage(messages: AIMessage[], systemPrompt: string): Promise<AIResponse>;
  configure(config: AIProviderConfig): void;
}
