import { TreatmentMenu, TreatmentCategory } from "@/types/reservation";

// 部位の定義
export const AREA_TYPES = {
  THREE: "three",      // 三部位（鼻下・アゴ・アゴ下）
  CHEEK: "cheek",      // もみあげ・頬
  NECK: "neck",        // 首
  THREE_CHEEK: "three_cheek",   // 三部位 + もみあげ・頬
  THREE_NECK: "three_neck",     // 三部位 + 首
  CHEEK_NECK: "cheek_neck",     // もみあげ・頬 + 首
  ALL: "all",          // 全部位
} as const;

// コース回数
export const COURSE_TYPES = {
  SINGLE: 1,
  THREE: 3,
  SIX: 6,
} as const;

// 部位の日本語名
export const AREA_LABELS: Record<string, string> = {
  [AREA_TYPES.THREE]: "三部位（鼻下・アゴ・アゴ下）",
  [AREA_TYPES.CHEEK]: "もみあげ・頬",
  [AREA_TYPES.NECK]: "首",
  [AREA_TYPES.THREE_CHEEK]: "三部位 + もみあげ・頬",
  [AREA_TYPES.THREE_NECK]: "三部位 + 首",
  [AREA_TYPES.CHEEK_NECK]: "もみあげ・頬 + 首",
  [AREA_TYPES.ALL]: "全部位",
};

// 料金表（税込）
export const PRICE_TABLE: Record<string, Record<number, number>> = {
  [AREA_TYPES.THREE]: { 1: 9800, 3: 26400, 6: 48000 },
  [AREA_TYPES.CHEEK]: { 1: 8800, 3: 23400, 6: 42000 },
  [AREA_TYPES.NECK]: { 1: 6800, 3: 18000, 6: 32400 },
  [AREA_TYPES.THREE_CHEEK]: { 1: 16800, 3: 45000, 6: 81000 },
  [AREA_TYPES.THREE_NECK]: { 1: 14800, 3: 39600, 6: 72000 },
  [AREA_TYPES.CHEEK_NECK]: { 1: 13800, 3: 36900, 6: 66600 },
  [AREA_TYPES.ALL]: { 1: 19800, 3: 53400, 6: 96000 },
};

// 施術時間（分）
const DURATION_TABLE: Record<string, number> = {
  [AREA_TYPES.THREE]: 20,
  [AREA_TYPES.CHEEK]: 15,
  [AREA_TYPES.NECK]: 10,
  [AREA_TYPES.THREE_CHEEK]: 30,
  [AREA_TYPES.THREE_NECK]: 25,
  [AREA_TYPES.CHEEK_NECK]: 20,
  [AREA_TYPES.ALL]: 35,
};

// メニュー生成
function generateMenus(): TreatmentMenu[] {
  const menus: TreatmentMenu[] = [];
  const areas = Object.values(AREA_TYPES);
  const courses = [1, 3, 6];

  for (const area of areas) {
    for (const course of courses) {
      const courseLabel = course === 1 ? "1回" : `${course}回コース`;
      const isPopular = area === AREA_TYPES.THREE || area === AREA_TYPES.ALL;

      menus.push({
        id: `beard-${area}-${course}`,
        name: `ヒゲ脱毛 ${AREA_LABELS[area]} ${courseLabel}`,
        category: "beard",
        description: getDescription(area, course),
        duration: DURATION_TABLE[area],
        price: PRICE_TABLE[area][course],
        priceNote: course > 1 ? `${course}回分総額` : undefined,
        isPopular: isPopular && course === 6,
      });
    }
  }

  // 麻酔オプション
  menus.push({
    id: "option-anesthesia",
    name: "強力麻酔クリーム",
    category: "option",
    description: "痛みを大幅に軽減する麻酔クリームです。施術の30分前に塗布します。",
    duration: 0,
    price: 3000,
    priceNote: "1回あたり",
    isPopular: false,
  });

  // カウンセリング
  menus.push({
    id: "cons-001",
    name: "無料カウンセリング",
    category: "consultation",
    description: "肌質やヒゲの状態を確認し、最適なプランをご提案します。",
    duration: 30,
    price: 0,
    priceNote: "無料",
    isPopular: false,
  });

  return menus;
}

function getDescription(area: string, course: number): string {
  const baseDesc: Record<string, string> = {
    [AREA_TYPES.THREE]: "鼻下・アゴ・アゴ下の基本3部位。最も人気のエリアです。",
    [AREA_TYPES.CHEEK]: "もみあげから頬にかけてのエリア。顔全体をスッキリ見せます。",
    [AREA_TYPES.NECK]: "首周りのヒゲを処理。襟元の清潔感がアップします。",
    [AREA_TYPES.THREE_CHEEK]: "三部位に加え、もみあげ・頬もカバー。広範囲をケア。",
    [AREA_TYPES.THREE_NECK]: "三部位と首を同時に施術。首元までスッキリ。",
    [AREA_TYPES.CHEEK_NECK]: "もみあげ・頬と首のセット。サイドから首までケア。",
    [AREA_TYPES.ALL]: "顔全体のヒゲを徹底的に脱毛。最もお得なフルセット。",
  };

  const courseDesc = course === 1
    ? "お試しにおすすめ。"
    : course === 3
    ? "効果を実感できる回数。"
    : "しっかり効果を出したい方に。1回あたり最安値。";

  return `${baseDesc[area]} ${courseDesc}`;
}

export const TREATMENT_MENUS: TreatmentMenu[] = generateMenus();

export const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  beard: "ヒゲ脱毛",
  option: "オプション",
  consultation: "カウンセリング",
};

export function getPopularMenus(): TreatmentMenu[] {
  return TREATMENT_MENUS.filter((m) => m.isPopular);
}

export function getMenuById(id: string): TreatmentMenu | undefined {
  return TREATMENT_MENUS.find((m) => m.id === id);
}

export function getMenusByCategory(category: TreatmentCategory): TreatmentMenu[] {
  return TREATMENT_MENUS.filter((m) => m.category === category);
}

export function getBeardMenus(): TreatmentMenu[] {
  return TREATMENT_MENUS.filter((m) => m.category === "beard");
}

export function findMenuByKeyword(keyword: string): TreatmentMenu | undefined {
  const lower = keyword.toLowerCase();
  return TREATMENT_MENUS.find(
    (m) =>
      m.name.toLowerCase().includes(lower) ||
      m.description.toLowerCase().includes(lower)
  );
}

export function formatPrice(price: number, note?: string): string {
  if (price === 0) return note || "無料";
  const formatted = price.toLocaleString("ja-JP");
  return note ? `¥${formatted}（${note}）` : `¥${formatted}`;
}

// 部位別の料金一覧を取得
export function getPriceListByArea(area: string): { course: number; price: number }[] {
  const prices = PRICE_TABLE[area];
  if (!prices) return [];
  return Object.entries(prices).map(([course, price]) => ({
    course: parseInt(course),
    price,
  }));
}

// 全部位の料金一覧をテキストで取得
export function getPriceListText(): string {
  const lines: string[] = ["【ヒゲ脱毛 料金表】"];

  for (const area of Object.values(AREA_TYPES)) {
    const prices = PRICE_TABLE[area];
    const areaName = AREA_LABELS[area];
    const priceStr = Object.entries(prices)
      .map(([c, p]) => `${c}回:¥${p.toLocaleString()}`)
      .join(" / ");
    lines.push(`${areaName}`);
    lines.push(`  ${priceStr}`);
  }

  lines.push("");
  lines.push("※強力麻酔クリーム：+¥3,000/回");

  return lines.join("\n");
}
