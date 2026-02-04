// ポイント・クーポン・友達紹介のダミーデータ

import {
  CustomerPoints,
  Coupon,
  ReferralProgram,
  POINTS_CONFIG,
} from "@/types/points";

// ========== 顧客ポイントデータ ==========

export const CUSTOMER_POINTS: CustomerPoints[] = [
  {
    customerId: "cust-001", // SBC太郎
    currentPoints: 450,
    totalEarned: 500,
    totalUsed: 50,
    expiringPoints: [
      { points: 100, expiryDate: "2025-03-31" },
      { points: 150, expiryDate: "2025-06-30" },
    ],
    history: [
      {
        id: "pt-001",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/10/15）",
        createdAt: "2024-10-15T10:00:00Z",
      },
      {
        id: "pt-002",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/11/10）",
        createdAt: "2024-11-10T14:00:00Z",
      },
      {
        id: "pt-003",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/12/08）",
        createdAt: "2024-12-08T11:00:00Z",
      },
      {
        id: "pt-004",
        type: "use",
        points: 50,
        description: "麻酔クリーム半額割引",
        createdAt: "2024-12-08T11:30:00Z",
      },
      {
        id: "pt-005",
        type: "earn",
        points: 100,
        description: "来店ポイント（2025/01/14）",
        createdAt: "2025-01-14T15:00:00Z",
      },
      {
        id: "pt-006",
        type: "earn",
        points: 100,
        description: "口コミ投稿ボーナス",
        createdAt: "2025-01-20T09:00:00Z",
      },
    ],
  },
  {
    customerId: "cust-002", // 山田一郎
    currentPoints: 300,
    totalEarned: 300,
    totalUsed: 0,
    expiringPoints: [{ points: 100, expiryDate: "2025-09-30" }],
    history: [
      {
        id: "pt-007",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/09/01）",
        createdAt: "2024-09-01T10:00:00Z",
      },
      {
        id: "pt-008",
        type: "earn",
        points: 100,
        description: "来店ポイント（2025/01/20）",
        createdAt: "2025-01-20T14:00:00Z",
      },
      {
        id: "pt-009",
        type: "earn",
        points: 100,
        description: "友達紹介ボーナス",
        createdAt: "2025-01-25T10:00:00Z",
      },
    ],
  },
  {
    customerId: "cust-003", // 鈴木健太
    currentPoints: 200,
    totalEarned: 200,
    totalUsed: 0,
    expiringPoints: [],
    history: [
      {
        id: "pt-010",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/11/20）",
        createdAt: "2024-11-20T13:00:00Z",
      },
      {
        id: "pt-011",
        type: "earn",
        points: 100,
        description: "来店ポイント（2025/01/05）",
        createdAt: "2025-01-05T16:00:00Z",
      },
    ],
  },
  {
    customerId: "cust-004", // 田中誠
    currentPoints: 350,
    totalEarned: 400,
    totalUsed: 50,
    expiringPoints: [{ points: 100, expiryDate: "2025-06-30" }],
    history: [
      {
        id: "pt-012",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/06/15）",
        createdAt: "2024-06-15T11:00:00Z",
      },
      {
        id: "pt-013",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/09/10）",
        createdAt: "2024-09-10T14:00:00Z",
      },
      {
        id: "pt-014",
        type: "earn",
        points: 100,
        description: "来店ポイント（2024/12/10）",
        createdAt: "2024-12-10T10:00:00Z",
      },
      {
        id: "pt-015",
        type: "use",
        points: 50,
        description: "ドリンクサービス",
        createdAt: "2024-12-10T10:30:00Z",
      },
      {
        id: "pt-016",
        type: "earn",
        points: 100,
        description: "コース完了ボーナス",
        createdAt: "2024-12-10T11:00:00Z",
      },
    ],
  },
  {
    customerId: "cust-005", // 佐藤大輔
    currentPoints: 300,
    totalEarned: 300,
    totalUsed: 0,
    expiringPoints: [],
    history: [
      {
        id: "pt-017",
        type: "earn",
        points: 300,
        description: "新規契約ボーナス",
        createdAt: "2025-01-25T12:00:00Z",
      },
    ],
  },
];

// ========== クーポンデータ ==========

export const COUPONS: Coupon[] = [
  {
    id: "coupon-001",
    code: "WELCOME10",
    name: "初回10%OFFクーポン",
    description: "初めてのご来院で全メニュー10%OFF",
    discountType: "percent",
    discountValue: 10,
    expiryDate: "2025-12-31",
    isUsed: false,
    conditions: "初回来院の方限定。他クーポンとの併用不可。",
  },
  {
    id: "coupon-002",
    code: "ANESTHESIA",
    name: "麻酔クリーム無料クーポン",
    description: "麻酔クリーム（通常¥3,000）が無料",
    discountType: "fixed",
    discountValue: 3000,
    expiryDate: "2025-06-30",
    isUsed: false,
    conditions: "1回の施術につき1回のみ使用可能。",
    applicableMenus: ["麻酔クリーム"],
  },
  {
    id: "coupon-003",
    code: "SUMMER1000",
    name: "1,000円OFFクーポン",
    description: "ご利用金額から1,000円OFF",
    discountType: "fixed",
    discountValue: 1000,
    minPurchase: 5000,
    expiryDate: "2025-08-31",
    isUsed: false,
    conditions: "5,000円以上のご利用で適用。",
  },
  {
    id: "coupon-004",
    code: "FRIEND500",
    name: "友達紹介クーポン",
    description: "友達紹介で500円OFF",
    discountType: "fixed",
    discountValue: 500,
    expiryDate: "2025-12-31",
    isUsed: false,
    conditions: "紹介された方限定。初回来院時のみ使用可能。",
  },
  {
    id: "coupon-005",
    code: "BIRTHDAY",
    name: "お誕生日20%OFFクーポン",
    description: "お誕生月にご来院で全メニュー20%OFF",
    discountType: "percent",
    discountValue: 20,
    expiryDate: "2025-12-31",
    isUsed: false,
    conditions: "お誕生月のみ有効。他クーポンとの併用不可。",
  },
];

// 顧客ごとのクーポン（保有クーポンをマッピング）
export const CUSTOMER_COUPONS: Record<string, string[]> = {
  "cust-001": ["coupon-002", "coupon-003"], // SBC太郎
  "cust-002": ["coupon-001", "coupon-003"], // 山田一郎
  "cust-003": ["coupon-003", "coupon-005"], // 鈴木健太
  "cust-004": ["coupon-002"], // 田中誠
  "cust-005": ["coupon-001", "coupon-004"], // 佐藤大輔
};

// ========== 友達紹介データ ==========

export const REFERRAL_PROGRAMS: ReferralProgram[] = [
  {
    customerId: "cust-001", // SBC太郎
    referralCode: "SBC-TARO-2024",
    referredCount: 2,
    earnedPoints: 1000,
    referrals: [
      {
        id: "ref-001",
        referredCustomerId: "cust-003",
        referredCustomerName: "鈴木 健太",
        referredAt: "2024-11-15T10:00:00Z",
        pointsEarned: 500,
        status: "completed",
      },
      {
        id: "ref-002",
        referredCustomerId: "cust-005",
        referredCustomerName: "佐藤 大輔",
        referredAt: "2025-01-20T14:00:00Z",
        pointsEarned: 500,
        status: "completed",
      },
    ],
  },
  {
    customerId: "cust-002", // 山田一郎
    referralCode: "YMD-ICHIRO-2024",
    referredCount: 1,
    earnedPoints: 500,
    referrals: [
      {
        id: "ref-003",
        referredCustomerId: "guest-001",
        referredCustomerName: "高橋 翔太",
        referredAt: "2025-01-25T11:00:00Z",
        pointsEarned: 500,
        status: "pending", // まだ来店していない
      },
    ],
  },
  {
    customerId: "cust-003", // 鈴木健太
    referralCode: "SZK-KENTA-2024",
    referredCount: 0,
    earnedPoints: 0,
    referrals: [],
  },
  {
    customerId: "cust-004", // 田中誠
    referralCode: "TNK-MAKOTO-2024",
    referredCount: 0,
    earnedPoints: 0,
    referrals: [],
  },
  {
    customerId: "cust-005", // 佐藤大輔
    referralCode: "STO-DAISUKE-2025",
    referredCount: 0,
    earnedPoints: 0,
    referrals: [],
  },
];

// ========== 取得関数 ==========

/**
 * 顧客IDでポイント情報を取得
 */
export function getCustomerPoints(customerId: string): CustomerPoints | null {
  return CUSTOMER_POINTS.find((p) => p.customerId === customerId) || null;
}

/**
 * 顧客IDでクーポン一覧を取得
 */
export function getCustomerCoupons(customerId: string): Coupon[] {
  const couponIds = CUSTOMER_COUPONS[customerId] || [];
  return COUPONS.filter((c) => couponIds.includes(c.id) && !c.isUsed);
}

/**
 * 全クーポンを取得（管理用）
 */
export function getAllCoupons(): Coupon[] {
  return COUPONS;
}

/**
 * 顧客IDで友達紹介情報を取得
 */
export function getCustomerReferral(customerId: string): ReferralProgram | null {
  return REFERRAL_PROGRAMS.find((r) => r.customerId === customerId) || null;
}

/**
 * 紹介コードで紹介プログラムを検索
 */
export function findReferralByCode(code: string): ReferralProgram | null {
  return (
    REFERRAL_PROGRAMS.find(
      (r) => r.referralCode.toLowerCase() === code.toLowerCase()
    ) || null
  );
}

/**
 * ポイントの有効期限が近いものを取得（30日以内）
 */
export function getExpiringPointsWarning(
  customerId: string
): { points: number; expiryDate: string } | null {
  const customerPoints = getCustomerPoints(customerId);
  if (!customerPoints) return null;

  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const expiring = customerPoints.expiringPoints.find((ep) => {
    const expiryDate = new Date(ep.expiryDate);
    return expiryDate <= thirtyDaysLater;
  });

  return expiring || null;
}
