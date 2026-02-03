import { TreatmentHistory } from "@/types/reservation";

// ダミー施術履歴データ
export const TREATMENT_HISTORY: TreatmentHistory[] = [
  {
    id: "hist-001",
    date: "2025-01-15",
    menu: "ヒゲ脱毛 三部位 6回コース（1回目）",
    price: 48000,
    withAnesthesia: true,
    notes: "初回施術。肌の状態良好。",
  },
  {
    id: "hist-002",
    date: "2025-02-12",
    menu: "ヒゲ脱毛 三部位 6回コース（2回目）",
    price: 0, // コース内なので追加料金なし
    withAnesthesia: true,
    notes: "順調に効果が出ている。",
  },
  {
    id: "hist-003",
    date: "2025-03-10",
    menu: "ヒゲ脱毛 三部位 6回コース（3回目）",
    price: 0,
    withAnesthesia: false,
    notes: "痛みに慣れてきたので麻酔なしで施術。",
  },
  {
    id: "hist-004",
    date: "2025-04-08",
    menu: "ヒゲ脱毛 三部位 6回コース（4回目）",
    price: 0,
    withAnesthesia: false,
    notes: "ヒゲが目に見えて薄くなってきた。",
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
