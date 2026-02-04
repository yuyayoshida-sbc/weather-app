// ダッシュボード関連の型定義

// コース進捗表示用
export interface CourseProgress {
  courseId: string;
  courseName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  progressPercentage: number; // 0-100
  expiryDate: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean; // 30日以内に期限切れ
}

// カレンダー表示用施術イベント
export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  historyId: string;
  menu: string;
  clinicName: string;
  rating?: number;
}

// 次回推奨予約日
export interface RecommendedBooking {
  recommendedDate: string; // YYYY-MM-DD
  reason: string;
  daysSinceLastTreatment: number;
  courseId?: string;
  courseName?: string;
}

// ダッシュボード集計データ
export interface DashboardSummary {
  totalTreatments: number;
  totalSpent: number;
  averageRating: number | null;
  lastTreatmentDate: string | null;
  activeCourses: number;
  completedCourses: number;
}

// カレンダー月情報
export interface CalendarMonth {
  year: number;
  month: number; // 1-12
  days: CalendarDay[];
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
