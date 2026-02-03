"use client";

import { useState } from "react";
import { TREATMENT_HISTORY, DOWNTIME_CARE, getTreatmentCount, getLastTreatmentDate } from "@/data/history";
import { CLINIC_INFO } from "@/data/clinic";
import { TreatmentHistory } from "@/types/reservation";

export default function HistoryContainer() {
  const [selectedHistory, setSelectedHistory] = useState<TreatmentHistory | null>(null);
  const [showDowntime, setShowDowntime] = useState(false);

  const treatmentCount = getTreatmentCount();
  const lastDate = getLastTreatmentDate();

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${year}/${month}/${day}（${weekday}）`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
          📋
        </div>
        <div>
          <h1 className="font-semibold text-gray-800">施術履歴</h1>
          <p className="text-xs text-gray-500">{CLINIC_INFO.name}</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* サマリー */}
        <section className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-3">施術サマリー</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">施術回数</p>
              <p className="text-2xl font-bold text-blue-600">{treatmentCount}<span className="text-sm ml-1">回</span></p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">最終施術日</p>
              <p className="text-sm font-bold text-blue-600">
                {lastDate ? `${lastDate.getMonth() + 1}/${lastDate.getDate()}` : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* ダウンタイムケアボタン */}
        <button
          onClick={() => setShowDowntime(!showDowntime)}
          className="w-full bg-amber-50 rounded-xl p-4 border border-amber-200 text-left hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-medium text-amber-800">ダウンタイムの注意事項</h3>
                <p className="text-xs text-amber-600">施術後に気をつけることをご確認ください</p>
              </div>
            </div>
            <span className="text-amber-600">{showDowntime ? "▲" : "▼"}</span>
          </div>
        </button>

        {/* ダウンタイム詳細 */}
        {showDowntime && (
          <section className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <h3 className="font-bold text-amber-800 mb-3">{DOWNTIME_CARE.title}</h3>
            <p className="text-xs text-amber-600 mb-4">期間: {DOWNTIME_CARE.period}</p>

            <div className="space-y-3 mb-4">
              {DOWNTIME_CARE.cautions.map((caution, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{caution.icon}</span>
                    <span className="font-medium text-gray-800 text-sm">{caution.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{caution.description}</p>
                </div>
              ))}
            </div>

            <h4 className="font-medium text-amber-800 mb-2 text-sm">よくある症状</h4>
            <div className="space-y-2 mb-4">
              {DOWNTIME_CARE.symptoms.map((symptom, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800 text-sm">{symptom.symptom}</span>
                    <span className="text-xs text-gray-500">{symptom.duration}</span>
                  </div>
                  <p className="text-xs text-gray-600">{symptom.advice}</p>
                </div>
              ))}
            </div>

            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-700">{DOWNTIME_CARE.emergencyContact}</p>
              <p className="text-sm font-medium text-red-800 mt-1">📞 {CLINIC_INFO.phone}</p>
            </div>
          </section>
        )}

        {/* 履歴リスト */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-3">施術履歴一覧</h2>
          <div className="space-y-2">
            {TREATMENT_HISTORY.slice().reverse().map((history) => (
              <button
                key={history.id}
                onClick={() => setSelectedHistory(selectedHistory?.id === history.id ? null : history)}
                className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{history.menu}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(history.date)}</p>
                  </div>
                  <div className="text-right">
                    {history.price > 0 ? (
                      <p className="text-sm font-medium text-blue-600">¥{history.price.toLocaleString()}</p>
                    ) : (
                      <p className="text-xs text-gray-400">コース内</p>
                    )}
                    {history.withAnesthesia && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">麻酔あり</span>
                    )}
                  </div>
                </div>

                {/* 詳細表示 */}
                {selectedHistory?.id === history.id && history.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">備考</p>
                    <p className="text-sm text-gray-700 mt-1">{history.notes}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* 履歴がない場合 */}
        {TREATMENT_HISTORY.length === 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">施術履歴がありません</p>
          </div>
        )}

        {/* お問い合わせ */}
        <section className="pb-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              履歴に関するお問い合わせ
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-600">{CLINIC_INFO.phone}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
