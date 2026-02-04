"use client";

import { useState } from "react";
import { Coupon } from "@/types/points";

interface CouponsTabProps {
  coupons: Coupon[];
}

export default function CouponsTab({ coupons }: CouponsTabProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center py-8">
          <span className="text-5xl mb-4 block">🎟️</span>
          <p className="text-gray-500">利用可能なクーポンがありません</p>
          <p className="text-gray-400 text-sm mt-2">
            キャンペーン情報をお見逃しなく！
          </p>
        </div>
      </div>
    );
  }

  // 有効期限が近い順にソート
  const sortedCoupons = [...coupons].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <div className="space-y-4">
      {/* クーポン一覧 */}
      <div className="space-y-3">
        {sortedCoupons.map((coupon) => {
          const isExpiringSoon = (() => {
            const expiryDate = new Date(coupon.expiryDate);
            const sevenDaysLater = new Date();
            sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
            return expiryDate <= sevenDaysLater;
          })();

          return (
            <div
              key={coupon.id}
              onClick={() => setSelectedCoupon(coupon)}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex">
                {/* 左側のチケット切り込み風デザイン */}
                <div
                  className={`w-2 ${
                    coupon.discountType === "percent"
                      ? "bg-gradient-to-b from-blue-500 to-blue-600"
                      : "bg-gradient-to-b from-green-500 to-green-600"
                  }`}
                />

                {/* クーポン内容 */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{coupon.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {coupon.description}
                      </p>
                    </div>
                    <div
                      className={`text-right ${
                        coupon.discountType === "percent"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      <p className="text-2xl font-bold">
                        {coupon.discountType === "percent"
                          ? `${coupon.discountValue}%`
                          : `¥${coupon.discountValue.toLocaleString()}`}
                      </p>
                      <p className="text-xs">OFF</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      コード: <span className="font-mono">{coupon.code}</span>
                    </p>
                    <p
                      className={`text-xs ${
                        isExpiringSoon ? "text-red-500 font-medium" : "text-gray-400"
                      }`}
                    >
                      {isExpiringSoon && "⚠️ "}
                      〜{new Date(coupon.expiryDate).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* クーポン詳細モーダル */}
      {selectedCoupon && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCoupon(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div
              className={`p-6 text-white ${
                selectedCoupon.discountType === "percent"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
              }`}
            >
              <p className="text-4xl font-bold text-center">
                {selectedCoupon.discountType === "percent"
                  ? `${selectedCoupon.discountValue}% OFF`
                  : `¥${selectedCoupon.discountValue.toLocaleString()} OFF`}
              </p>
              <p className="text-center mt-2 text-white/80">
                {selectedCoupon.name}
              </p>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">クーポンコード</p>
                <p className="text-xl font-mono font-bold text-gray-900 mt-1">
                  {selectedCoupon.code}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">有効期限</p>
                <p className="text-gray-900 mt-1">
                  {new Date(selectedCoupon.expiryDate).toLocaleDateString(
                    "ja-JP",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                  まで
                </p>
              </div>

              {selectedCoupon.minPurchase && (
                <div>
                  <p className="text-sm text-gray-500">最低利用金額</p>
                  <p className="text-gray-900 mt-1">
                    ¥{selectedCoupon.minPurchase.toLocaleString()}以上
                  </p>
                </div>
              )}

              {selectedCoupon.conditions && (
                <div>
                  <p className="text-sm text-gray-500">利用条件</p>
                  <p className="text-gray-700 text-sm mt-1">
                    {selectedCoupon.conditions}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedCoupon(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500">
          ※ クーポンは予約時または来院時にスタッフにお伝えください
          <br />
          ※ 他のクーポン・割引との併用はできません
        </p>
      </div>
    </div>
  );
}
