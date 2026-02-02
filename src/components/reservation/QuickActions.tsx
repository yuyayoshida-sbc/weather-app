"use client";

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
}

const QUICK_ACTIONS = [
  { label: "予約する", action: "予約したいです", icon: "📅" },
  { label: "料金一覧", action: "料金一覧を教えてください", icon: "💰" },
  { label: "麻酔", action: "麻酔について教えてください", icon: "💊" },
  { label: "営業時間", action: "営業時間を教えてください", icon: "🕐" },
];

export default function QuickActions({ onAction, disabled = false }: QuickActionsProps) {
  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map((item) => (
          <button
            key={item.label}
            onClick={() => onAction(item.action)}
            disabled={disabled}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
