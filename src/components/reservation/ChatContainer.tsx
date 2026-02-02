"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "@/types/reservation";
import { mockProvider } from "@/lib/ai/MockProvider";
import { saveChatHistory, loadChatHistory, clearChatHistory } from "@/utils/reservationStorage";
import { CLINIC_INFO } from "@/data/clinic";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickActions from "./QuickActions";

const INITIAL_MESSAGE: ChatMessageType = {
  id: "welcome",
  role: "assistant",
  content: `こんにちは！${CLINIC_INFO.name}の予約アシスタントです。

男性専門のヒゲ脱毛クリニックです。
ご予約や料金について、お気軽にお尋ねください！

下のボタンからもご質問いただけます。`,
  timestamp: new Date().toISOString(),
  quickReplies: ["三部位の料金は？", "痛みはある？", "初めてです"],
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初回ロード時に履歴を読み込み
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setMessages([INITIAL_MESSAGE, ...history]);
    }
  }, []);

  // メッセージが追加されたらスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージを送信
  const sendMessage = async (content: string) => {
    if (isLoading) return;

    // ユーザーメッセージを追加
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // AIに送信
      const aiMessages = newMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await mockProvider.sendMessage(aiMessages, "");

      // AIの返答を追加
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        menuOptions: response.menuOptions,
        timeSlots: response.timeSlots,
        showCalendar: response.showCalendar,
        showCustomerConfirm: response.showCustomerConfirm,
        showPayment: response.showPayment,
        showCustomerForm: response.showCustomerForm,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // 履歴を保存（welcomeメッセージ以外）
      saveChatHistory(updatedMessages.filter((m) => m.id !== "welcome"));
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "申し訳ございません。エラーが発生しました。もう一度お試しください。",
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // クイックアクションの処理
  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  // クイック返信の処理
  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  // 時間選択の処理
  const handleTimeSelect = (time: string) => {
    sendMessage(`${time}でお願いします`);
  };

  // メニュー選択の処理
  const handleMenuSelect = (value: string) => {
    sendMessage(value);
  };

  // カレンダーで日付選択の処理
  const handleDateSelect = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
    sendMessage(`${month}月${day}日（${weekday}）を予約`);
  };

  // 顧客情報確認OK
  const handleConfirmCustomer = () => {
    sendMessage("この内容で予約確定");
  };

  // 顧客情報変更
  const handleChangeCustomer = () => {
    sendMessage("別の情報で予約");
  };

  // 事前決済完了
  const handlePayment = () => {
    sendMessage("決済完了");
  };

  // 当日支払い
  const handlePayLater = () => {
    sendMessage("当日支払い");
  };

  // 顧客情報フォーム送信
  const handleCustomerFormSubmit = (name: string, phone: string) => {
    sendMessage(`顧客情報入力完了_${name}_${phone}`);
  };

  // チャットをリセット
  const handleReset = () => {
    clearChatHistory();
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
            ⚡
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">{CLINIC_INFO.name}</h1>
            <p className="text-xs text-gray-500">予約アシスタント</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
        >
          リセット
        </button>
      </header>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onTimeSelect={handleTimeSelect}
            onQuickReply={handleQuickReply}
            onMenuSelect={handleMenuSelect}
            onDateSelect={handleDateSelect}
            onConfirmCustomer={handleConfirmCustomer}
            onChangeCustomer={handleChangeCustomer}
            onPayment={handlePayment}
            onPayLater={handlePayLater}
            onCustomerFormSubmit={handleCustomerFormSubmit}
          />
        ))}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">🤖</span>
                <span>入力中</span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* クイックアクション */}
      <QuickActions onAction={handleQuickAction} disabled={isLoading} />

      {/* 入力フォーム */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="ご質問やご予約内容を入力..."
      />
    </div>
  );
}
