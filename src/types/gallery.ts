// ビフォーアフターギャラリー関連の型定義

// 写真タイプ
export type PhotoType = "before" | "after";

// 施術部位
export type TreatmentArea =
  | "upper_lip" // 口上
  | "chin" // アゴ
  | "cheek" // 頬
  | "neck" // 首
  | "full_face"; // 全顔

// ビフォーアフター写真
export interface GalleryPhoto {
  id: string;
  type: PhotoType;
  treatmentHistoryId?: string; // 関連施術履歴ID
  date: string; // 撮影日 YYYY-MM-DD
  area: TreatmentArea;
  imageData: string; // Base64エンコード画像
  thumbnailData?: string; // サムネイル
  notes?: string;
  createdAt: string;
}

// ビフォーアフターペア
export interface BeforeAfterPair {
  id: string;
  beforePhotoId: string;
  afterPhotoId: string;
  area: TreatmentArea;
  treatmentHistoryId?: string;
  notes?: string;
  createdAt: string;
}

// ギャラリー設定
export interface GallerySettings {
  defaultArea: TreatmentArea;
  autoLinkToHistory: boolean;
}

// タイムライン表示用
export interface TimelineItem {
  date: string;
  photos: GalleryPhoto[];
  treatmentHistory?: {
    id: string;
    menu: string;
    clinicName: string;
  };
}

// 部位のラベル
export const TREATMENT_AREA_LABELS: Record<TreatmentArea, string> = {
  upper_lip: "口上",
  chin: "アゴ",
  cheek: "頬",
  neck: "首",
  full_face: "全顔",
};

// 写真タイプのラベル
export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  before: "ビフォー",
  after: "アフター",
};

// デフォルトギャラリー設定
export const DEFAULT_GALLERY_SETTINGS: GallerySettings = {
  defaultArea: "full_face",
  autoLinkToHistory: true,
};

// 画像制限
export const IMAGE_CONSTRAINTS = {
  maxWidth: 1200,
  maxHeight: 1200,
  maxSizeBytes: 1024 * 1024, // 1MB
  thumbnailSize: 200,
  maxPhotos: 30, // localStorage制限考慮
} as const;
