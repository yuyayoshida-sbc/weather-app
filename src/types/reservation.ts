// 施術カテゴリー
export type TreatmentCategory =
  | "beard"          // ヒゲ脱毛
  | "option"         // オプション
  | "consultation";  // カウンセリング

// 施術メニュー
export interface TreatmentMenu {
  id: string;
  name: string;
  category: TreatmentCategory;
  description: string;
  duration: number;           // 施術時間（分）
  price: number;              // 価格（税込）
  priceNote?: string;         // 価格補足
  isPopular: boolean;
}

// 予約ステータス
export type BookingStatus =
  | "pending"     // 仮予約
  | "confirmed"   // 確定
  | "cancelled"   // キャンセル
  | "completed";  // 完了

// 顧客情報
export interface CustomerInfo {
  name: string;
  phone: string;
  isFirstVisit: boolean;
}

// 予約データ
export interface Booking {
  id: string;
  menuId: string;
  menuName: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  duration: number;
  customer: CustomerInfo;
  status: BookingStatus;
  createdAt: string;
}

// 時間スロット
export interface TimeSlot {
  time: string;           // HH:mm
  available: boolean;
}

// 営業時間
export interface BusinessHours {
  dayOfWeek: number;      // 0=日曜, 1=月曜...
  open: string;           // HH:mm
  close: string;          // HH:mm
  isClosed: boolean;
}

// クリニック情報
export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  businessHours: BusinessHours[];
  slotDuration: number;   // 予約枠の単位（分）
}

// メニュー選択肢
export interface MenuOption {
  id: string;
  label: string;           // 表示テキスト
  value: string;           // 選択時に送信する値
  price?: string;          // 価格表示（オプション）
}

// 予約確認情報
export interface BookingConfirmation {
  customerId: string;        // 診察券番号
  customerName: string;      // 顧客名
  customerPhone: string;     // 電話番号
  date: string;              // 予約日
  time: string;              // 予約時間
  menu: string;              // メニュー名
  price: number;             // 料金
  withAnesthesia: boolean;   // 麻酔あり
}

// キャンセル待ちエントリー
export interface WaitlistEntry {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  menu: string;
  position: number;          // 待機順位
  withAnesthesia: boolean;
}

// 施術履歴
export interface TreatmentHistory {
  id: string;
  date: string;              // 施術日
  menu: string;              // メニュー名
  price: number;             // 料金
  withAnesthesia: boolean;   // 麻酔使用
  notes?: string;            // 備考
}

// チャットメッセージ
export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  quickReplies?: string[];  // クイック返信オプション
  timeSlots?: TimeSlot[];   // 時間選択肢
  menuOptions?: MenuOption[];  // メニュー選択肢
  showCalendar?: boolean;   // カレンダー表示フラグ
  showCustomerConfirm?: BookingConfirmation;  // 顧客確認表示
  showPayment?: BookingConfirmation;  // 事前決済表示
  showCustomerForm?: boolean;  // 顧客情報入力フォーム表示
  showWaitlistConfirm?: WaitlistEntry;  // キャンセル待ち確認表示
  showIntervalWarning?: boolean;  // 施術間隔警告表示
}

// 会話の状態
export type ConversationStep =
  | "idle"
  | "menu_selection"
  | "date_selection"
  | "time_selection"
  | "customer_name"
  | "customer_phone"
  | "confirmation";

export interface ConversationState {
  step: ConversationStep;
  selectedMenu?: TreatmentMenu;
  selectedDate?: string;
  selectedTime?: string;
  customerName?: string;
  customerPhone?: string;
}

// 意図タイプ
export type IntentType =
  | "booking_request"      // 予約したい
  | "menu_inquiry"         // メニュー問い合わせ
  | "price_inquiry"        // 料金問い合わせ
  | "hours_inquiry"        // 営業時間
  | "faq"                  // FAQ
  | "greeting"             // 挨拶
  | "confirmation"         // 確認（はい/いいえ）
  | "unknown";
