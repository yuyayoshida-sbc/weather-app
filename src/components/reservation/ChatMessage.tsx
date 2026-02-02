"use client";

import { useState } from "react";
import { ChatMessage as ChatMessageType, TimeSlot, MenuOption, BookingConfirmation } from "@/types/reservation";
import DatePicker from "./DatePicker";

interface ChatMessageProps {
  message: ChatMessageType;
  onTimeSelect?: (time: string) => void;
  onQuickReply?: (reply: string) => void;
  onMenuSelect?: (value: string) => void;
  onDateSelect?: (date: Date) => void;
  onConfirmCustomer?: (booking: BookingConfirmation) => void;
  onChangeCustomer?: () => void;
  onPayment?: (booking: BookingConfirmation) => void;
  onPayLater?: (booking: BookingConfirmation) => void;
  onCustomerFormSubmit?: (name: string, phone: string) => void;
}

export default function ChatMessage({
  message,
  onTimeSelect,
  onQuickReply,
  onMenuSelect,
  onDateSelect,
  onConfirmCustomer,
  onChangeCustomer,
  onPayment,
  onPayLater,
  onCustomerFormSubmit
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");

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

        {/* メッセージ本文 */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>

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
            <p className="text-xs text-gray-500 mb-2">空き時間を選択：</p>
            <div className="grid grid-cols-4 gap-2">
              {message.timeSlots.map((slot: TimeSlot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && onTimeSelect?.(slot.time)}
                  disabled={!slot.available}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors font-medium ${
                    slot.available
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200 border border-blue-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  }`}
                >
                  {slot.time}
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">電話番号 *</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="090-1234-5678"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* タイムスタンプ */}
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-blue-200" : "text-gray-400"
          }`}
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
