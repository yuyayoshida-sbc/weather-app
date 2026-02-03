"use client";

import { useState, useEffect } from "react";
import { TREATMENT_HISTORY, DOWNTIME_CARE, getTreatmentCount, getLastTreatmentDate, updateTreatmentNotes, updateTreatmentFeedback, getUnusedCourses, CourseContract } from "@/data/history";
import { CLINIC_INFO } from "@/data/clinic";
import { TreatmentHistory, TreatmentFeedback } from "@/types/reservation";
import StarRating from "./StarRating";

export default function HistoryContainer() {
  const [selectedHistory, setSelectedHistory] = useState<TreatmentHistory | null>(null);
  const [showDowntime, setShowDowntime] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [historyData, setHistoryData] = useState<TreatmentHistory[]>([]);
  const [unusedCourses, setUnusedCourses] = useState<CourseContract[]>([]);

  // フィードバック編集状態
  const [feedbackEditingId, setFeedbackEditingId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [feedbackHasLeakage, setFeedbackHasLeakage] = useState(false);
  const [feedbackLeakageDetails, setFeedbackLeakageDetails] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");

  // 初期化時に履歴データを設定
  useEffect(() => {
    setHistoryData([...TREATMENT_HISTORY]);
    setUnusedCourses(getUnusedCourses());
  }, []);

  const treatmentCount = getTreatmentCount();
  const lastDate = getLastTreatmentDate();

  // 備考の編集を開始
  const handleEditStart = (history: TreatmentHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(history.id);
    setEditNotes(history.notes || "");
  };

  // 備考の保存
  const handleSaveNotes = (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateTreatmentNotes(historyId, editNotes);
    setHistoryData([...TREATMENT_HISTORY]);
    setEditingId(null);
    setEditNotes("");
  };

  // 編集のキャンセル
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditNotes("");
  };

  // フィードバック編集を開始
  const handleFeedbackEditStart = (history: TreatmentHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedbackEditingId(history.id);
    if (history.feedback) {
      setFeedbackRating(history.feedback.satisfactionRating);
      setFeedbackHasLeakage(history.feedback.hasLeakage);
      setFeedbackLeakageDetails(history.feedback.leakageDetails || "");
      setFeedbackComment(history.feedback.comment || "");
    } else {
      setFeedbackRating(3);
      setFeedbackHasLeakage(false);
      setFeedbackLeakageDetails("");
      setFeedbackComment("");
    }
  };

  // フィードバックの保存
  const handleSaveFeedback = (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const feedback: TreatmentFeedback = {
      satisfactionRating: feedbackRating,
      hasLeakage: feedbackHasLeakage,
      leakageDetails: feedbackHasLeakage ? feedbackLeakageDetails : undefined,
      comment: feedbackComment || undefined,
      createdAt: new Date().toISOString(),
    };
    updateTreatmentFeedback(historyId, feedback);
    setHistoryData([...TREATMENT_HISTORY]);
    setFeedbackEditingId(null);
  };

  // フィードバック編集のキャンセル
  const handleCancelFeedbackEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedbackEditingId(null);
  };

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    return `${year}/${month}/${day}（${weekday}）`;
  };

  // レーザータイプのバッジカラー
  const getLaserBadgeColor = (laserType: string) => {
    switch (laserType) {
      case "YAG":
        return "bg-red-100 text-red-700";
      case "アレキサンドライト":
        return "bg-green-100 text-green-700";
      case "ダイオード":
        return "bg-purple-100 text-purple-700";
      case "IPL":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
              <p className="text-2xl font-bold text-blue-600" suppressHydrationWarning>{treatmentCount}<span className="text-sm ml-1">回</span></p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">最終施術日</p>
              <p className="text-sm font-bold text-blue-600" suppressHydrationWarning>
                {lastDate ? `${lastDate.getMonth() + 1}/${lastDate.getDate()}` : "-"}
              </p>
            </div>
          </div>
        </section>

        {/* 未消化コース表示 */}
        {unusedCourses.length > 0 && (
          <section className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <h2 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
              <span>🎫</span>
              未消化コース
            </h2>
            <div className="space-y-2">
              {unusedCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl p-3">
                  <p className="font-medium text-gray-800 text-sm">{course.courseName}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">残り</span>
                      <span className="text-lg font-bold text-green-600">{course.remainingSessions}</span>
                      <span className="text-xs text-gray-500">/ {course.totalSessions}回</span>
                    </div>
                    <span className="text-xs text-gray-400">有効期限: {formatDate(course.expiryDate).split("（")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
              <a
                href="/reservation"
                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                💬 チャットで相談
              </a>
            </div>
          </section>
        )}

        {/* 履歴リスト */}
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-3">施術履歴一覧</h2>
          <div className="space-y-3">
            {historyData.slice().reverse().map((history) => (
              <div
                key={history.id}
                onClick={() => setSelectedHistory(selectedHistory?.id === history.id ? null : history)}
                className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left hover:border-blue-300 transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedHistory(selectedHistory?.id === history.id ? null : history)}
              >
                {/* 基本情報 */}
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

                {/* 施術詳細（院・レーザー・担当者） */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    🏥 {history.clinicName}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getLaserBadgeColor(history.laserType)}`}>
                    💉 {history.laserType}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    👩‍⚕️ {history.nurseName}
                  </span>
                </div>

                {/* フィードバック表示（常に表示） */}
                {history.feedback && feedbackEditingId !== history.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating value={history.feedback.satisfactionRating} readonly size="sm" />
                        <span className={`text-xs px-2 py-0.5 rounded-full ${history.feedback.hasLeakage ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          照射漏れ: {history.feedback.hasLeakage ? "あり" : "なし"}
                        </span>
                      </div>
                    </div>
                    {history.feedback.comment && (
                      <p className="text-xs text-gray-600 mt-2">「{history.feedback.comment}」</p>
                    )}
                    {history.feedback.hasLeakage && history.feedback.leakageDetails && (
                      <p className="text-xs text-red-600 mt-1">⚠️ {history.feedback.leakageDetails}</p>
                    )}
                  </div>
                )}

                {/* 詳細表示（展開時） */}
                {selectedHistory?.id === history.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
                    {/* 備考メモ */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500">備考メモ</p>
                        {editingId !== history.id && (
                          <button
                            onClick={(e) => handleEditStart(history, e)}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            ✏️ 編集
                          </button>
                        )}
                      </div>

                      {editingId === history.id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="メモを入力..."
                            className="w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                              キャンセル
                            </button>
                            <button
                              onClick={(e) => handleSaveNotes(history.id, e)}
                              className="px-3 py-1 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700">
                          {history.notes || <span className="text-gray-400">メモなし</span>}
                        </p>
                      )}
                    </div>

                    {/* フィードバック入力/編集 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">フィードバック</p>
                        {feedbackEditingId !== history.id && (
                          <button
                            onClick={(e) => handleFeedbackEditStart(history, e)}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          >
                            {history.feedback ? "✏️ 編集" : "➕ 追加"}
                          </button>
                        )}
                      </div>

                      {feedbackEditingId === history.id ? (
                        <div className="space-y-3 bg-gray-50 rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                          {/* 満足度 */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">満足度</p>
                            <StarRating
                              value={feedbackRating}
                              onChange={(v) => setFeedbackRating(v as 1 | 2 | 3 | 4 | 5)}
                            />
                          </div>

                          {/* 照射漏れ */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">照射漏れ</p>
                            <div className="flex gap-3">
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="radio"
                                  checked={!feedbackHasLeakage}
                                  onChange={() => setFeedbackHasLeakage(false)}
                                  className="text-blue-600"
                                />
                                なし
                              </label>
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="radio"
                                  checked={feedbackHasLeakage}
                                  onChange={() => setFeedbackHasLeakage(true)}
                                  className="text-blue-600"
                                />
                                あり
                              </label>
                            </div>
                            {feedbackHasLeakage && (
                              <textarea
                                value={feedbackLeakageDetails}
                                onChange={(e) => setFeedbackLeakageDetails(e.target.value)}
                                placeholder="照射漏れの詳細を入力..."
                                className="w-full mt-2 p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={2}
                              />
                            )}
                          </div>

                          {/* コメント */}
                          <div>
                            <p className="text-xs text-gray-600 mb-1">コメント</p>
                            <textarea
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              placeholder="感想やご要望をお聞かせください..."
                              className="w-full p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={2}
                            />
                          </div>

                          {/* ボタン */}
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={handleCancelFeedbackEdit}
                              className="px-3 py-1.5 text-xs text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                              キャンセル
                            </button>
                            <button
                              onClick={(e) => handleSaveFeedback(history.id, e)}
                              className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : !history.feedback ? (
                        <p className="text-xs text-gray-400">フィードバック未入力</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 履歴がない場合 */}
        {historyData.length === 0 && (
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
            <a
              href="/reservation"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              💬 チャットで相談する
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
