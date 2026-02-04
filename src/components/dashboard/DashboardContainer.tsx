"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProgressChart from "./ProgressChart";
import CalendarView from "./CalendarView";
import RecommendedDate from "./RecommendedDate";
import PointsTab from "./PointsTab";
import CouponsTab from "./CouponsTab";
import ReferralTab from "./ReferralTab";
import {
  CourseProgress,
  CalendarEvent,
  RecommendedBooking,
  DashboardSummary,
} from "@/types/dashboard";
import { CustomerPoints, Coupon, ReferralProgram } from "@/types/points";
import {
  calculateCourseProgress,
  generateCalendarEvents,
  calculateRecommendedBooking,
  calculateDashboardSummary,
} from "@/data/dashboardData";
import { loadCustomerSession } from "@/utils/customerSession";
import { getCustomerHistory, getCustomerContracts } from "@/data/customers";
import { TREATMENT_HISTORY, COURSE_CONTRACTS } from "@/data/history";
import {
  loadCustomerPoints,
  loadCustomerCoupons,
  loadCustomerReferral,
} from "@/utils/pointsStorage";

type TabType = "summary" | "points" | "coupons" | "referral";

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: "summary", label: "サマリー", icon: "📊" },
  { id: "points", label: "ポイント", icon: "🎁" },
  { id: "coupons", label: "クーポン", icon: "🎟️" },
  { id: "referral", label: "紹介", icon: "👥" },
];

export default function DashboardContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [recommendedBooking, setRecommendedBooking] = useState<RecommendedBooking | null>(null);
  const [customerPoints, setCustomerPoints] = useState<CustomerPoints | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [referral, setReferral] = useState<ReferralProgram | null>(null);

  useEffect(() => {
    const session = loadCustomerSession();

    if (session && session.isAuthenticated) {
      setIsAuthenticated(true);
      setCustomerId(session.customerId);
      setCustomerName(session.customerName);

      // 顧客データを取得
      const history = getCustomerHistory(session.customerId);
      const contracts = getCustomerContracts(session.customerId);

      // ダッシュボードデータを計算
      setSummary(calculateDashboardSummary(history, contracts));
      setCourseProgress(calculateCourseProgress(contracts));
      setCalendarEvents(generateCalendarEvents(history));
      setRecommendedBooking(calculateRecommendedBooking(history, contracts));

      // ポイント・クーポン・紹介データを取得
      setCustomerPoints(loadCustomerPoints(session.customerId));
      setCoupons(loadCustomerCoupons(session.customerId));
      setReferral(loadCustomerReferral(session.customerId));
    } else {
      // 未認証の場合はデモデータを表示
      setIsAuthenticated(false);
      setSummary(calculateDashboardSummary(TREATMENT_HISTORY, COURSE_CONTRACTS));
      setCourseProgress(calculateCourseProgress(COURSE_CONTRACTS));
      setCalendarEvents(generateCalendarEvents(TREATMENT_HISTORY));
      setRecommendedBooking(calculateRecommendedBooking(TREATMENT_HISTORY, COURSE_CONTRACTS));
    }

    setIsLoading(false);
  }, []);

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
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/reservation" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-lg hover:bg-white/30 transition-colors" title="予約チャットに戻る">
              🏠
            </Link>
            <h1 className="text-xl font-bold">マイページ</h1>
          </div>
          {isAuthenticated ? (
            <p className="text-blue-100 text-sm mt-1">
              {customerName}様、こんにちは
            </p>
          ) : (
            <p className="text-blue-100 text-sm mt-1">
              デモ表示中（ログインで個人データを表示）
            </p>
          )}
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* サマリータブ */}
        {activeTab === "summary" && (
          <>
            {/* サマリーカード */}
            {summary && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">施術サマリー</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.totalTreatments}
                    </p>
                    <p className="text-xs text-gray-600">総施術回数</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {summary.activeCourses}
                    </p>
                    <p className="text-xs text-gray-600">契約中コース</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {summary.averageRating ? `${summary.averageRating}` : "-"}
                    </p>
                    <p className="text-xs text-gray-600">平均満足度</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ¥{summary.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">総支払額</p>
                  </div>
                </div>
                {summary.lastTreatmentDate && (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    最終施術日: {summary.lastTreatmentDate}
                  </p>
                )}
              </div>
            )}

            {/* 次回推奨予約日 */}
            <RecommendedDate recommendation={recommendedBooking} />

            {/* コース進捗 */}
            <ProgressChart courses={courseProgress} />

            {/* 施術カレンダー */}
            <CalendarView events={calendarEvents} />

            {/* クイックリンク */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">メニュー</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/gallery"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">📸</span>
                  <div>
                    <p className="font-medium text-gray-900">写真記録</p>
                    <p className="text-xs text-gray-500">ビフォーアフター</p>
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">🔔</span>
                  <div>
                    <p className="font-medium text-gray-900">通知設定</p>
                    <p className="text-xs text-gray-500">リマインダー</p>
                  </div>
                </Link>
                <Link
                  href="/history"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">📋</span>
                  <div>
                    <p className="font-medium text-gray-900">施術履歴</p>
                    <p className="text-xs text-gray-500">詳細確認</p>
                  </div>
                </Link>
                <Link
                  href="/reservation"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-medium text-gray-900">予約</p>
                    <p className="text-xs text-gray-500">新規予約</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ポイントタブ */}
        {activeTab === "points" && <PointsTab points={customerPoints} />}

        {/* クーポンタブ */}
        {activeTab === "coupons" && <CouponsTab coupons={coupons} />}

        {/* 紹介タブ */}
        {activeTab === "referral" && (
          <ReferralTab referral={referral} customerName={customerName} />
        )}

        {/* 未認証の場合のログイン案内 */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              📢 診察券番号でログインすると、あなたの施術データが表示されます。
            </p>
            <Link
              href="/reservation"
              className="inline-block mt-2 text-sm text-blue-600 font-medium hover:underline"
            >
              ログインする →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
