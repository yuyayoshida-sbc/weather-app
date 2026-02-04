import { CustomerSession } from "@/types/customer";

const SESSION_KEY = "clinic_customer_session";
const REMEMBERED_PATIENT_NUMBER_KEY = "clinic_remembered_patient_number";
const SESSION_EXPIRY_HOURS = 24; // セッション有効期限（24時間）

/**
 * 顧客セッションを保存
 */
export function saveCustomerSession(session: CustomerSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * 顧客セッションを読み込み
 * 有効期限切れの場合はnullを返し、セッションをクリア
 */
export function loadCustomerSession(): CustomerSession | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    const session: CustomerSession = JSON.parse(data);

    // 有効期限チェック
    if (session.authenticatedAt) {
      const authTime = new Date(session.authenticatedAt).getTime();
      const now = Date.now();
      const expiryTime = SESSION_EXPIRY_HOURS * 60 * 60 * 1000;

      if (now - authTime > expiryTime) {
        // 有効期限切れ
        clearCustomerSession();
        return null;
      }
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * 顧客セッションをクリア
 */
export function clearCustomerSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

/**
 * 認証済みかどうかをチェック
 */
export function isAuthenticated(): boolean {
  const session = loadCustomerSession();
  return session !== null && session.isAuthenticated;
}

/**
 * 新しいセッションを作成
 */
export function createCustomerSession(
  customerId: string,
  patientNumber: string,
  customerName: string
): CustomerSession {
  const session: CustomerSession = {
    customerId,
    patientNumber,
    customerName,
    isAuthenticated: true,
    authenticatedAt: new Date().toISOString(),
  };
  saveCustomerSession(session);
  return session;
}

/**
 * 診察券番号を記憶（次回ログイン時に自動入力用）
 */
export function saveRememberedPatientNumber(patientNumber: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REMEMBERED_PATIENT_NUMBER_KEY, patientNumber);
}

/**
 * 記憶した診察券番号を取得
 */
export function loadRememberedPatientNumber(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REMEMBERED_PATIENT_NUMBER_KEY);
}

/**
 * 記憶した診察券番号をクリア
 */
export function clearRememberedPatientNumber(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REMEMBERED_PATIENT_NUMBER_KEY);
}
