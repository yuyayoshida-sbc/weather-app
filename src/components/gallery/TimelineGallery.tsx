"use client";

import { useState } from "react";
import {
  GalleryPhoto,
  TreatmentArea,
  TREATMENT_AREA_LABELS,
  PHOTO_TYPE_LABELS,
} from "@/types/gallery";

interface TimelineGalleryProps {
  photos: GalleryPhoto[];
  onPhotoClick: (photo: GalleryPhoto) => void;
  onPhotoDelete: (photoId: string) => void;
}

export default function TimelineGallery({
  photos,
  onPhotoClick,
  onPhotoDelete,
}: TimelineGalleryProps) {
  const [filterArea, setFilterArea] = useState<TreatmentArea | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 日付でグループ化
  const groupedPhotos = photos
    .filter((p) => filterArea === "all" || p.area === filterArea)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce((groups, photo) => {
      const date = photo.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
      return groups;
    }, {} as Record<string, GalleryPhoto[]>);

  const sortedDates = Object.keys(groupedPhotos).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const handleDelete = (photoId: string) => {
    if (deleteConfirm === photoId) {
      onPhotoDelete(photoId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(photoId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日（${weekDay}）`;
  };

  const areaFilterOptions: (TreatmentArea | "all")[] = [
    "all",
    "full_face",
    "upper_lip",
    "chin",
    "cheek",
    "neck",
  ];

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📷</span>
        <p className="text-gray-500 mb-2">まだ写真がありません</p>
        <p className="text-gray-400 text-sm">
          施術前後の写真を記録して、変化を確認しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {areaFilterOptions.map((areaOption) => (
          <button
            key={areaOption}
            onClick={() => setFilterArea(areaOption)}
            className={`flex-shrink-0 py-1.5 px-3 rounded-full text-sm font-medium transition-colors ${
              filterArea === areaOption
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {areaOption === "all" ? "すべて" : TREATMENT_AREA_LABELS[areaOption]}
          </button>
        ))}
      </div>

      {/* タイムライン */}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date}>
            {/* 日付ヘッダー */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <h3 className="font-medium text-gray-900">{formatDate(date)}</h3>
            </div>

            {/* 写真グリッド */}
            <div className="grid grid-cols-2 gap-3 pl-6">
              {groupedPhotos[date].map((photo) => (
                <div key={photo.id} className="relative group">
                  <button
                    onClick={() => onPhotoClick(photo)}
                    className="w-full aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={photo.thumbnailData || photo.imageData}
                      alt={`${TREATMENT_AREA_LABELS[photo.area]} ${PHOTO_TYPE_LABELS[photo.type]}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </button>

                  {/* ラベル */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        photo.type === "before"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {PHOTO_TYPE_LABELS[photo.type]}
                    </span>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                      deleteConfirm === photo.id
                        ? "bg-red-600 text-white"
                        : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {deleteConfirm === photo.id ? "確認" : "✕"}
                  </button>

                  {/* 部位・メモ */}
                  <div className="mt-1.5">
                    <p className="text-xs text-gray-600">
                      {TREATMENT_AREA_LABELS[photo.area]}
                    </p>
                    {photo.notes && (
                      <p className="text-xs text-gray-400 truncate">{photo.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
