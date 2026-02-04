// ポイント・クーポン・友達紹介の型定義

// ========== ポイント ==========

/**
 * ポイント取引の種類
 */
export type PointTransactionType = "earn" | "use" | "expire";

/**
 * ポイント取引履歴
 */
export interface PointTransaction {
  id: string;
  type: PointTransactionType;
  points: number;
  description: string;
  createdAt: string;
}

/**
 * 期限付きポイント
 */
export interface ExpiringPoints {
  points: number;
  expiryDate: string;
}

/**
 * 顧客ポイント情報
 */
export interface CustomerPoints {
  customerId: string;
  currentPoints: number;
  totalEarned: number;
  totalUsed: number;
  expiringPoints: ExpiringPoints[];
  history: PointTransaction[];
}

// ========== クーポン ==========

/**
 * 割引タイプ
 */
export type DiscountType = "percent" | "fixed";

/**
 * クーポン
 */
export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number;
  expiryDate: string;
  isUsed: boolean;
  conditions?: string;
  applicableMenus?: string[];
}

// ========== 友達紹介 ==========

/**
 * 紹介ステータス
 */
export type ReferralStatus = "pending" | "completed";

/**
 * 紹介記録
 */
export interface ReferralRecord {
  id: string;
  referredCustomerId: string;
  referredCustomerName: string;
  referredAt: string;
  pointsEarned: number;
  status: ReferralStatus;
}

/**
 * 友達紹介プログラム
 */
export interface ReferralProgram {
  customerId: string;
  referralCode: string;
  referredCount: number;
  earnedPoints: number;
  referrals: ReferralRecord[];
}

// ========== デフォルト値 ==========

export const DEFAULT_CUSTOMER_POINTS: CustomerPoints = {
  customerId: "",
  currentPoints: 0,
  totalEarned: 0,
  totalUsed: 0,
  expiringPoints: [],
  history: [],
};

export const DEFAULT_REFERRAL_PROGRAM: ReferralProgram = {
  customerId: "",
  referralCode: "",
  referredCount: 0,
  earnedPoints: 0,
  referrals: [],
};

// ========== 設定値 ==========

/**
 * ポイントプログラム設定
 */
export const POINTS_CONFIG = {
  // 来店1回あたりの獲得ポイント
  pointsPerVisit: 100,
  // 1ポイントの価値（円）
  pointValue: 1,
  // ポイント有効期限（月）
  expiryMonths: 12,
  // 紹介者獲得ポイント
  referralBonus: 500,
  // 被紹介者獲得ポイント
  refereeBonus: 300,
} as const;
