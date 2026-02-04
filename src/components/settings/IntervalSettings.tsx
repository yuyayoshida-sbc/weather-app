"use client";

import { CourseReminderSettings, INTERVAL_PRESETS } from "@/types/settings";

interface IntervalSettingsProps {
  settings: CourseReminderSettings;
  onChange: (settings: CourseReminderSettings) => void;
}

export default function IntervalSettings({ settings, onChange }: IntervalSettingsProps) {
  const handleEnabledChange = (enabled: boolean) => {
    onChange({ ...settings, enabled });
  };

  const handleIntervalChange = (intervalDays: number) => {
    onChange({ ...settings, intervalDays });
  };

  const handleExpiryReminderChange = (reminderBeforeExpiry: number) => {
    onChange({ ...settings, reminderBeforeExpiry });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">コース消化リマインダー</h2>
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
        施術間隔が開いた時や、コース有効期限が近づいた時にお知らせします
      </p>

      {settings.enabled && (
        <div className="space-y-6">
          {/* 施術間隔設定 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              推奨施術間隔
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              前回の施術から指定日数経過でリマインダーを表示します
            </p>

            {/* プリセット選択 */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {INTERVAL_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => handleIntervalChange(preset.days)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    settings.intervalDays === preset.days
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* スライダー */}
            <div className="space-y-2">
              <input
                type="range"
                min="14"
                max="180"
                value={settings.intervalDays}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>2週間</span>
                <span className="font-medium text-blue-600">
                  {settings.intervalDays}日
                </span>
                <span>6ヶ月</span>
              </div>
            </div>

            {/* 説明 */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 脱毛の効果を最大化するには、4〜8週間の間隔が推奨されます。
                現在の設定では、前回の施術から約{Math.floor(settings.intervalDays / 7)}週間
                でリマインダーが表示されます。
              </p>
            </div>
          </div>

          {/* 有効期限リマインダー */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              有効期限リマインダー
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              コースの有効期限が近づいた時にお知らせします
            </p>

            <div className="flex items-center gap-3">
              <span className="text-gray-700">期限の</span>
              <select
                value={settings.reminderBeforeExpiry}
                onChange={(e) => handleExpiryReminderChange(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">1週間</option>
                <option value="14">2週間</option>
                <option value="30">1ヶ月</option>
                <option value="60">2ヶ月</option>
                <option value="90">3ヶ月</option>
              </select>
              <span className="text-gray-700">前に通知</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
