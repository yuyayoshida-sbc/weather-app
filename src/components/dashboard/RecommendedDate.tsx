"use client";

import Link from "next/link";
import { RecommendedBooking } from "@/types/dashboard";

interface RecommendedDateProps {
  recommendation: RecommendedBooking | null;
}

export default function RecommendedDate({ recommendation }: RecommendedDateProps) {
  if (!recommendation) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">次回推奨予約日</h2>
        <p className="text-gray-500 text-center py-4">
          施術履歴がないため、推奨日を計算できません
        </p>
        <Link
          href="/reservation"
          className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          初回予約をする
        </Link>
      </div>
    );
  }

  const recommendedDate = new Date(recommendation.recommendedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue = recommendation.daysSinceLastTreatment > 90;
  const isPastRecommended = recommendedDate <= today;

  // 日付のフォーマット
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日（${weekDay}）`;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">次回推奨予約日</h2>

      <div
        className={`p-4 rounded-lg mb-4 ${
          isOverdue
            ? "bg-orange-50 border border-orange-200"
            : isPastRecommended
            ? "bg-yellow-50 border border-yellow-200"
            : "bg-blue-50 border border-blue-200"
        }`}
      >
        {/* 推奨日 */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">推奨予約日</p>
          <p
            className={`text-2xl font-bold ${
              isOverdue
                ? "text-orange-600"
                : isPastRecommended
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          >
            {formatDate(recommendedDate)}
          </p>
          {isPastRecommended && (
            <p className="text-sm text-yellow-600 mt-1">
              ※ 推奨日を過ぎています
            </p>
          )}
        </div>

        {/* 経過日数 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-gray-600 text-sm">前回施術から</span>
          <span
            className={`text-xl font-bold ${
              isOverdue ? "text-orange-600" : "text-gray-900"
            }`}
          >
            {recommendation.daysSinceLastTreatment}日
          </span>
          <span className="text-gray-600 text-sm">経過</span>
        </div>

        {/* 理由 */}
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {recommendation.reason}
        </p>
      </div>

      {/* 未消化コース表示 */}
      {recommendation.courseName && (
        <div className="bg-green-50 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-600">🎫</span>
            <span className="text-sm text-green-800">
              {recommendation.courseName}をご利用いただけます
            </span>
          </div>
        </div>
      )}

      {/* 予約ボタン */}
      <Link
        href="/reservation"
        className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
          isOverdue
            ? "bg-orange-600 hover:bg-orange-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isOverdue ? "今すぐ予約する" : "予約する"}
      </Link>
    </div>
  );
}
