// 通知設定関連の型定義

// リマインダータイミング
export type ReminderTiming =
  | "none" // 通知なし
  | "same_day" // 当日
  | "one_day_before" // 前日
  | "three_days" // 3日前
  | "one_week"; // 1週間前

// 通知チャンネル
export type NotificationChannel = "app" | "email" | "push";

// 予約リマインダー設定
export interface BookingReminderSettings {
  enabled: boolean;
  timing: ReminderTiming;
  channels: NotificationChannel[];
}

// キャンペーン通知設定
export interface CampaignNotificationSettings {
  enabled: boolean;
  categories: CampaignCategory[];
  frequency: "all" | "weekly" | "monthly";
}

// キャンペーンカテゴリ
export type CampaignCategory =
  | "discount" // 割引キャンペーン
  | "new_menu" // 新メニュー
  | "seasonal" // 季節限定
  | "member_only"; // 会員限定

// コース消化リマインダー設定
export interface CourseReminderSettings {
  enabled: boolean;
  intervalDays: number; // 推奨間隔（日数）
  reminderBeforeExpiry: number; // 有効期限前のリマインダー（日数）
}

// 全通知設定
export interface NotificationSettings {
  bookingReminder: BookingReminderSettings;
  campaignNotification: CampaignNotificationSettings;
  courseReminder: CourseReminderSettings;
  updatedAt: string;
}

// デフォルト設定
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  bookingReminder: {
    enabled: true,
    timing: "one_day_before",
    channels: ["app"],
  },
  campaignNotification: {
    enabled: false,
    categories: [],
    frequency: "weekly",
  },
  courseReminder: {
    enabled: true,
    intervalDays: 90, // 現在の固定値（3ヶ月）
    reminderBeforeExpiry: 30,
  },
  updatedAt: "",
};

// リマインダータイミングのラベル
export const REMINDER_TIMING_LABELS: Record<ReminderTiming, string> = {
  none: "通知しない",
  same_day: "当日",
  one_day_before: "前日",
  three_days: "3日前",
  one_week: "1週間前",
};

// キャンペーンカテゴリのラベル
export const CAMPAIGN_CATEGORY_LABELS: Record<CampaignCategory, string> = {
  discount: "割引キャンペーン",
  new_menu: "新メニュー情報",
  seasonal: "季節限定プラン",
  member_only: "会員限定特典",
};

// 間隔プリセット
export const INTERVAL_PRESETS = [
  { label: "1ヶ月", days: 30 },
  { label: "2ヶ月", days: 60 },
  { label: "3ヶ月", days: 90 },
  { label: "4ヶ月", days: 120 },
] as const;
