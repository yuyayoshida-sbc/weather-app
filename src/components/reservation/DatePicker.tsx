"use client";

import { useState } from "react";

interface DatePickerProps {
  onDateSelect: (date: Date) => void;
}

export default function DatePicker({ onDateSelect }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  // カレンダーに表示する日付を生成
  const daysInMonth: (Date | null)[] = [];

  // 月の最初の曜日まで空白を追加
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
    daysInMonth.push(null);
  }

  // 月の日付を追加
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    daysInMonth.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isDateSelectable = (date: Date | null): boolean => {
    if (!date) return false;
    // 今日以降のみ選択可能
    return date >= today;
  };

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-3 mt-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-800">
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-1 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-500"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          const selectable = isDateSelectable(date);
          const isToday = date && date.getTime() === today.getTime();
          const dayOfWeek = date?.getDay();

          return (
            <button
              key={index}
              onClick={() => date && selectable && onDateSelect(date)}
              disabled={!selectable}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                ${!date ? "invisible" : ""}
                ${selectable
                  ? "hover:bg-blue-100 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed"
                }
                ${isToday ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                ${!isToday && selectable && dayOfWeek === 0 ? "text-red-500" : ""}
                ${!isToday && selectable && dayOfWeek === 6 ? "text-blue-500" : ""}
              `}
            >
              {date?.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
