"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ReminderSettings from "./ReminderSettings";
import CampaignSettings from "./CampaignSettings";
import IntervalSettings from "./IntervalSettings";
import {
  NotificationSettings,
  BookingReminderSettings,
  CampaignNotificationSettings,
  CourseReminderSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/types/settings";
import {
  loadNotificationSettings,
  saveNotificationSettings,
  resetToDefaultSettings,
} from "@/utils/notificationSettings";

export default function SettingsContainer() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // 設定を読み込み
  useEffect(() => {
    const loaded = loadNotificationSettings();
    setSettings(loaded);
    setIsLoading(false);
  }, []);

  // 設定を保存（デバウンス付き）
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, []);

  // 各設定の更新ハンドラー
  const handleBookingReminderChange = (bookingReminder: BookingReminderSettings) => {
    saveSettings({ ...settings, bookingReminder });
  };

  const handleCampaignNotificationChange = (campaignNotification: CampaignNotificationSettings) => {
    saveSettings({ ...settings, campaignNotification });
  };

  const handleCourseReminderChange = (courseReminder: CourseReminderSettings) => {
    saveSettings({ ...settings, courseReminder });
  };

  // 設定をリセット
  const handleReset = () => {
    if (confirm("設定をデフォルトに戻しますか？")) {
      const defaultSettings = resetToDefaultSettings();
      setSettings(defaultSettings);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-600">←</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">通知設定</h1>
          </div>
        </div>
      </header>

      {/* 保存通知 */}
      {isSaved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ 設定を保存しました
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 予約リマインダー */}
        <ReminderSettings
          settings={settings.bookingReminder}
          onChange={handleBookingReminderChange}
        />

        {/* コース消化リマインダー */}
        <IntervalSettings
          settings={settings.courseReminder}
          onChange={handleCourseReminderChange}
        />

        {/* キャンペーン情報 */}
        <CampaignSettings
          settings={settings.campaignNotification}
          onChange={handleCampaignNotificationChange}
        />

        {/* リセットボタン */}
        <div className="pt-4">
          <button
            onClick={handleReset}
            className="w-full py-3 text-gray-600 text-sm hover:text-gray-800 transition-colors"
          >
            設定をデフォルトに戻す
          </button>
        </div>

        {/* 更新日時 */}
        {settings.updatedAt && (
          <p className="text-xs text-gray-400 text-center">
            最終更新: {new Date(settings.updatedAt).toLocaleString("ja-JP")}
          </p>
        )}
      </main>
    </div>
  );
}
