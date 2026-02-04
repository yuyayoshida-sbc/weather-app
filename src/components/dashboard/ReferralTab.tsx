"use client";

import { useState } from "react";
import { ReferralProgram, POINTS_CONFIG } from "@/types/points";
import {
  copyReferralCode,
  shareReferralCode,
  isShareSupported,
} from "@/utils/pointsStorage";

interface ReferralTabProps {
  referral: ReferralProgram | null;
  customerName: string;
}

export default function ReferralTab({ referral, customerName }: ReferralTabProps) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!referral) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-500 text-center">
          ログインすると紹介コードが表示されます
        </p>
      </div>
    );
  }

  const handleCopy = async () => {
    const success = await copyReferralCode(referral.referralCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    await shareReferralCode(referral.referralCode, customerName);
    setSharing(false);
  };

  return (
    <div className="space-y-4">
      {/* 紹介コードカード */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-sm">
        <div className="text-center">
          <p className="text-purple-100 text-sm">あなたの紹介コード</p>
          <p className="text-2xl font-bold font-mono mt-2 tracking-wider">
            {referral.referralCode}
          </p>

          <div className="flex gap-2 mt-4 justify-center">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {copied ? "✓ コピーしました" : "📋 コピー"}
            </button>
            {isShareSupported() && (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium text-sm hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                {sharing ? "..." : "📤 シェア"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 紹介特典の説明 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🎁</span>
          紹介特典
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-2xl">👤</span>
            <div>
              <p className="font-medium text-gray-900">あなた（紹介者）</p>
              <p className="text-sm text-purple-600">
                {POINTS_CONFIG.referralBonus.toLocaleString()}ポイント獲得
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-gray-900">お友達（被紹介者）</p>
              <p className="text-sm text-pink-600">
                {POINTS_CONFIG.refereeBonus.toLocaleString()}ポイント獲得 + 初回500円OFF
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 紹介実績 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span>
          紹介実績
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {referral.referredCount}
            </p>
            <p className="text-xs text-gray-600">紹介人数</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-pink-600">
              {referral.earnedPoints.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">獲得ポイント</p>
          </div>
        </div>

        {referral.referrals.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">紹介履歴</p>
            {referral.referrals.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      record.status === "completed"
                        ? "bg-green-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-gray-900">
                      {record.referredCustomerName.charAt(0)}****様
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.referredAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      record.status === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    +{record.pointsEarned.toLocaleString()} pt
                  </p>
                  <p className="text-xs text-gray-400">
                    {record.status === "completed" ? "完了" : "来店待ち"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-4">
            まだ紹介実績がありません
          </p>
        )}
      </div>

      {/* 紹介方法 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">紹介方法</h4>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>上の紹介コードをお友達に共有</li>
          <li>お友達が初回来院時にコードを提示</li>
          <li>お友達の来院後、ポイントが付与されます</li>
        </ol>
      </div>
    </div>
  );
}
