"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PhotoUploader from "./PhotoUploader";
import TimelineGallery from "./TimelineGallery";
import EffectComparison from "./EffectComparison";
import {
  GalleryPhoto,
  TREATMENT_AREA_LABELS,
  PHOTO_TYPE_LABELS,
  IMAGE_CONSTRAINTS,
} from "@/types/gallery";
import { loadPhotos, deletePhoto, getPhotoCount } from "@/utils/galleryStorage";

type ViewMode = "timeline" | "comparison";

export default function GalleryContainer() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 写真を読み込み
  useEffect(() => {
    const loadedPhotos = loadPhotos();
    setPhotos(loadedPhotos);
    setIsLoading(false);
  }, []);

  // 写真保存後の処理
  const handlePhotoSaved = (photo: GalleryPhoto) => {
    setPhotos((prev) => [...prev, photo]);
    setShowUploader(false);
  };

  // 写真削除
  const handlePhotoDelete = (photoId: string) => {
    deletePhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  // 写真詳細表示
  const handlePhotoClick = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
  };

  const photoCount = photos.length;
  const canAddMore = photoCount < IMAGE_CONSTRAINTS.maxPhotos;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-600">←</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ビフォーアフター</h1>
                <p className="text-xs text-gray-500">
                  {photoCount}/{IMAGE_CONSTRAINTS.maxPhotos}枚
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploader(true)}
              disabled={!canAddMore}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                canAddMore
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              + 追加
            </button>
          </div>
        </div>
      </header>

      {/* タブ切り替え */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === "timeline"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              📅 タイムライン
            </button>
            <button
              onClick={() => setViewMode("comparison")}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                viewMode === "comparison"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              🔍 比較
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {viewMode === "timeline" ? (
          <TimelineGallery
            photos={photos}
            onPhotoClick={handlePhotoClick}
            onPhotoDelete={handlePhotoDelete}
          />
        ) : (
          <EffectComparison photos={photos} />
        )}
      </main>

      {/* 写真アップローダー */}
      {showUploader && (
        <PhotoUploader
          onPhotoSaved={handlePhotoSaved}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* 写真詳細モーダル */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.imageData}
              alt={`${TREATMENT_AREA_LABELS[selectedPhoto.area]} ${PHOTO_TYPE_LABELS[selectedPhoto.type]}`}
              className="w-full rounded-xl"
            />
            <div className="mt-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedPhoto.type === "before"
                      ? "bg-orange-600"
                      : "bg-green-600"
                  }`}
                >
                  {PHOTO_TYPE_LABELS[selectedPhoto.type]}
                </span>
                <span className="text-sm">
                  {TREATMENT_AREA_LABELS[selectedPhoto.area]}
                </span>
              </div>
              <p className="text-sm text-gray-300">{selectedPhoto.date}</p>
              {selectedPhoto.notes && (
                <p className="text-sm text-gray-400 mt-2">{selectedPhoto.notes}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <span className="text-white text-xl">✕</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
