import { TreatmentHistory, TreatmentFeedback } from "@/types/reservation";

// コース契約情報（未消化分の管理）
export interface CourseContract {
  id: string;
  courseName: string;        // コース名
  totalSessions: number;     // 総回数
  usedSessions: number;      // 使用済み回数
  remainingSessions: number; // 残り回数
  startDate: string;         // 契約開始日
  expiryDate: string;        // 有効期限
  lastTreatmentDate?: string; // 最後の施術日（リマインダー用）
}

// ダミーコース契約データ
export const COURSE_CONTRACTS: CourseContract[] = [
  {
    id: "course-001",
    courseName: "ヒゲ脱毛 三部位 6回コース",
    totalSessions: 6,
    usedSessions: 4,
    remainingSessions: 2,
    startDate: "2024-10-15",
    expiryDate: "2025-10-14",
    lastTreatmentDate: "2024-10-20", // 3ヶ月以上前（リマインダーテスト用）
  },
];

// 未消化コースを取得
export function getUnusedCourses(): CourseContract[] {
  return COURSE_CONTRACTS.filter(course => course.remainingSessions > 0);
}

// ダミー施術履歴データ
export let TREATMENT_HISTORY: TreatmentHistory[] = [
  {
    id: "hist-001",
    date: "2024-10-20",
    menu: "ヒゲ脱毛 三部位 6回コース（1回目）",
    price: 48000,
    withAnesthesia: true,
    notes: "初回施術。肌の状態良好。",
    clinicName: "新宿院",
    laserType: "YAG",
    nurseName: "田中 美咲",
    feedback: {
      satisfactionRating: 5,
      hasLeakage: false,
      comment: "丁寧な施術でした。痛みも思ったより少なかったです。",
      createdAt: "2024-10-21T10:00:00Z",
    },
  },
  {
    id: "hist-002",
    date: "2024-11-18",
    menu: "ヒゲ脱毛 三部位 6回コース（2回目）",
    price: 0,
    withAnesthesia: true,
    notes: "順調に効果が出ている。",
    clinicName: "渋谷院",
    laserType: "アレキサンドライト",
    nurseName: "佐藤 花子",
    feedback: {
      satisfactionRating: 4,
      hasLeakage: false,
      comment: "効果を実感し始めました。",
      createdAt: "2024-11-19T14:00:00Z",
    },
  },
  {
    id: "hist-003",
    date: "2024-12-16",
    menu: "ヒゲ脱毛 三部位 6回コース（3回目）",
    price: 0,
    withAnesthesia: false,
    notes: "痛みに慣れてきたので麻酔なしで施術。",
    clinicName: "新宿院",
    laserType: "YAG",
    nurseName: "田中 美咲",
    feedback: {
      satisfactionRating: 3,
      hasLeakage: true,
      leakageDetails: "左頬の一部に照射漏れがありました",
      comment: "次回確認をお願いしたいです。",
      createdAt: "2024-12-18T09:00:00Z",
    },
  },
  {
    id: "hist-004",
    date: "2025-01-14",
    menu: "ヒゲ脱毛 三部位 6回コース（4回目）",
    price: 0,
    withAnesthesia: false,
    notes: "ヒゲが目に見えて薄くなってきた。前回の照射漏れ部分も確認済み。",
    clinicName: "池袋院",
    laserType: "ダイオード",
    nurseName: "鈴木 真理",
    // フィードバック未入力
  },
];

// 最終施術日を取得
export function getLastTreatmentDate(): Date | null {
  if (TREATMENT_HISTORY.length === 0) return null;

  const sorted = [...TREATMENT_HISTORY].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return new Date(sorted[0].date);
}

// 施術間隔をチェック（推奨: 4週間以上）
export function checkTreatmentInterval(): { isWarning: boolean; daysSinceLast: number | null } {
  const lastDate = getLastTreatmentDate();
  if (!lastDate) return { isWarning: false, daysSinceLast: null };

  const today = new Date();
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 4週間（28日）未満の場合は警告
  return {
    isWarning: diffDays < 28,
    daysSinceLast: diffDays,
  };
}

// 施術回数を取得
export function getTreatmentCount(): number {
  return TREATMENT_HISTORY.length;
}

// 施術履歴の備考を更新
export function updateTreatmentNotes(historyId: string, notes: string): boolean {
  const index = TREATMENT_HISTORY.findIndex(h => h.id === historyId);
  if (index === -1) return false;

  TREATMENT_HISTORY[index] = {
    ...TREATMENT_HISTORY[index],
    notes,
  };
  return true;
}

// 施術履歴のフィードバックを更新
export function updateTreatmentFeedback(historyId: string, feedback: TreatmentFeedback): boolean {
  const index = TREATMENT_HISTORY.findIndex(h => h.id === historyId);
  if (index === -1) return false;

  TREATMENT_HISTORY[index] = {
    ...TREATMENT_HISTORY[index],
    feedback,
  };
  return true;
}

// リマインダーメッセージ型
export interface ReminderMessage {
  type: 'course_reminder';
  courseId: string;
  courseName: string;
  message: string;
  quickReplies: string[];
}

// コース消化リマインダーをチェック（3ヶ月経過）
const REMINDER_THRESHOLD_DAYS = 90; // 3ヶ月

export function checkCourseReminders(): ReminderMessage | null {
  const unusedCourses = getUnusedCourses();
  const today = new Date();

  for (const course of unusedCourses) {
    if (!course.lastTreatmentDate) continue;

    const lastTreatment = new Date(course.lastTreatmentDate);
    const diffTime = today.getTime() - lastTreatment.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= REMINDER_THRESHOLD_DAYS) {
      const months = Math.floor(diffDays / 30);
      return {
        type: 'course_reminder',
        courseId: course.id,
        courseName: course.courseName,
        message: `🔔 前回の${course.courseName}の施術から約${months}ヶ月が経過しました。\n\n残り${course.remainingSessions}回の施術がございます。\n次回のご予約はいかがでしょうか？`,
        quickReplies: ["予約する", "後で検討する"],
      };
    }
  }
  return null;
}

// ダウンタイム注意事項
export const DOWNTIME_CARE = {
  title: "施術後のダウンタイムについて",
  period: "施術後1週間程度",
  cautions: [
    {
      icon: "🚫",
      title: "激しい運動",
      description: "施術当日は激しい運動をお控えください。翌日からは軽い運動であれば問題ありません。",
    },
    {
      icon: "🍺",
      title: "飲酒",
      description: "施術当日のアルコール摂取はお控えください。血行が良くなり、赤みや腫れが出やすくなります。",
    },
    {
      icon: "🛁",
      title: "長時間の入浴",
      description: "施術当日は長時間の入浴やサウナはお控えください。シャワーは問題ありません。",
    },
    {
      icon: "☀️",
      title: "日焼け",
      description: "施術後1週間は特に日焼けにご注意ください。外出時は日焼け止めの使用をおすすめします。",
    },
    {
      icon: "💧",
      title: "保湿ケア",
      description: "施術後は肌が乾燥しやすくなります。化粧水や乳液でしっかり保湿してください。",
    },
    {
      icon: "🪒",
      title: "髭剃り",
      description: "施術当日の髭剃りはお控えください。翌日以降、肌に違和感がなければ通常通り髭剃りできます。",
    },
  ],
  symptoms: [
    {
      symptom: "赤み・ほてり",
      duration: "数時間〜1日程度",
      advice: "冷たいタオルで冷やすと和らぎます",
    },
    {
      symptom: "軽い腫れ",
      duration: "1〜2日程度",
      advice: "自然に引きますのでご安心ください",
    },
    {
      symptom: "毛穴の黒ずみ",
      duration: "1〜2週間程度",
      advice: "毛が抜け落ちる過程で発生します。無理に引き抜かないでください",
    },
  ],
  emergencyContact: "症状が長引く場合や、強い痛みがある場合はすぐにご連絡ください。",
};
