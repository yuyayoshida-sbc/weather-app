"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType } from "@/types/reservation";
import { CustomerSession } from "@/types/customer";
import { mockProvider, setCurrentSession } from "@/lib/ai/MockProvider";
import { saveChatHistory, loadChatHistory, clearChatHistory } from "@/utils/reservationStorage";
import {
  loadCustomerSession,
  clearCustomerSession,
  createCustomerSession,
} from "@/utils/customerSession";
import { CLINIC_INFO } from "@/data/clinic";
import { updateCustomerAddress } from "@/data/nearbyClinics";
import {
  findCustomerByPatientNumber,
  getCustomerUnusedCourses,
  getCustomerHistory,
} from "@/data/customers";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickActions from "./QuickActions";
import PatientNumberInput from "./PatientNumberInput";

// 認証要求メッセージ
const AUTH_REQUEST_MESSAGE: ChatMessageType = {
  id: "auth-request",
  role: "assistant",
  content: `こんにちは！${CLINIC_INFO.name}の予約アシスタントです。

お客様情報を確認させていただきます。
診察券番号をご入力ください。`,
  timestamp: new Date().toISOString(),
  showPatientNumberInput: true,
};

// 認証済み初期メッセージを生成
function createAuthenticatedMessage(
  customerName: string,
  unusedCoursesCount: number
): ChatMessageType {
  let content = `${customerName}様、こんにちは！
${CLINIC_INFO.name}の予約アシスタントです。

いつもご利用ありがとうございます。
ご予約や料金について、お気軽にお尋ねください！`;

  if (unusedCoursesCount > 0) {
    content += `

🎫 未消化のコースが${unusedCoursesCount}件ございます。`;
  }

  return {
    id: "welcome-auth",
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    quickReplies: ["予約したい", "料金を見たい", "営業時間は？"],
  };
}

// ゲスト用初期メッセージ
const GUEST_INITIAL_MESSAGE: ChatMessageType = {
  id: "welcome-guest",
  role: "assistant",
  content: `${CLINIC_INFO.name}の予約アシスタントです。

初めてのご来院ですね！
男性専門のヒゲ脱毛クリニックです。

ご予約や料金について、お気軽にお尋ねください！`,
  timestamp: new Date().toISOString(),
  quickReplies: ["三部位の料金は？", "痛みはある？", "カウンセリング予約"],
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageType[]>([AUTH_REQUEST_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [customerSession, setCustomerSession] = useState<CustomerSession | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初回ロード時にセッションを確認
  useEffect(() => {
    const session = loadCustomerSession();
    if (session && session.isAuthenticated) {
      // 既存セッションがある場合
      setCustomerSession(session);
      setCurrentSession(session);
      setShowAuthForm(false);
      initializeAuthenticatedChat(session);
    }
  }, []);

  // 認証済みチャットの初期化
  const initializeAuthenticatedChat = (session: CustomerSession) => {
    const history = loadChatHistory();
    const unusedCourses = getCustomerUnusedCourses(session.customerId);
    const customerHistory = getCustomerHistory(session.customerId);

    const messagesToSet: ChatMessageType[] = [
      createAuthenticatedMessage(session.customerName, unusedCourses.length),
    ];

    // 履歴があれば追加
    if (history.length > 0) {
      messagesToSet.push(...history);
    }

    // 3ヶ月以上経過したコースがあればリマインダー表示
    for (const course of unusedCourses) {
      if (course.lastTreatmentDate) {
        const lastDate = new Date(course.lastTreatmentDate);
        const today = new Date();
        const diffDays = Math.floor(
          (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays >= 90) {
          const months = Math.floor(diffDays / 30);
          const reminderMessage: ChatMessageType = {
            id: `reminder-${Date.now()}`,
            role: "assistant",
            content: `🔔 前回の${course.courseName}の施術から約${months}ヶ月が経過しました。

残り${course.remainingSessions}回の施術がございます。
次回のご予約はいかがでしょうか？`,
            timestamp: new Date().toISOString(),
            quickReplies: ["予約する", "後で検討する"],
            isReminder: true,
          };
          messagesToSet.push(reminderMessage);
          break; // 最初の1件のみ
        }
      }
    }

    setMessages(messagesToSet);
  };

  // メッセージが追加されたらスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 診察券番号で認証
  const handlePatientNumberSubmit = (patientNumber: string, _rememberMe: boolean) => {
    setIsAuthenticating(true);
    setAuthError("");

    // 顧客を検索
    const customer = findCustomerByPatientNumber(patientNumber);

    if (customer) {
      // セッション作成
      const session = createCustomerSession(
        customer.id,
        customer.patientNumber,
        customer.name
      );
      setCustomerSession(session);
      setCurrentSession(session);
      setShowAuthForm(false);
      initializeAuthenticatedChat(session);
    } else {
      setAuthError("診察券番号が見つかりません。再度ご確認ください。");
    }

    setIsAuthenticating(false);
  };

  // ゲストとして続行（初めての方）
  const handleSkipAuth = () => {
    setShowAuthForm(false);
    setCurrentSession(null);
    setMessages([GUEST_INITIAL_MESSAGE]);
  };

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
        .filter((m) => !m.id.startsWith("welcome") && !m.id.startsWith("auth"))
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
        quickReplies: response.quickReplies,
        menuOptions: response.menuOptions,
        timeSlots: response.timeSlots,
        showCalendar: response.showCalendar,
        showCustomerConfirm: response.showCustomerConfirm,
        showPayment: response.showPayment,
        showCustomerForm: response.showCustomerForm,
        showWaitlistConfirm: response.showWaitlistConfirm,
        showIntervalWarning: response.showIntervalWarning,
        showNearbyClinicSlots: response.showNearbyClinicSlots,
        showAddressForm: response.showAddressForm,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // 履歴を保存（welcomeメッセージ以外）
      saveChatHistory(
        updatedMessages.filter(
          (m) => !m.id.startsWith("welcome") && !m.id.startsWith("auth") && !m.id.startsWith("reminder")
        )
      );
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

  // 満席時間を選択（キャンセル待ち案内）
  const handleWaitlistSelect = (time: string) => {
    sendMessage(`満席時間選択_${time}`);
  };

  // キャンセル待ち登録確定
  const handleWaitlistConfirm = () => {
    sendMessage("キャンセル待ち登録確定");
  };

  // キャンセル待ちキャンセル
  const handleWaitlistCancel = () => {
    sendMessage("別の時間を選びたい");
  };

  // 近隣クリニックの時間選択
  const handleClinicTimeSelect = (clinicId: string, time: string) => {
    sendMessage(`近隣クリニック予約_${clinicId}_${time}`);
  };

  // 住所入力送信
  const handleAddressSubmit = (homeStation: string, workStation: string) => {
    // 顧客住所を更新
    updateCustomerAddress({ homeStation, workStation: workStation || undefined });
    sendMessage(`住所入力完了_${homeStation}_${workStation}`);
  };

  // チャット会話のみリセット（ログイン状態は維持）
  const handleClearChat = () => {
    clearChatHistory();
    if (customerSession) {
      // ログイン中の場合は認証済みメッセージから再開
      const unusedCourses = getCustomerUnusedCourses(customerSession.customerId);
      setMessages([createAuthenticatedMessage(customerSession.customerName, unusedCourses.length)]);
    } else {
      // ゲストの場合はゲストメッセージから再開
      setMessages([GUEST_INITIAL_MESSAGE]);
    }
  };

  // ログアウト（チャットもリセット）
  const handleLogout = () => {
    clearChatHistory();
    clearCustomerSession();
    setCurrentSession(null);
    setCustomerSession(null);
    setShowAuthForm(true);
    setAuthError("");
    setMessages([AUTH_REQUEST_MESSAGE]);
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
            <p className="text-xs text-gray-500">
              {customerSession
                ? `${customerSession.customerName}様`
                : "予約アシスタント"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!showAuthForm && (
            <button
              onClick={handleClearChat}
              className="text-xs text-gray-500 hover:text-blue-500 transition-colors px-2 py-1"
            >
              会話リセット
            </button>
          )}
          {customerSession && (
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-600 transition-colors px-2 py-1"
            >
              ログアウト
            </button>
          )}
        </div>
      </header>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 認証フォーム表示 */}
        {showAuthForm ? (
          <div className="space-y-4">
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md max-w-[85%]">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🤖</span>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {AUTH_REQUEST_MESSAGE.content}
                  </div>
                </div>
              </div>
            </div>
            <PatientNumberInput
              onSubmit={handlePatientNumberSubmit}
              onSkip={handleSkipAuth}
              error={authError}
              isLoading={isAuthenticating}
            />
          </div>
        ) : (
          <>
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
                onWaitlistSelect={handleWaitlistSelect}
                onWaitlistConfirm={handleWaitlistConfirm}
                onWaitlistCancel={handleWaitlistCancel}
                onClinicTimeSelect={handleClinicTimeSelect}
                onAddressSubmit={handleAddressSubmit}
              />
            ))}
          </>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="text-lg">🤖</span>
                <span>入力中</span>
                <span className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* クイックアクション（認証後のみ表示） */}
      {!showAuthForm && (
        <QuickActions onAction={handleQuickAction} disabled={isLoading} />
      )}

      {/* 入力フォーム（認証後のみ表示） */}
      {!showAuthForm && (
        <ChatInput
          onSend={sendMessage}
          disabled={isLoading}
          placeholder="ご質問やご予約内容を入力..."
        />
      )}
    </div>
  );
}
