"use client";

import { useState, useMemo } from "react";
import {
  GalleryPhoto,
  TreatmentArea,
  TREATMENT_AREA_LABELS,
} from "@/types/gallery";

interface EffectComparisonProps {
  photos: GalleryPhoto[];
}

export default function EffectComparison({ photos }: EffectComparisonProps) {
  const [selectedArea, setSelectedArea] = useState<TreatmentArea | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  // 部位ごとにビフォー・アフターをグループ化
  const comparisonData = useMemo(() => {
    const grouped: Record<
      TreatmentArea,
      { before: GalleryPhoto | null; after: GalleryPhoto | null }
    > = {
      full_face: { before: null, after: null },
      upper_lip: { before: null, after: null },
      chin: { before: null, after: null },
      cheek: { before: null, after: null },
      neck: { before: null, after: null },
    };

    // 各部位の最新のビフォー・アフターを取得
    photos.forEach((photo) => {
      const current = grouped[photo.area];
      if (photo.type === "before") {
        if (!current.before || new Date(photo.date) > new Date(current.before.date)) {
          current.before = photo;
        }
      } else {
        if (!current.after || new Date(photo.date) > new Date(current.after.date)) {
          current.after = photo;
        }
      }
    });

    return grouped;
  }, [photos]);

  // 比較可能な部位（ビフォーとアフター両方がある）
  const comparableAreas = (Object.keys(comparisonData) as TreatmentArea[]).filter(
    (area) => comparisonData[area].before && comparisonData[area].after
  );

  // 選択中の部位データ
  const currentComparison = selectedArea ? comparisonData[selectedArea] : null;

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, position)));
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🔍</span>
        <p className="text-gray-500 mb-2">比較できる写真がありません</p>
        <p className="text-gray-400 text-sm">
          同じ部位のビフォー・アフター写真を追加すると比較できます
        </p>
      </div>
    );
  }

  if (comparableAreas.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">📸</span>
        <p className="text-gray-500 mb-2">
          比較するにはビフォーとアフター両方の写真が必要です
        </p>
        <p className="text-gray-400 text-sm">
          同じ部位の施術前後の写真を追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 部位選択 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">部位を選択</h3>
        <div className="flex gap-2 flex-wrap">
          {comparableAreas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedArea === area
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {TREATMENT_AREA_LABELS[area]}
            </button>
          ))}
        </div>
      </div>

      {/* 比較ビュー */}
      {currentComparison?.before && currentComparison?.after && (
        <div className="space-y-4">
          {/* スライダー比較 */}
          <div
            className="relative aspect-square rounded-xl overflow-hidden cursor-ew-resize select-none"
            onMouseMove={(e) => e.buttons === 1 && handleSliderMove(e)}
            onTouchMove={handleSliderMove}
            onMouseDown={handleSliderMove}
          >
            {/* アフター画像（背景） */}
            <img
              src={currentComparison.after.imageData}
              alt="アフター"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* ビフォー画像（クリップ） */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={currentComparison.before.imageData}
                alt="ビフォー"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: "none" }}
              />
            </div>

            {/* スライダーライン */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <span className="text-gray-400">↔</span>
              </div>
            </div>

            {/* ラベル */}
            <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-2 py-1 rounded-full">
              ビフォー
            </div>
            <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              アフター
            </div>
          </div>

          {/* 日付情報 */}
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <span className="text-orange-600 font-medium">ビフォー:</span>{" "}
              {currentComparison.before.date}
            </div>
            <div>
              <span className="text-green-600 font-medium">アフター:</span>{" "}
              {currentComparison.after.date}
            </div>
          </div>

          {/* 経過日数 */}
          {(() => {
            const beforeDate = new Date(currentComparison.before.date);
            const afterDate = new Date(currentComparison.after.date);
            const diffDays = Math.floor(
              (afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  📅 <span className="font-bold">{diffDays}日間</span>の変化
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {!selectedArea && (
        <div className="text-center py-8">
          <p className="text-gray-500">上の部位を選択して比較を開始</p>
        </div>
      )}
    </div>
  );
}
