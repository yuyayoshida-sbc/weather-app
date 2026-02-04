"use client";

import { useState, useRef } from "react";
import {
  GalleryPhoto,
  PhotoType,
  TreatmentArea,
  TREATMENT_AREA_LABELS,
  PHOTO_TYPE_LABELS,
  IMAGE_CONSTRAINTS,
} from "@/types/gallery";
import {
  savePhoto,
  generatePhotoId,
  compressImage,
  createThumbnail,
  getPhotoCount,
} from "@/utils/galleryStorage";

interface PhotoUploaderProps {
  onPhotoSaved: (photo: GalleryPhoto) => void;
  onClose: () => void;
}

export default function PhotoUploader({ onPhotoSaved, onClose }: PhotoUploaderProps) {
  const [photoType, setPhotoType] = useState<PhotoType>("before");
  const [area, setArea] = useState<TreatmentArea>("full_face");
  const [notes, setNotes] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      // ファイル読み込み
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        // 画像圧縮
        const compressed = await compressImage(base64);
        setPreviewImage(compressed);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setError("画像の読み込みに失敗しました");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("画像の処理に失敗しました");
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!previewImage) {
      setError("写真を選択してください");
      return;
    }

    // 保存上限チェック
    const currentCount = getPhotoCount();
    if (currentCount >= IMAGE_CONSTRAINTS.maxPhotos) {
      setError(`写真の保存上限（${IMAGE_CONSTRAINTS.maxPhotos}枚）に達しています`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // サムネイル作成
      const thumbnail = await createThumbnail(previewImage);

      const photo: GalleryPhoto = {
        id: generatePhotoId(),
        type: photoType,
        date: new Date().toISOString().split("T")[0],
        area,
        imageData: previewImage,
        thumbnailData: thumbnail,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      };

      savePhoto(photo);
      onPhotoSaved(photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setIsProcessing(false);
    }
  };

  const areaOptions: TreatmentArea[] = [
    "full_face",
    "upper_lip",
    "chin",
    "cheek",
    "neck",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">写真を追加</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* エラー表示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 写真選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真を選択
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            {previewImage ? (
              <div className="relative">
                <img
                  src={previewImage}
                  alt="プレビュー"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-3xl">📷</span>
                  <span className="text-sm text-gray-600">撮影する</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-3xl">🖼️</span>
                  <span className="text-sm text-gray-600">選択する</span>
                </button>
              </div>
            )}
          </div>

          {/* 写真タイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写真タイプ
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["before", "after"] as PhotoType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setPhotoType(type)}
                  className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                    photoType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {PHOTO_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* 部位選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              施術部位
            </label>
            <div className="grid grid-cols-3 gap-2">
              {areaOptions.map((areaOption) => (
                <button
                  key={areaOption}
                  onClick={() => setArea(areaOption)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    area === areaOption
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {TREATMENT_AREA_LABELS[areaOption]}
                </button>
              ))}
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メモ（任意）
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="施術後の状態や気になることを記録..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={!previewImage || isProcessing}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              previewImage && !isProcessing
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isProcessing ? "処理中..." : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
