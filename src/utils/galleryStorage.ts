// ギャラリーデータの永続化ユーティリティ

import {
  GalleryPhoto,
  BeforeAfterPair,
  GallerySettings,
  DEFAULT_GALLERY_SETTINGS,
  IMAGE_CONSTRAINTS,
} from "@/types/gallery";

const STORAGE_KEYS = {
  PHOTOS: "clinic_gallery_photos",
  PAIRS: "clinic_gallery_pairs",
  SETTINGS: "clinic_gallery_settings",
} as const;

// ========== 写真管理 ==========

/**
 * 写真を保存
 */
export function savePhoto(photo: GalleryPhoto): void {
  if (typeof window === "undefined") return;

  try {
    const photos = loadPhotos();

    // 最大枚数チェック
    if (photos.length >= IMAGE_CONSTRAINTS.maxPhotos) {
      throw new Error(`写真の保存上限（${IMAGE_CONSTRAINTS.maxPhotos}枚）に達しています`);
    }

    const existingIndex = photos.findIndex((p) => p.id === photo.id);
    if (existingIndex >= 0) {
      photos[existingIndex] = photo;
    } else {
      photos.push(photo);
    }

    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
  } catch (error) {
    console.error("Failed to save photo:", error);
    throw error;
  }
}

/**
 * 全写真を読み込み
 */
export function loadPhotos(): GalleryPhoto[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    if (!stored) return [];
    return JSON.parse(stored) as GalleryPhoto[];
  } catch (error) {
    console.error("Failed to load photos:", error);
    return [];
  }
}

/**
 * 写真を削除
 */
export function deletePhoto(photoId: string): void {
  if (typeof window === "undefined") return;

  try {
    const photos = loadPhotos().filter((p) => p.id !== photoId);
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));

    // 関連するペアも削除
    const pairs = loadPairs().filter(
      (p) => p.beforePhotoId !== photoId && p.afterPhotoId !== photoId
    );
    localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
  } catch (error) {
    console.error("Failed to delete photo:", error);
  }
}

/**
 * IDで写真を取得
 */
export function getPhotoById(photoId: string): GalleryPhoto | null {
  const photos = loadPhotos();
  return photos.find((p) => p.id === photoId) || null;
}

// ========== ペア管理 ==========

/**
 * ペアを保存
 */
export function savePair(pair: BeforeAfterPair): void {
  if (typeof window === "undefined") return;

  try {
    const pairs = loadPairs();
    const existingIndex = pairs.findIndex((p) => p.id === pair.id);
    if (existingIndex >= 0) {
      pairs[existingIndex] = pair;
    } else {
      pairs.push(pair);
    }
    localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
  } catch (error) {
    console.error("Failed to save pair:", error);
  }
}

/**
 * 全ペアを読み込み
 */
export function loadPairs(): BeforeAfterPair[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAIRS);
    if (!stored) return [];
    return JSON.parse(stored) as BeforeAfterPair[];
  } catch (error) {
    console.error("Failed to load pairs:", error);
    return [];
  }
}

/**
 * ペアを削除
 */
export function deletePair(pairId: string): void {
  if (typeof window === "undefined") return;

  try {
    const pairs = loadPairs().filter((p) => p.id !== pairId);
    localStorage.setItem(STORAGE_KEYS.PAIRS, JSON.stringify(pairs));
  } catch (error) {
    console.error("Failed to delete pair:", error);
  }
}

// ========== 設定管理 ==========

/**
 * ギャラリー設定を保存
 */
export function saveGallerySettings(settings: GallerySettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save gallery settings:", error);
  }
}

/**
 * ギャラリー設定を読み込み
 */
export function loadGallerySettings(): GallerySettings {
  if (typeof window === "undefined") return DEFAULT_GALLERY_SETTINGS;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return DEFAULT_GALLERY_SETTINGS;
    return { ...DEFAULT_GALLERY_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    console.error("Failed to load gallery settings:", error);
    return DEFAULT_GALLERY_SETTINGS;
  }
}

// ========== 画像処理ヘルパー ==========

/**
 * 一意のIDを生成
 */
export function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ペアIDを生成
 */
export function generatePairId(): string {
  return `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 画像を圧縮
 */
export async function compressImage(
  base64: string,
  maxWidth: number = IMAGE_CONSTRAINTS.maxWidth
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // アスペクト比を維持してリサイズ
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > IMAGE_CONSTRAINTS.maxHeight) {
        width = (width * IMAGE_CONSTRAINTS.maxHeight) / height;
        height = IMAGE_CONSTRAINTS.maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // JPEG形式で圧縮（品質0.8）
      const compressed = canvas.toDataURL("image/jpeg", 0.8);
      resolve(compressed);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = base64;
  });
}

/**
 * サムネイルを作成
 */
export async function createThumbnail(base64: string): Promise<string> {
  return compressImage(base64, IMAGE_CONSTRAINTS.thumbnailSize);
}

/**
 * ストレージ使用量を取得（バイト）
 */
export function getStorageUsage(): number {
  if (typeof window === "undefined") return 0;

  try {
    const photos = localStorage.getItem(STORAGE_KEYS.PHOTOS) || "";
    const pairs = localStorage.getItem(STORAGE_KEYS.PAIRS) || "";
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS) || "";
    return photos.length + pairs.length + settings.length;
  } catch {
    return 0;
  }
}

/**
 * 写真数を取得
 */
export function getPhotoCount(): number {
  return loadPhotos().length;
}
