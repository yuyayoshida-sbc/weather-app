"use client";

import { CustomerPoints, POINTS_CONFIG } from "@/types/points";

interface PointsTabProps {
  points: CustomerPoints | null;
}

export default function PointsTab({ points }: PointsTabProps) {
  if (!points) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-500 text-center">
          ログインするとポイント情報が表示されます
        </p>
      </div>
    );
  }

  // 期限が近いポイントを検出（30日以内）
  const expiringWarning = points.expiringPoints.find((ep) => {
    const expiryDate = new Date(ep.expiryDate);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    return expiryDate <= thirtyDaysLater;
  });

  return (
    <div className="space-y-4">
      {/* ポイント残高 */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-sm">保有ポイント</p>
            <p className="text-4xl font-bold mt-1">
              {points.currentPoints.toLocaleString()}
              <span className="text-lg ml-1">pt</span>
            </p>
          </div>
          <div className="text-5xl">🎁</div>
        </div>
        <div className="mt-4 pt-4 border-t border-yellow-300/50 flex justify-between text-sm">
          <div>
            <p className="text-yellow-100">累計獲得</p>
            <p className="font-medium">{points.totalEarned.toLocaleString()} pt</p>
          </div>
          <div>
            <p className="text-yellow-100">累計使用</p>
            <p className="font-medium">{points.totalUsed.toLocaleString()} pt</p>
          </div>
        </div>
      </div>

      {/* 期限切れ警告 */}
      {expiringWarning && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium text-sm">
                {expiringWarning.points.toLocaleString()}ポイントが
                {new Date(expiringWarning.expiryDate).toLocaleDateString("ja-JP")}
                に失効します
              </p>
              <p className="text-red-600 text-xs mt-1">
                お早めにご利用ください
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ポイントの使い方 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>💡</span>
          ポイントの使い方
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            1ポイント = {POINTS_CONFIG.pointValue}円として施術料金に充当
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            麻酔クリーム、ドリンクにも使用可能
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            有効期限は獲得から{POINTS_CONFIG.expiryMonths}ヶ月
          </li>
        </ul>
      </div>

      {/* ポイント履歴 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>📜</span>
          ポイント履歴
        </h3>
        {points.history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            履歴がありません
          </p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {points.history.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      transaction.type === "earn"
                        ? "bg-green-100 text-green-600"
                        : transaction.type === "use"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {transaction.type === "earn"
                      ? "+"
                      : transaction.type === "use"
                      ? "-"
                      : "×"}
                  </span>
                  <div>
                    <p className="text-sm text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "ja-JP"
                      )}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-medium ${
                    transaction.type === "earn"
                      ? "text-green-600"
                      : transaction.type === "use"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {transaction.type === "earn" ? "+" : "-"}
                  {transaction.points.toLocaleString()} pt
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
