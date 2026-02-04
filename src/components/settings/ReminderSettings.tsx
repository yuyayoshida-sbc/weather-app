"use client";

import {
  BookingReminderSettings,
  ReminderTiming,
  NotificationChannel,
  REMINDER_TIMING_LABELS,
} from "@/types/settings";

interface ReminderSettingsProps {
  settings: BookingReminderSettings;
  onChange: (settings: BookingReminderSettings) => void;
}

export default function ReminderSettings({ settings, onChange }: ReminderSettingsProps) {
  const handleEnabledChange = (enabled: boolean) => {
    onChange({ ...settings, enabled });
  };

  const handleTimingChange = (timing: ReminderTiming) => {
    onChange({ ...settings, timing });
  };

  const handleChannelChange = (channel: NotificationChannel, checked: boolean) => {
    const channels = checked
      ? [...settings.channels, channel]
      : settings.channels.filter((c) => c !== channel);
    onChange({ ...settings, channels });
  };

  const timingOptions: ReminderTiming[] = [
    "none",
    "same_day",
    "one_day_before",
    "three_days",
    "one_week",
  ];

  const channelOptions: { value: NotificationChannel; label: string }[] = [
    { value: "app", label: "アプリ通知" },
    { value: "email", label: "メール" },
    { value: "push", label: "プッシュ通知" },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">予約リマインダー</h2>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        予約日の前にリマインダー通知を受け取ります
      </p>

      {settings.enabled && (
        <div className="space-y-6">
          {/* タイミング選択 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">通知タイミング</h3>
            <div className="space-y-2">
              {timingOptions.map((timing) => (
                <label
                  key={timing}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="radio"
                    name="timing"
                    value={timing}
                    checked={settings.timing === timing}
                    onChange={() => handleTimingChange(timing)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{REMINDER_TIMING_LABELS[timing]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 通知チャンネル選択 */}
          {settings.timing !== "none" && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">通知方法</h3>
              <div className="space-y-2">
                {channelOptions.map((channel) => (
                  <label
                    key={channel.value}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={settings.channels.includes(channel.value)}
                      onChange={(e) => handleChannelChange(channel.value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-gray-900">{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
