"use client";

import {
  CampaignNotificationSettings,
  CampaignCategory,
  CAMPAIGN_CATEGORY_LABELS,
} from "@/types/settings";

interface CampaignSettingsProps {
  settings: CampaignNotificationSettings;
  onChange: (settings: CampaignNotificationSettings) => void;
}

export default function CampaignSettings({ settings, onChange }: CampaignSettingsProps) {
  const handleEnabledChange = (enabled: boolean) => {
    onChange({ ...settings, enabled });
  };

  const handleFrequencyChange = (frequency: "all" | "weekly" | "monthly") => {
    onChange({ ...settings, frequency });
  };

  const handleCategoryChange = (category: CampaignCategory, checked: boolean) => {
    const categories = checked
      ? [...settings.categories, category]
      : settings.categories.filter((c) => c !== category);
    onChange({ ...settings, categories });
  };

  const frequencyOptions: { value: "all" | "weekly" | "monthly"; label: string }[] = [
    { value: "all", label: "すべて受け取る" },
    { value: "weekly", label: "週1回まとめて" },
    { value: "monthly", label: "月1回まとめて" },
  ];

  const categoryOptions: CampaignCategory[] = [
    "discount",
    "new_menu",
    "seasonal",
    "member_only",
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">キャンペーン情報</h2>
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
        お得なキャンペーンや新メニューの情報を受け取ります
      </p>

      {settings.enabled && (
        <div className="space-y-6">
          {/* カテゴリ選択 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">受け取る情報</h3>
            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={settings.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-900">{CAMPAIGN_CATEGORY_LABELS[category]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 受信頻度 */}
          {settings.categories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">受信頻度</h3>
              <div className="space-y-2">
                {frequencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={settings.frequency === option.value}
                      onChange={() => handleFrequencyChange(option.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{option.label}</span>
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
