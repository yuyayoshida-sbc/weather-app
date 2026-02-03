import { NearbyClinic, ClinicAvailability, TimeSlot, CustomerAddress } from "@/types/reservation";

// 近隣クリニック一覧（ダミーデータ）
export const NEARBY_CLINICS: NearbyClinic[] = [
  {
    id: "clinic-shinjuku",
    name: "SBC Men's Flash 新宿西口院",
    address: "東京都新宿区西新宿1-1-1 新宿ビル3F",
    station: "新宿",
    todaySlots: [
      { time: "11:00", available: true },
      { time: "11:30", available: false },
      { time: "12:00", available: false },
      { time: "14:00", available: true },
      { time: "15:00", available: false },
      { time: "17:00", available: true },
    ],
  },
  {
    id: "clinic-ikebukuro",
    name: "SBC Men's Flash 池袋東口院",
    address: "東京都豊島区東池袋1-2-3 池袋ビル5F",
    station: "池袋",
    todaySlots: [
      { time: "11:00", available: false },
      { time: "11:30", available: true },
      { time: "12:00", available: true },
      { time: "14:00", available: false },
      { time: "15:00", available: true },
      { time: "17:00", available: true },
      { time: "18:00", available: true },
    ],
  },
  {
    id: "clinic-shibuya",
    name: "SBC Men's Flash 渋谷道玄坂院",
    address: "東京都渋谷区道玄坂2-3-4 渋谷ビル4F",
    station: "渋谷",
    todaySlots: [
      { time: "11:00", available: true },
      { time: "12:00", available: true },
      { time: "13:00", available: false },
      { time: "14:00", available: true },
      { time: "16:00", available: false },
      { time: "17:00", available: true },
    ],
  },
  {
    id: "clinic-shinagawa",
    name: "SBC Men's Flash 品川港南口院",
    address: "東京都港区港南2-4-5 品川ビル6F",
    station: "品川",
    todaySlots: [
      { time: "11:00", available: false },
      { time: "11:30", available: false },
      { time: "12:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
    ],
  },
  {
    id: "clinic-ueno",
    name: "SBC Men's Flash 上野駅前院",
    address: "東京都台東区上野7-8-9 上野ビル3F",
    station: "上野",
    todaySlots: [
      { time: "11:00", available: true },
      { time: "12:00", available: false },
      { time: "13:00", available: true },
      { time: "14:00", available: true },
      { time: "17:00", available: true },
      { time: "18:00", available: false },
    ],
  },
  {
    id: "clinic-yokohama",
    name: "SBC Men's Flash 横浜西口院",
    address: "神奈川県横浜市西区南幸1-2-3 横浜ビル4F",
    station: "横浜",
    todaySlots: [
      { time: "11:00", available: true },
      { time: "11:30", available: true },
      { time: "12:00", available: false },
      { time: "14:00", available: false },
      { time: "15:00", available: true },
      { time: "16:00", available: true },
      { time: "17:00", available: true },
    ],
  },
  {
    id: "clinic-omiya",
    name: "SBC Men's Flash 大宮駅前院",
    address: "埼玉県さいたま市大宮区桜木町1-2-3 大宮ビル5F",
    station: "大宮",
    todaySlots: [
      { time: "11:00", available: false },
      { time: "12:00", available: true },
      { time: "13:00", available: true },
      { time: "14:00", available: true },
      { time: "15:00", available: false },
      { time: "17:00", available: true },
    ],
  },
  {
    id: "clinic-chiba",
    name: "SBC Men's Flash 千葉駅前院",
    address: "千葉県千葉市中央区新町1-2-3 千葉ビル3F",
    station: "千葉",
    todaySlots: [
      { time: "11:00", available: true },
      { time: "11:30", available: true },
      { time: "13:00", available: true },
      { time: "14:00", available: false },
      { time: "16:00", available: true },
      { time: "17:00", available: false },
    ],
  },
];

// 駅間の所要時間マップ（分）- 簡易版
const TRAVEL_TIME_MAP: Record<string, Record<string, number>> = {
  "新宿": { "新宿": 0, "池袋": 8, "渋谷": 5, "品川": 20, "上野": 25, "横浜": 35, "大宮": 35, "千葉": 45 },
  "池袋": { "新宿": 8, "池袋": 0, "渋谷": 15, "品川": 25, "上野": 18, "横浜": 40, "大宮": 25, "千葉": 50 },
  "渋谷": { "新宿": 5, "池袋": 15, "渋谷": 0, "品川": 15, "上野": 28, "横浜": 25, "大宮": 40, "千葉": 55 },
  "品川": { "新宿": 20, "池袋": 25, "渋谷": 15, "品川": 0, "上野": 22, "横浜": 18, "大宮": 45, "千葉": 35 },
  "上野": { "新宿": 25, "池袋": 18, "渋谷": 28, "品川": 22, "上野": 0, "横浜": 40, "大宮": 25, "千葉": 40 },
  "横浜": { "新宿": 35, "池袋": 40, "渋谷": 25, "品川": 18, "上野": 40, "横浜": 0, "大宮": 60, "千葉": 55 },
  "大宮": { "新宿": 35, "池袋": 25, "渋谷": 40, "品川": 45, "上野": 25, "横浜": 60, "大宮": 0, "千葉": 70 },
  "千葉": { "新宿": 45, "池袋": 50, "渋谷": 55, "品川": 35, "上野": 40, "横浜": 55, "大宮": 70, "千葉": 0 },
  // その他の駅（デフォルト）
  "東京": { "新宿": 15, "池袋": 20, "渋谷": 20, "品川": 10, "上野": 8, "横浜": 25, "大宮": 30, "千葉": 35 },
  "秋葉原": { "新宿": 20, "池袋": 22, "渋谷": 25, "品川": 15, "上野": 5, "横浜": 35, "大宮": 35, "千葉": 35 },
  "恵比寿": { "新宿": 10, "池袋": 18, "渋谷": 3, "品川": 12, "上野": 30, "横浜": 22, "大宮": 42, "千葉": 50 },
  "目黒": { "新宿": 12, "池袋": 20, "渋谷": 5, "品川": 10, "上野": 30, "横浜": 20, "大宮": 45, "千葉": 45 },
  "六本木": { "新宿": 15, "池袋": 22, "渋谷": 10, "品川": 18, "上野": 28, "横浜": 30, "大宮": 45, "千葉": 50 },
  "赤坂": { "新宿": 18, "池袋": 25, "渋谷": 12, "品川": 15, "上野": 25, "横浜": 32, "大宮": 45, "千葉": 48 },
  "錦糸町": { "新宿": 28, "池袋": 30, "渋谷": 32, "品川": 22, "上野": 12, "横浜": 40, "大宮": 40, "千葉": 25 },
  "船橋": { "新宿": 40, "池袋": 45, "渋谷": 48, "品川": 30, "上野": 35, "横浜": 50, "大宮": 60, "千葉": 15 },
  "川崎": { "新宿": 25, "池袋": 32, "渋谷": 20, "品川": 8, "上野": 30, "横浜": 10, "大宮": 50, "千葉": 42 },
  "武蔵小杉": { "新宿": 20, "池袋": 28, "渋谷": 12, "品川": 12, "上野": 35, "横浜": 12, "大宮": 48, "千葉": 45 },
  "立川": { "新宿": 30, "池袋": 38, "渋谷": 35, "品川": 45, "上野": 50, "横浜": 55, "大宮": 55, "千葉": 70 },
  "吉祥寺": { "新宿": 18, "池袋": 25, "渋谷": 20, "品川": 35, "上野": 40, "横浜": 45, "大宮": 45, "千葉": 60 },
  "町田": { "新宿": 35, "池袋": 45, "渋谷": 30, "品川": 35, "上野": 50, "横浜": 25, "大宮": 60, "千葉": 70 },
};

// 駅間の所要時間を取得（デフォルト60分）
function getTravelTime(fromStation: string, toStation: string): number {
  const fromTimes = TRAVEL_TIME_MAP[fromStation];
  if (fromTimes && fromTimes[toStation] !== undefined) {
    return fromTimes[toStation];
  }
  // 見つからない場合はデフォルト60分
  return 60;
}

// サンプル顧客住所（実際はユーザーから取得）
export let CUSTOMER_ADDRESS: CustomerAddress = {
  homeStation: "池袋",
  workStation: "品川",
};

// 顧客住所を更新
export function updateCustomerAddress(address: Partial<CustomerAddress>): void {
  CUSTOMER_ADDRESS = { ...CUSTOMER_ADDRESS, ...address };
}

// 顧客住所を取得
export function getCustomerAddress(): CustomerAddress {
  return CUSTOMER_ADDRESS;
}

// 1時間圏内の近隣クリニックの空き状況を取得
export function getNearbyClinicAvailability(): ClinicAvailability[] {
  const result: ClinicAvailability[] = [];
  const maxTravelTime = 60; // 1時間圏内

  for (const clinic of NEARBY_CLINICS) {
    // 空きスロットがあるクリニックのみ
    const availableSlots = clinic.todaySlots.filter(slot => slot.available);
    if (availableSlots.length === 0) continue;

    // 自宅からの所要時間をチェック
    if (CUSTOMER_ADDRESS.homeStation) {
      const travelTimeFromHome = getTravelTime(CUSTOMER_ADDRESS.homeStation, clinic.station);
      if (travelTimeFromHome <= maxTravelTime) {
        result.push({
          clinicId: clinic.id,
          clinicName: clinic.name,
          address: clinic.address,
          station: clinic.station,
          travelTime: travelTimeFromHome,
          travelFrom: "home",
          availableSlots,
        });
        continue; // 自宅からの方が近い場合はそちらを優先
      }
    }

    // 職場からの所要時間をチェック
    if (CUSTOMER_ADDRESS.workStation) {
      const travelTimeFromWork = getTravelTime(CUSTOMER_ADDRESS.workStation, clinic.station);
      if (travelTimeFromWork <= maxTravelTime) {
        result.push({
          clinicId: clinic.id,
          clinicName: clinic.name,
          address: clinic.address,
          station: clinic.station,
          travelTime: travelTimeFromWork,
          travelFrom: "work",
          availableSlots,
        });
      }
    }
  }

  // 所要時間順にソート
  return result.sort((a, b) => a.travelTime - b.travelTime);
}

// 特定クリニックの空きスロットを取得
export function getClinicSlots(clinicId: string): TimeSlot[] {
  const clinic = NEARBY_CLINICS.find(c => c.id === clinicId);
  return clinic?.todaySlots || [];
}

// クリニック名を取得
export function getClinicName(clinicId: string): string {
  const clinic = NEARBY_CLINICS.find(c => c.id === clinicId);
  return clinic?.name || "不明なクリニック";
}
