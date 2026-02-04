// 通知設定の永続化ユーティリティ

import {
  NotificationSettings,
  BookingReminderSettings,
  CampaignNotificationSettings,
  CourseReminderSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/types/settings";

const STORAGE_KEY = "clinic_notification_settings";

/**
 * 通知設定を保存
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === "undefined") return;

  const settingsWithTimestamp: NotificationSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsWithTimestamp));
  } catch (error) {
    console.error("Failed to save notification settings:", error);
  }
}

/**
 * 通知設定を読み込み
 */
export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_NOTIFICATION_SETTINGS;

    const parsed = JSON.parse(stored) as NotificationSettings;
    // デフォルト値とマージして、新しいプロパティがあっても対応
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      bookingReminder: {
        ...DEFAULT_NOTIFICATION_SETTINGS.bookingReminder,
        ...parsed.bookingReminder,
      },
      campaignNotification: {
        ...DEFAULT_NOTIFICATION_SETTINGS.campaignNotification,
        ...parsed.campaignNotification,
      },
      courseReminder: {
        ...DEFAULT_NOTIFICATION_SETTINGS.courseReminder,
        ...parsed.courseReminder,
      },
    };
  } catch (error) {
    console.error("Failed to load notification settings:", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * 設定をデフォルトにリセット
 */
export function resetToDefaultSettings(): NotificationSettings {
  saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
  return DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * 予約リマインダー設定を更新
 */
export function updateBookingReminder(settings: BookingReminderSettings): void {
  const current = loadNotificationSettings();
  saveNotificationSettings({
    ...current,
    bookingReminder: settings,
  });
}

/**
 * キャンペーン通知設定を更新
 */
export function updateCampaignNotification(settings: CampaignNotificationSettings): void {
  const current = loadNotificationSettings();
  saveNotificationSettings({
    ...current,
    campaignNotification: settings,
  });
}

/**
 * コースリマインダー設定を更新
 */
export function updateCourseReminder(settings: CourseReminderSettings): void {
  const current = loadNotificationSettings();
  saveNotificationSettings({
    ...current,
    courseReminder: settings,
  });
}

/**
 * コースリマインダー間隔（日数）を取得
 * MockProvider等で使用
 */
export function getCourseReminderIntervalDays(): number {
  const settings = loadNotificationSettings();
  return settings.courseReminder.intervalDays;
}
