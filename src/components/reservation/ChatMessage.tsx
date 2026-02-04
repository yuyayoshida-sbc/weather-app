"use client";

import { useState } from "react";
import { ChatMessage as ChatMessageType, TimeSlot, MenuOption, BookingConfirmation, WaitlistEntry, ClinicAvailability } from "@/types/reservation";
import DatePicker from "./DatePicker";

interface ChatMessageProps {
  message: ChatMessageType;
  onTimeSelect?: (time: string) => void;
  onWaitlistSelect?: (time: string) => void;
  onQuickReply?: (reply: string) => void;
  onMenuSelect?: (value: string) => void;
  onDateSelect?: (date: Date) => void;
  onConfirmCustomer?: (booking: BookingConfirmation) => void;
  onChangeCustomer?: () => void;
  onPayment?: (booking: BookingConfirmation) => void;
  onPayLater?: (booking: BookingConfirmation) => void;
  onCustomerFormSubmit?: (name: string, phone: string) => void;
  onWaitlistConfirm?: (entry: WaitlistEntry) => void;
  onWaitlistCancel?: () => void;
  onClinicTimeSelect?: (clinicId: string, time: string) => void;
  onAddressSubmit?: (homeStation: string, workStation: string) => void;
}

export default function ChatMessage({
  message,
  onTimeSelect,
  onWaitlistSelect,
  onQuickReply,
  onMenuSelect,
  onDateSelect,
  onConfirmCustomer,
  onChangeCustomer,
  onPayment,
  onPayLater,
  onCustomerFormSubmit,
  onWaitlistConfirm,
  onWaitlistCancel,
  onClinicTimeSelect,
  onAddressSubmit
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [homeStation, setHomeStation] = useState("");
  const [workStation, setWorkStation] = useState("");
  const [expandedClinic, setExpandedClinic] = useState<string | null>(null);

  // 決済処理のハンドラー
  const handlePayment = (booking: BookingConfirmation) => {
    setIsProcessingPayment(true);
    // 簡易的な決済シミュレーション（実際はStripeなどを使用）
    setTimeout(() => {
      setIsProcessingPayment(false);
      onPayment?.(booking);
    }, 1500);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white text-gray-800 shadow-md rounded-bl-md"
        }`}
      >
        {/* アバター表示（AIのみ） */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 text-sm text-blue-600 font-medium">
            <span className="text-lg">🤖</span>
            <span>アシスタント</span>
          </div>
        )}

        {/* 画像表示 */}
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt={message.imageCaption || "送信された画像"}
              className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                // 画像クリックで拡大表示（簡易版）
                const win = window.open("", "_blank");
                if (win) {
                  win.document.write(`
                    <html>
                      <head><title>画像</title></head>
                      <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
                        <img src="${message.imageUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                      </body>
                    </html>
                  `);
                }
              }}
            />
            {message.imageCaption && (
              <p className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-gray-500"}`}>
                {message.imageCaption}
              </p>
            )}
          </div>
        )}

        {/* メッセージ本文 */}
        {message.content && (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        )}

        {/* メニュー選択ボタン */}
        {message.menuOptions && message.menuOptions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">選択してください：</p>
            <div className="flex flex-col gap-2">
              {message.menuOptions.map((option: MenuOption) => (
                <button
                  key={option.id}
                  onClick={() => onMenuSelect?.(option.value)}
                  className="w-full px-4 py-3 text-sm bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-left border border-blue-200"
                >
                  <div className="font-medium">{option.label}</div>
                  {option.price && (
                    <div className="text-xs text-blue-500 mt-1">{option.price}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* カレンダー日付選択 */}
        {message.showCalendar && onDateSelect && (
          <DatePicker onDateSelect={onDateSelect} />
        )}

        {/* 時間スロット選択 */}
        {message.timeSlots && message.timeSlots.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              時間を選択（黄色「待」はキャンセル待ち可能）：
            </p>
            <div className="grid grid-cols-4 gap-2">
              {message.timeSlots.map((slot: TimeSlot) => (
                <button
                  key={slot.time}
                  onClick={() =>
                    slot.available
                      ? onTimeSelect?.(slot.time)
                      : onWaitlistSelect?.(slot.time)
                  }
                  className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                    slot.available
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  {slot.time}
                  {!slot.available && <span className="text-xs ml-1">待</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* クイック返信 */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {message.quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => onQuickReply?.(reply)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 顧客情報確認カード */}
        {message.showCustomerConfirm && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                📋 ご予約内容
              </h3>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">メニュー</span>
                  <span className="font-medium">{message.showCustomerConfirm.menu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">日時</span>
                  <span className="font-medium">{message.showCustomerConfirm.date} {message.showCustomerConfirm.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">麻酔クリーム</span>
                  <span className="font-medium">{message.showCustomerConfirm.withAnesthesia ? "あり (+¥3,000)" : "なし"}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <span className="text-gray-500">合計金額</span>
                  <span className="font-bold text-blue-700">¥{message.showCustomerConfirm.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-200">
                <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                  👤 お客様情報
                </h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">診察券番号</span>
                    <span className="font-medium">{message.showCustomerConfirm.customerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">お名前</span>
                    <span className="font-medium">{message.showCustomerConfirm.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">電話番号</span>
                    <span className="font-medium">{message.showCustomerConfirm.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => onConfirmCustomer?.(message.showCustomerConfirm!)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  ✓ この内容で予約確定
                </button>
                <button
                  onClick={() => onChangeCustomer?.()}
                  className="w-full px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  別の情報で予約する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 決済画面 */}
        {message.showPayment && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                ✅ 予約確定
              </h3>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">メニュー</span>
                  <span className="font-medium">{message.showPayment.menu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">日時</span>
                  <span className="font-medium">{message.showPayment.date} {message.showPayment.time}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                  <span className="text-gray-500">合計金額</span>
                  <span className="font-bold text-green-700">¥{message.showPayment.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 mb-3 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">
                  💳 事前決済で当日スムーズにご案内できます
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">VISA</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">Mastercard</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">JCB</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">AMEX</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handlePayment(message.showPayment!)}
                  disabled={isProcessingPayment}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      決済処理中...
                    </>
                  ) : (
                    <>💳 事前決済する（¥{message.showPayment.price.toLocaleString()}）</>
                  )}
                </button>
                <button
                  onClick={() => onPayLater?.(message.showPayment!)}
                  disabled={isProcessingPayment}
                  className="w-full px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  当日支払いにする
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 顧客情報入力フォーム */}
        {message.showCustomerForm && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                👤 お客様情報の入力
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">お名前 *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="山田 太郎"
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">電話番号 *</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="090-1234-5678"
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (formName.trim() && formPhone.trim()) {
                    onCustomerFormSubmit?.(formName.trim(), formPhone.trim());
                  }
                }}
                disabled={!formName.trim() || !formPhone.trim()}
                className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                この内容で予約する
              </button>
            </div>
          </div>
        )}

        {/* キャンセル待ち確認カード */}
        {message.showWaitlistConfirm && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                ⏳ キャンセル待ち登録
              </h3>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">メニュー</span>
                  <span className="font-medium">{message.showWaitlistConfirm.menu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">希望日時</span>
                  <span className="font-medium">{message.showWaitlistConfirm.date} {message.showWaitlistConfirm.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">麻酔クリーム</span>
                  <span className="font-medium">{message.showWaitlistConfirm.withAnesthesia ? "あり (+¥3,000)" : "なし"}</span>
                </div>
                <div className="flex justify-between border-t border-amber-200 pt-2 mt-2">
                  <span className="text-gray-500">待機順位</span>
                  <span className="font-bold text-amber-700">#{message.showWaitlistConfirm.position}番目</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200">
                <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                  👤 お客様情報
                </h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">診察券番号</span>
                    <span className="font-medium">{message.showWaitlistConfirm.customerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">お名前</span>
                    <span className="font-medium">{message.showWaitlistConfirm.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">電話番号</span>
                    <span className="font-medium">{message.showWaitlistConfirm.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => onWaitlistConfirm?.(message.showWaitlistConfirm!)}
                  className="w-full px-4 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
                >
                  ✓ この内容で登録する
                </button>
                <button
                  onClick={() => onWaitlistCancel?.()}
                  className="w-full px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 住所入力フォーム（当日予約用） */}
        {message.showAddressForm && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                📍 最寄り駅を教えてください
              </h3>
              <p className="text-xs text-purple-600 mb-3">
                1時間圏内のクリニックの空き状況をお調べします
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">自宅の最寄り駅</label>
                  <input
                    type="text"
                    value={homeStation}
                    onChange={(e) => setHomeStation(e.target.value)}
                    placeholder="例：池袋"
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">職場の最寄り駅（任意）</label>
                  <input
                    type="text"
                    value={workStation}
                    onChange={(e) => setWorkStation(e.target.value)}
                    placeholder="例：品川"
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (homeStation.trim()) {
                    onAddressSubmit?.(homeStation.trim(), workStation.trim());
                  }
                }}
                disabled={!homeStation.trim()}
                className="w-full mt-4 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🔍 近くのクリニックを探す
              </button>
            </div>
          </div>
        )}

        {/* 近隣クリニック空き状況（当日予約用） */}
        {message.showNearbyClinicSlots && message.showNearbyClinicSlots.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                🏥 本日空きのあるクリニック
              </h3>

              <div className="space-y-2">
                {message.showNearbyClinicSlots.map((clinic: ClinicAvailability) => (
                  <div
                    key={clinic.clinicId}
                    className="bg-white rounded-lg border border-purple-200 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedClinic(
                        expandedClinic === clinic.clinicId ? null : clinic.clinicId
                      )}
                      className="w-full p-3 text-left hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{clinic.clinicName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            🚃 {clinic.station}駅
                            <span className="ml-2 text-purple-600">
                              {clinic.travelFrom === "home" ? "自宅" : "職場"}から約{clinic.travelTime}分
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            空き{clinic.availableSlots.length}枠
                          </span>
                          <span className="text-purple-600">
                            {expandedClinic === clinic.clinicId ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {expandedClinic === clinic.clinicId && (
                      <div className="px-3 pb-3 border-t border-purple-100">
                        <p className="text-xs text-gray-500 mt-2 mb-2">時間を選択：</p>
                        <div className="grid grid-cols-4 gap-2">
                          {clinic.availableSlots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => onClinicTimeSelect?.(clinic.clinicId, slot.time)}
                              className="px-2 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          📍 {clinic.address}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* タイムスタンプ */}
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-blue-200" : "text-gray-400"
          }`}
          suppressHydrationWarning
        >
          {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
