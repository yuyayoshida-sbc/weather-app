// ダッシュボードデータ計算ロジック

import {
  CourseProgress,
  CalendarEvent,
  RecommendedBooking,
  DashboardSummary,
  CalendarMonth,
  CalendarDay,
} from "@/types/dashboard";
import { TreatmentHistory } from "@/types/reservation";
import { CourseContract } from "./history";
import { getCourseReminderIntervalDays } from "@/utils/notificationSettings";

/**
 * コース進捗を計算
 */
export function calculateCourseProgress(contracts: CourseContract[]): CourseProgress[] {
  const today = new Date();

  return contracts.map((contract) => {
    const expiryDate = new Date(contract.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const progressPercentage = Math.round(
      (contract.usedSessions / contract.totalSessions) * 100
    );

    return {
      courseId: contract.id,
      courseName: contract.courseName,
      totalSessions: contract.totalSessions,
      usedSessions: contract.usedSessions,
      remainingSessions: contract.remainingSessions,
      progressPercentage,
      expiryDate: contract.expiryDate,
      daysUntilExpiry,
      isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
    };
  });
}

/**
 * 施術履歴からカレンダーイベントを生成
 */
export function generateCalendarEvents(history: TreatmentHistory[]): CalendarEvent[] {
  return history.map((h) => ({
    date: h.date,
    historyId: h.id,
    menu: h.menu,
    clinicName: h.clinicName || "不明",
    rating: h.feedback?.satisfactionRating,
  }));
}

/**
 * 次回推奨予約日を計算
 */
export function calculateRecommendedBooking(
  history: TreatmentHistory[],
  contracts: CourseContract[]
): RecommendedBooking | null {
  if (history.length === 0) {
    return null;
  }

  // 最終施術日を取得
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastTreatment = sortedHistory[0];
  const lastDate = new Date(lastTreatment.date);

  // 通知設定から間隔を取得
  const intervalDays = getCourseReminderIntervalDays();

  // 推奨日を計算（最終施術日 + 推奨間隔）
  // ただし、脱毛の場合は4週間が一般的な最短間隔
  const minIntervalDays = 28; // 4週間
  const actualInterval = Math.max(minIntervalDays, intervalDays);

  const recommendedDate = new Date(lastDate);
  recommendedDate.setDate(recommendedDate.getDate() + actualInterval);

  // 今日より前の場合は今日以降の日付に調整
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (recommendedDate < today) {
    recommendedDate.setTime(today.getTime());
  }

  const daysSinceLastTreatment = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 未消化コースがある場合はその情報も含める
  const unusedContracts = contracts.filter((c) => c.remainingSessions > 0);
  const relatedCourse = unusedContracts.length > 0 ? unusedContracts[0] : null;

  // 推奨理由を生成
  let reason = "";
  if (daysSinceLastTreatment >= intervalDays) {
    reason = `前回の施術から${daysSinceLastTreatment}日が経過しています。`;
  } else {
    const daysUntilRecommended = actualInterval - daysSinceLastTreatment;
    reason = `次回施術の推奨時期まであと${daysUntilRecommended}日です。`;
  }

  if (relatedCourse) {
    reason += `\n${relatedCourse.courseName}の残り${relatedCourse.remainingSessions}回をご利用いただけます。`;
  }

  return {
    recommendedDate: recommendedDate.toISOString().split("T")[0],
    reason,
    daysSinceLastTreatment,
    courseId: relatedCourse?.id,
    courseName: relatedCourse?.courseName,
  };
}

/**
 * ダッシュボードサマリーを計算
 */
export function calculateDashboardSummary(
  history: TreatmentHistory[],
  contracts: CourseContract[]
): DashboardSummary {
  const totalTreatments = history.length;
  const totalSpent = history.reduce((sum, h) => sum + (h.price || 0), 0);

  // 平均評価を計算
  const ratings = history
    .filter((h) => h.feedback?.satisfactionRating)
    .map((h) => h.feedback!.satisfactionRating);
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

  // 最終施術日
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastTreatmentDate = sortedHistory.length > 0 ? sortedHistory[0].date : null;

  // アクティブコース数
  const activeCourses = contracts.filter((c) => c.remainingSessions > 0).length;
  const completedCourses = contracts.filter((c) => c.remainingSessions === 0).length;

  return {
    totalTreatments,
    totalSpent,
    averageRating,
    lastTreatmentDate,
    activeCourses,
    completedCourses,
  };
}

/**
 * カレンダー月データを生成
 */
export function generateCalendarMonth(
  year: number,
  month: number,
  events: CalendarEvent[]
): CalendarMonth {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // 週の開始日（日曜）から始める
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // 週の終了日（土曜）まで
  const endDate = new Date(lastDay);
  const daysToAdd = 6 - endDate.getDay();
  endDate.setDate(endDate.getDate() + daysToAdd);

  const days: CalendarDay[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayEvents = events.filter((e) => e.date === dateStr);

    days.push({
      date: dateStr,
      dayOfMonth: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month - 1,
      isToday: dateStr === todayStr,
      events: dayEvents,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    year,
    month,
    days,
  };
}

/**
 * 月名を取得
 */
export function getMonthName(month: number): string {
  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月",
  ];
  return monthNames[month - 1] || "";
}
