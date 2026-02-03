// 顧客住所情報
export interface CustomerAddress {
  postalCode?: string;           // 郵便番号
  prefecture: string;            // 都道府県
  city: string;                  // 市区町村
  street: string;                // 番地
  building?: string;             // 建物名
  homeStation?: string;          // 自宅最寄り駅
  workStation?: string;          // 職場最寄り駅
}

// 顧客マスター
export interface Customer {
  // 基本情報
  id: string;                    // 内部ID
  patientNumber: string;         // 診察券番号 (例: "SBC-123456")

  // 個人情報
  name: string;                  // 氏名
  nameKana?: string;             // フリガナ
  gender: "male" | "female";     // 性別
  birthDate: string;             // 生年月日 (YYYY-MM-DD)
  age: number;                   // 年齢

  // 連絡先
  address: CustomerAddress;      // 住所
  phone: string;                 // 電話番号
  email: string;                 // メールアドレス

  // 来店情報
  firstVisit: {
    date: string;                // 初来店日
    clinicId: string;            // 初来店クリニック
  };
  lastVisit: {
    date: string;                // 最終来店日
    clinicId: string;            // 最終来店クリニック
  };

  // 契約・履歴（リレーション）
  contractIds: string[];         // CourseContract.id の配列
  historyIds: string[];          // TreatmentHistory.id の配列

  // メタ情報
  createdAt: string;
  updatedAt: string;
}

// 顧客セッション（認証状態）
export interface CustomerSession {
  customerId: string;
  patientNumber: string;
  customerName: string;
  isAuthenticated: boolean;
  authenticatedAt: string;
}
