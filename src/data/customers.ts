import { Customer } from "@/types/customer";
import { TreatmentHistory, TreatmentFeedback } from "@/types/reservation";
import { CourseContract, TREATMENT_HISTORY } from "./history";

// ダミー顧客データ（5件）
export const CUSTOMERS: Customer[] = [
  {
    id: "cust-001",
    patientNumber: "SBC-123456",
    name: "SBC太郎",
    nameKana: "エスビーシータロウ",
    gender: "male",
    birthDate: "1990-05-15",
    age: 34,
    address: {
      postalCode: "160-0023",
      prefecture: "東京都",
      city: "新宿区",
      street: "西新宿1-1-1",
      building: "新宿ビル5F",
      homeStation: "池袋",
      workStation: "品川",
    },
    phone: "090-1111-1111",
    email: "taro@example.com",
    firstVisit: { date: "2024-10-15", clinicId: "clinic-shinjuku" },
    lastVisit: { date: "2025-01-14", clinicId: "clinic-ikebukuro" },
    contractIds: ["course-001"],
    historyIds: ["hist-001", "hist-002", "hist-003", "hist-004"],
    createdAt: "2024-10-15T00:00:00Z",
    updatedAt: "2025-01-14T00:00:00Z",
  },
  {
    id: "cust-002",
    patientNumber: "SBC-234567",
    name: "山田一郎",
    nameKana: "ヤマダイチロウ",
    gender: "male",
    birthDate: "1996-08-22",
    age: 28,
    address: {
      postalCode: "150-0002",
      prefecture: "東京都",
      city: "渋谷区",
      street: "渋谷2-3-4",
      homeStation: "渋谷",
      workStation: "新宿",
    },
    phone: "090-2222-2222",
    email: "yamada@example.com",
    firstVisit: { date: "2024-09-01", clinicId: "clinic-shibuya" },
    lastVisit: { date: "2025-01-20", clinicId: "clinic-shibuya" },
    contractIds: ["course-002"],
    historyIds: ["hist-005", "hist-006"],
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
  },
  {
    id: "cust-003",
    patientNumber: "SBC-345678",
    name: "鈴木健太",
    nameKana: "スズキケンタ",
    gender: "male",
    birthDate: "1982-03-10",
    age: 42,
    address: {
      postalCode: "171-0022",
      prefecture: "東京都",
      city: "豊島区",
      street: "南池袋1-2-3",
      homeStation: "池袋",
    },
    phone: "090-3333-3333",
    email: "suzuki@example.com",
    firstVisit: { date: "2024-11-20", clinicId: "clinic-ikebukuro" },
    lastVisit: { date: "2025-01-05", clinicId: "clinic-ikebukuro" },
    contractIds: [],  // 都度払い
    historyIds: ["hist-007", "hist-008"],
    createdAt: "2024-11-20T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z",
  },
  {
    id: "cust-004",
    patientNumber: "SBC-456789",
    name: "田中誠",
    nameKana: "タナカマコト",
    gender: "male",
    birthDate: "1993-12-01",
    age: 31,
    address: {
      postalCode: "104-0061",
      prefecture: "東京都",
      city: "中央区",
      street: "銀座3-4-5",
      building: "銀座タワー10F",
      homeStation: "銀座",
      workStation: "東京",
    },
    phone: "090-4444-4444",
    email: "tanaka@example.com",
    firstVisit: { date: "2024-06-15", clinicId: "clinic-shinjuku" },
    lastVisit: { date: "2024-12-10", clinicId: "clinic-shinjuku" },
    contractIds: ["course-003"],  // 完了済み
    historyIds: ["hist-009", "hist-010", "hist-011"],
    createdAt: "2024-06-15T00:00:00Z",
    updatedAt: "2024-12-10T00:00:00Z",
  },
  {
    id: "cust-005",
    patientNumber: "SBC-567890",
    name: "佐藤大輔",
    nameKana: "サトウダイスケ",
    gender: "male",
    birthDate: "1999-07-25",
    age: 25,
    address: {
      postalCode: "141-0021",
      prefecture: "東京都",
      city: "品川区",
      street: "上大崎2-5-6",
      homeStation: "目黒",
      workStation: "渋谷",
    },
    phone: "090-5555-5555",
    email: "sato@example.com",
    firstVisit: { date: "2025-01-25", clinicId: "clinic-shibuya" },
    lastVisit: { date: "2025-01-25", clinicId: "clinic-shibuya" },
    contractIds: ["course-004"],  // 新規契約
    historyIds: [],  // まだ施術なし
    createdAt: "2025-01-25T00:00:00Z",
    updatedAt: "2025-01-25T00:00:00Z",
  },
];

// 追加のコース契約データ
export const CUSTOMER_CONTRACTS: CourseContract[] = [
  {
    id: "course-001",
    courseName: "ヒゲ脱毛 三部位 6回コース",
    totalSessions: 6,
    usedSessions: 4,
    remainingSessions: 2,
    startDate: "2024-10-15",
    expiryDate: "2025-10-14",
    lastTreatmentDate: "2024-10-20",
  },
  {
    id: "course-002",
    courseName: "ヒゲ脱毛 全部位 6回コース",
    totalSessions: 6,
    usedSessions: 2,
    remainingSessions: 4,
    startDate: "2024-09-01",
    expiryDate: "2025-08-31",
    lastTreatmentDate: "2025-01-20",
  },
  {
    id: "course-003",
    courseName: "ヒゲ脱毛 三部位 3回コース",
    totalSessions: 3,
    usedSessions: 3,
    remainingSessions: 0,  // 完了
    startDate: "2024-06-15",
    expiryDate: "2025-06-14",
    lastTreatmentDate: "2024-12-10",
  },
  {
    id: "course-004",
    courseName: "ヒゲ脱毛 三部位 6回コース",
    totalSessions: 6,
    usedSessions: 0,
    remainingSessions: 6,  // 新規
    startDate: "2025-01-25",
    expiryDate: "2026-01-24",
  },
];

// 追加の施術履歴データ
export const CUSTOMER_HISTORY: TreatmentHistory[] = [
  // SBC太郎 (cust-001) の履歴 - 既存のhistory.tsと重複するのでスキップ

  // 山田一郎 (cust-002) の履歴
  {
    id: "hist-005",
    date: "2024-09-01",
    menu: "ヒゲ脱毛 全部位 6回コース（1回目）",
    price: 96000,
    withAnesthesia: true,
    notes: "初回カウンセリング後に施術。",
    clinicName: "渋谷院",
    laserType: "アレキサンドライト",
    nurseName: "佐藤 花子",
    feedback: {
      satisfactionRating: 4,
      hasLeakage: false,
      comment: "スタッフの説明が丁寧でした。",
      createdAt: "2024-09-02T10:00:00Z",
    },
  },
  {
    id: "hist-006",
    date: "2025-01-20",
    menu: "ヒゲ脱毛 全部位 6回コース（2回目）",
    price: 0,
    withAnesthesia: true,
    notes: "効果を実感している。",
    clinicName: "渋谷院",
    laserType: "アレキサンドライト",
    nurseName: "佐藤 花子",
  },

  // 鈴木健太 (cust-003) の履歴 - 都度払い
  {
    id: "hist-007",
    date: "2024-11-20",
    menu: "ヒゲ脱毛 三部位 1回",
    price: 9800,
    withAnesthesia: false,
    notes: "初回お試し。",
    clinicName: "池袋院",
    laserType: "ダイオード",
    nurseName: "鈴木 真理",
    feedback: {
      satisfactionRating: 5,
      hasLeakage: false,
      comment: "思ったより痛くなかった。",
      createdAt: "2024-11-21T15:00:00Z",
    },
  },
  {
    id: "hist-008",
    date: "2025-01-05",
    menu: "ヒゲ脱毛 三部位 1回",
    price: 9800,
    withAnesthesia: false,
    notes: "2回目。ヒゲが薄くなってきた。",
    clinicName: "池袋院",
    laserType: "ダイオード",
    nurseName: "鈴木 真理",
    feedback: {
      satisfactionRating: 4,
      hasLeakage: false,
      comment: "効果が出てきて嬉しい。",
      createdAt: "2025-01-06T12:00:00Z",
    },
  },

  // 田中誠 (cust-004) の履歴 - コース完了済み
  {
    id: "hist-009",
    date: "2024-06-15",
    menu: "ヒゲ脱毛 三部位 3回コース（1回目）",
    price: 26400,
    withAnesthesia: true,
    notes: "初回施術。",
    clinicName: "新宿院",
    laserType: "YAG",
    nurseName: "田中 美咲",
    feedback: {
      satisfactionRating: 4,
      hasLeakage: false,
      comment: "麻酔があって楽でした。",
      createdAt: "2024-06-16T10:00:00Z",
    },
  },
  {
    id: "hist-010",
    date: "2024-09-10",
    menu: "ヒゲ脱毛 三部位 3回コース（2回目）",
    price: 0,
    withAnesthesia: true,
    notes: "順調に効果が出ている。",
    clinicName: "新宿院",
    laserType: "YAG",
    nurseName: "田中 美咲",
    feedback: {
      satisfactionRating: 5,
      hasLeakage: false,
      comment: "明らかに減ってきた！",
      createdAt: "2024-09-11T14:00:00Z",
    },
  },
  {
    id: "hist-011",
    date: "2024-12-10",
    menu: "ヒゲ脱毛 三部位 3回コース（3回目）",
    price: 0,
    withAnesthesia: false,
    notes: "最終回。満足の結果。",
    clinicName: "新宿院",
    laserType: "YAG",
    nurseName: "田中 美咲",
    feedback: {
      satisfactionRating: 5,
      hasLeakage: false,
      comment: "とても満足しています。ありがとうございました！",
      createdAt: "2024-12-11T09:00:00Z",
    },
  },
];

// ========== 検索・取得関数 ==========

/**
 * 診察券番号で顧客を検索
 */
export function findCustomerByPatientNumber(patientNumber: string): Customer | null {
  const normalized = patientNumber.toUpperCase().trim();
  return CUSTOMERS.find((c) => c.patientNumber === normalized) || null;
}

/**
 * 顧客IDで検索
 */
export function findCustomerById(customerId: string): Customer | null {
  return CUSTOMERS.find((c) => c.id === customerId) || null;
}

/**
 * 顧客の施術履歴を取得
 * 両方のデータソース（CUSTOMER_HISTORY と TREATMENT_HISTORY）から履歴を統合
 */
export function getCustomerHistory(customerId: string): TreatmentHistory[] {
  const customer = findCustomerById(customerId);
  if (!customer) return [];

  // 両方のデータソースから履歴を取得
  const fromCustomerHistory = CUSTOMER_HISTORY.filter((h) => customer.historyIds.includes(h.id));
  const fromTreatmentHistory = TREATMENT_HISTORY.filter((h) => customer.historyIds.includes(h.id));

  // 重複を除去して結合
  const allHistory = [...fromCustomerHistory];
  for (const h of fromTreatmentHistory) {
    if (!allHistory.find(existing => existing.id === h.id)) {
      allHistory.push(h);
    }
  }

  // 日付順にソート（新しい順）
  return allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 顧客のコース契約を取得
 */
export function getCustomerContracts(customerId: string): CourseContract[] {
  const customer = findCustomerById(customerId);
  if (!customer) return [];

  return CUSTOMER_CONTRACTS.filter((c) => customer.contractIds.includes(c.id));
}

/**
 * 顧客の未消化コースを取得
 */
export function getCustomerUnusedCourses(customerId: string): CourseContract[] {
  const contracts = getCustomerContracts(customerId);
  return contracts.filter((c) => c.remainingSessions > 0);
}

/**
 * 顧客検索（名前、電話番号、診察券番号）
 */
export function searchCustomers(query: string): Customer[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return CUSTOMERS;

  return CUSTOMERS.filter((c) => {
    return (
      c.name.toLowerCase().includes(normalized) ||
      (c.nameKana && c.nameKana.toLowerCase().includes(normalized)) ||
      c.phone.includes(normalized) ||
      c.patientNumber.toLowerCase().includes(normalized) ||
      c.email.toLowerCase().includes(normalized)
    );
  });
}

/**
 * 全顧客を取得
 */
export function getAllCustomers(): Customer[] {
  return CUSTOMERS;
}

/**
 * クリニックIDからクリニック名を取得
 */
export function getClinicNameById(clinicId: string): string {
  const clinicNames: Record<string, string> = {
    "clinic-shinjuku": "新宿院",
    "clinic-shibuya": "渋谷院",
    "clinic-ikebukuro": "池袋院",
  };
  return clinicNames[clinicId] || clinicId;
}
