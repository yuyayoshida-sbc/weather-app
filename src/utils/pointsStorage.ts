// ポイント・クーポン・紹介のストレージユーティリティ

import {
  CustomerPoints,
  Coupon,
  ReferralProgram,
  POINTS_CONFIG,
  DEFAULT_CUSTOMER_POINTS,
  DEFAULT_REFERRAL_PROGRAM,
} from "@/types/points";
import {
  getCustomerPoints as getPointsData,
  getCustomerCoupons as getCouponsData,
  getCustomerReferral as getReferralData,
  getExpiringPointsWarning as getExpiringWarning,
} from "@/data/points";

// ストレージキー
const STORAGE_KEYS = {
  POINTS: "clinic_customer_points",
  COUPONS: "clinic_customer_coupons",
  REFERRAL: "clinic_customer_referral",
} as const;

// ========== ポイント関連 ==========

/**
 * 顧客のポイント情報を取得
 */
export function loadCustomerPoints(customerId: string): CustomerPoints {
  // まずダミーデータから取得
  const dummyData = getPointsData(customerId);
  if (dummyData) return dummyData;

  // ダミーデータがなければlocalStorageを確認
  if (typeof window === "undefined") {
    return { ...DEFAULT_CUSTOMER_POINTS, customerId };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.POINTS);
    if (stored) {
      const allPoints: Record<string, CustomerPoints> = JSON.parse(stored);
      if (allPoints[customerId]) {
        return allPoints[customerId];
      }
    }
  } catch (error) {
    console.error("Failed to load customer points:", error);
  }

  return { ...DEFAULT_CUSTOMER_POINTS, customerId };
}

/**
 * ポイント情報を保存（localStorageに）
 */
export function saveCustomerPoints(points: CustomerPoints): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.POINTS);
    const allPoints: Record<string, CustomerPoints> = stored
      ? JSON.parse(stored)
      : {};
    allPoints[points.customerId] = points;
    localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(allPoints));
  } catch (error) {
    console.error("Failed to save customer points:", error);
  }
}

/**
 * ポイントを使用
 */
export function usePoints(
  customerId: string,
  points: number,
  description: string
): boolean {
  const customerPoints = loadCustomerPoints(customerId);
  if (customerPoints.currentPoints < points) {
    return false; // ポイント不足
  }

  customerPoints.currentPoints -= points;
  customerPoints.totalUsed += points;
  customerPoints.history.unshift({
    id: `pt-${Date.now()}`,
    type: "use",
    points,
    description,
    createdAt: new Date().toISOString(),
  });

  saveCustomerPoints(customerPoints);
  return true;
}

/**
 * ポイントを獲得
 */
export function earnPoints(
  customerId: string,
  points: number,
  description: string
): void {
  const customerPoints = loadCustomerPoints(customerId);
  customerPoints.currentPoints += points;
  customerPoints.totalEarned += points;
  customerPoints.history.unshift({
    id: `pt-${Date.now()}`,
    type: "earn",
    points,
    description,
    createdAt: new Date().toISOString(),
  });

  // 有効期限付きポイントを追加（12ヶ月後）
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + POINTS_CONFIG.expiryMonths);
  customerPoints.expiringPoints.push({
    points,
    expiryDate: expiryDate.toISOString().split("T")[0],
  });

  saveCustomerPoints(customerPoints);
}

/**
 * 有効期限が近いポイントを取得
 */
export function getExpiringPointsWarning(
  customerId: string
): { points: number; expiryDate: string } | null {
  return getExpiringWarning(customerId);
}

// ========== クーポン関連 ==========

/**
 * 顧客のクーポン一覧を取得
 */
export function loadCustomerCoupons(customerId: string): Coupon[] {
  return getCouponsData(customerId);
}

/**
 * クーポンを使用
 */
export function useCoupon(customerId: string, couponId: string): boolean {
  // この実装では使用済みフラグをlocalStorageで管理
  if (typeof window === "undefined") return false;

  try {
    const key = `${STORAGE_KEYS.COUPONS}_used`;
    const stored = localStorage.getItem(key);
    const usedCoupons: Record<string, string[]> = stored
      ? JSON.parse(stored)
      : {};

    if (!usedCoupons[customerId]) {
      usedCoupons[customerId] = [];
    }

    if (usedCoupons[customerId].includes(couponId)) {
      return false; // 既に使用済み
    }

    usedCoupons[customerId].push(couponId);
    localStorage.setItem(key, JSON.stringify(usedCoupons));
    return true;
  } catch (error) {
    console.error("Failed to use coupon:", error);
    return false;
  }
}

/**
 * クーポンが使用済みか確認
 */
export function isCouponUsed(customerId: string, couponId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = `${STORAGE_KEYS.COUPONS}_used`;
    const stored = localStorage.getItem(key);
    if (!stored) return false;

    const usedCoupons: Record<string, string[]> = JSON.parse(stored);
    return usedCoupons[customerId]?.includes(couponId) || false;
  } catch (error) {
    return false;
  }
}

// ========== 友達紹介関連 ==========

/**
 * 顧客の紹介プログラム情報を取得
 */
export function loadCustomerReferral(customerId: string): ReferralProgram {
  const dummyData = getReferralData(customerId);
  if (dummyData) return dummyData;

  // ダミーデータがなければ新規生成
  return {
    ...DEFAULT_REFERRAL_PROGRAM,
    customerId,
    referralCode: generateReferralCode(customerId),
  };
}

/**
 * 紹介コードを生成
 */
export function generateReferralCode(customerId: string): string {
  const prefix = customerId.replace("cust-", "").toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `SBC-${prefix}-${timestamp}`;
}

/**
 * 紹介コードをクリップボードにコピー
 */
export async function copyReferralCode(code: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch (error) {
    console.error("Failed to copy referral code:", error);
    return false;
  }
}

/**
 * 紹介コードを共有（Web Share API）
 */
export async function shareReferralCode(
  code: string,
  customerName: string
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title: "SBC Men's Flash 友達紹介",
      text: `${customerName}さんからの紹介で、初回500円OFFになります！\n紹介コード: ${code}`,
      url: `https://example.com/referral?code=${code}`,
    });
    return true;
  } catch (error) {
    // ユーザーがキャンセルした場合もエラーになるが、問題なし
    if ((error as Error).name !== "AbortError") {
      console.error("Failed to share referral code:", error);
    }
    return false;
  }
}

/**
 * Web Share APIが利用可能か確認
 */
export function isShareSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}
