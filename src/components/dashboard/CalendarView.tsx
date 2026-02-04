"use client";

import { useState } from "react";
import { CalendarEvent, CalendarMonth, CalendarDay } from "@/types/dashboard";
import { generateCalendarMonth, getMonthName } from "@/data/dashboardData";

interface CalendarViewProps {
  events: CalendarEvent[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const calendarData = generateCalendarMonth(currentYear, currentMonth, events);

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">施術カレンダー</h2>

      {/* 月選択ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-gray-600">◀</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {currentYear}年 {getMonthName(currentMonth)}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-gray-600">▶</span>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-2 ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-600"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.days.map((day, index) => {
          const hasEvents = day.events.length > 0;
          const isSelected = selectedDay?.date === day.date;

          return (
            <button
              key={`${day.date}-${index}`}
              onClick={() => setSelectedDay(hasEvents ? day : null)}
              disabled={!hasEvents}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                transition-colors
                ${!day.isCurrentMonth ? "text-gray-300" : ""}
                ${day.isToday ? "ring-2 ring-blue-500" : ""}
                ${isSelected ? "bg-blue-100" : hasEvents ? "hover:bg-gray-100" : ""}
                ${hasEvents ? "cursor-pointer" : "cursor-default"}
              `}
            >
              <span
                className={`${
                  day.isToday ? "font-bold text-blue-600" : ""
                }`}
              >
                {day.dayOfMonth}
              </span>
              {hasEvents && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {day.events.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 選択日の詳細 */}
      {selectedDay && selectedDay.events.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {selectedDay.date} の施術
          </h4>
          <div className="space-y-2">
            {selectedDay.events.map((event) => (
              <div
                key={event.historyId}
                className="bg-white p-3 rounded-lg shadow-sm"
              >
                <p className="font-medium text-gray-900 text-sm">{event.menu}</p>
                <p className="text-xs text-gray-500">{event.clinicName}</p>
                {event.rating && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {"★".repeat(event.rating)}{"☆".repeat(5 - event.rating)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* イベントがない場合のメッセージ */}
      {events.length === 0 && (
        <p className="text-center text-gray-500 mt-4 text-sm">
          施術履歴がありません
        </p>
      )}
    </div>
  );
}
