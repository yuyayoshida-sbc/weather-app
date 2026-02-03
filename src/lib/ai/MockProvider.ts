import { AIProvider, AIMessage, AIResponse, AIProviderConfig } from "./types";
import { getPopularMenus, formatPrice, getPriceListText, AREA_LABELS, AREA_TYPES, PRICE_TABLE } from "@/data/menus";
import { CLINIC_INFO, BUSINESS_HOURS_TEXT } from "@/data/clinic";
import { findFAQByKeyword } from "@/data/faq";
import { checkTreatmentInterval, getUnusedCourses } from "@/data/history";
import { getNearbyClinicAvailability, getClinicName, updateCustomerAddress, getCustomerAddress } from "@/data/nearbyClinics";
import { MenuOption, TimeSlot, BookingConfirmation, WaitlistEntry } from "@/types/reservation";

// サンプル顧客データ（実際は診察券番号から取得）
const SAMPLE_CUSTOMER = {
  customerId: "SBC-123456",
  customerName: "SBC太郎",
  customerPhone: "090-1111-1111",
};

export class MockAIProvider implements AIProvider {
  name = "mock";

  async sendMessage(messages: AIMessage[], _systemPrompt: string): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    const input = lastMessage.content.toLowerCase();

    // 遅延をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

    return this.generateResponse(input);
  }

  private generateResponse(input: string): AIResponse {
    // ========== 最優先チェック（予約フロー中の入力）==========

    // 近隣クリニック予約
    if (this.matchAny(input, ["近隣クリニック予約_"])) {
      const match = input.match(/近隣クリニック予約_([^_]+)_(\d{1,2}:\d{2})/);
      if (match) {
        const clinicId = match[1];
        const selectedTime = match[2];
        const clinicName = getClinicName(clinicId);

        const anesthesiaOptions: MenuOption[] = [
          { id: "with_anesthesia", label: "麻酔クリームあり", value: `${selectedTime}予約確定_麻酔あり_${clinicId}`, price: "+¥3,000" },
          { id: "without_anesthesia", label: "麻酔クリームなし", value: `${selectedTime}予約確定_麻酔なし_${clinicId}`, price: "" },
        ];

        return {
          content: `${clinicName}
${selectedTime}ですね。

強力麻酔クリームはご利用になりますか？
痛みが心配な方におすすめです。`,
          menuOptions: anesthesiaOptions
        };
      }
    }

    // 住所入力完了 → 近隣クリニック表示
    if (this.matchAny(input, ["住所入力完了_"])) {
      const match = input.match(/住所入力完了_([^_]+)_?(.*)?/);
      if (match) {
        const homeStation = match[1];
        const workStation = match[2] || "";

        // 住所を更新
        updateCustomerAddress({
          homeStation,
          workStation: workStation || undefined
        });

        // 近隣クリニックの空き状況を取得
        const nearbyClinicSlots = getNearbyClinicAvailability();

        if (nearbyClinicSlots.length === 0) {
          return {
            content: `申し訳ございません。
${homeStation}駅周辺（1時間圏内）で本日空きのあるクリニックが見つかりませんでした。

明日以降の日程をご検討いただけますか？`,
            showCalendar: true
          };
        }

        return {
          content: `${homeStation}駅${workStation ? `・${workStation}駅` : ""}周辺で、本日空きのあるクリニックをお調べしました！

ご都合の良いクリニック・時間をお選びください。`,
          showNearbyClinicSlots: nearbyClinicSlots
        };
      }
    }

    // 時間選択（「11:00でお願いします」など）- 最優先
    if (this.matchAny(input, ["でお願いします", ":00で", ":30で"])) {
      // 時間を抽出
      const timeMatch = input.match(/(\d{1,2}:\d{2})/);
      const selectedTime = timeMatch ? timeMatch[1] : "ご指定の時間";

      const anesthesiaOptions: MenuOption[] = [
        { id: "with_anesthesia", label: "麻酔クリームあり", value: `${selectedTime}予約確定_麻酔あり`, price: "+¥3,000" },
        { id: "without_anesthesia", label: "麻酔クリームなし", value: `${selectedTime}予約確定_麻酔なし`, price: "" },
      ];

      return {
        content: `${selectedTime}ですね。

強力麻酔クリームはご利用になりますか？
痛みが心配な方におすすめです。`,
        menuOptions: anesthesiaOptions
      };
    }

    // 予約確定（麻酔選択後）→ 顧客確認画面へ
    if (this.matchAny(input, ["予約確定_麻酔あり", "予約確定_麻酔なし"])) {
      const withAnesthesia = input.includes("麻酔あり");
      const timeMatch = input.match(/(\d{1,2}:\d{2})/);
      const selectedTime = timeMatch ? timeMatch[1] : "";

      // 仮の料金計算（実際は選択されたメニューから計算）
      const basePrice = 9800; // 仮：三部位1回
      const anesthesiaPrice = withAnesthesia ? 3000 : 0;
      const totalPrice = basePrice + anesthesiaPrice;

      const bookingInfo: BookingConfirmation = {
        customerId: SAMPLE_CUSTOMER.customerId,
        customerName: SAMPLE_CUSTOMER.customerName,
        customerPhone: SAMPLE_CUSTOMER.customerPhone,
        date: "本日", // 実際は選択された日付
        time: selectedTime,
        menu: "ヒゲ脱毛 三部位 1回", // 実際は選択されたメニュー
        price: totalPrice,
        withAnesthesia,
      };

      return {
        content: `ご予約内容の確認です。`,
        showCustomerConfirm: bookingInfo
      };
    }

    // 顧客情報確認OK → 予約確定・決済画面へ
    if (this.matchAny(input, ["この内容で予約確定"])) {
      // 入力から予約情報を復元（実際はセッション管理）
      const bookingInfo: BookingConfirmation = {
        customerId: SAMPLE_CUSTOMER.customerId,
        customerName: SAMPLE_CUSTOMER.customerName,
        customerPhone: SAMPLE_CUSTOMER.customerPhone,
        date: "本日",
        time: "11:00",
        menu: "ヒゲ脱毛 三部位 1回",
        price: 9800,
        withAnesthesia: false,
      };

      return {
        content: `ご予約が確定しました！`,
        showPayment: bookingInfo
      };
    }

    // 顧客情報変更 → フォーム入力画面へ
    if (this.matchAny(input, ["別の情報で予約"])) {
      return {
        content: `お客様情報を入力してください。`,
        showCustomerForm: true
      };
    }

    // 顧客情報フォーム送信後 → 予約確定・決済画面へ
    if (this.matchAny(input, ["顧客情報入力完了_"])) {
      // 入力から情報を抽出（フォーマット: 顧客情報入力完了_名前_電話番号）
      const parts = input.split("_");
      const customerName = parts[1] || "お客様";
      const customerPhone = parts[2] || "";

      const bookingInfo: BookingConfirmation = {
        customerId: "NEW-" + Date.now().toString().slice(-6),
        customerName,
        customerPhone,
        date: "本日",
        time: "11:00",
        menu: "ヒゲ脱毛 三部位 1回",
        price: 9800,
        withAnesthesia: false,
      };

      return {
        content: `ご予約が確定しました！`,
        showPayment: bookingInfo
      };
    }

    // 決済完了
    if (this.matchAny(input, ["決済完了"])) {
      return {
        content: `✅ お支払いが完了しました！

ご予約・お支払いありがとうございます。

【予約番号】
RES-${Date.now().toString().slice(-8)}

当日は予約時間の5分前までにご来院ください。
ご不明な点がございましたら、このチャットでお気軽にお問い合わせください。

${CLINIC_INFO.name}
💬 チャットサポート対応中`
      };
    }

    // 当日決済を選択
    if (this.matchAny(input, ["当日支払い"])) {
      return {
        content: `✅ ご予約が完了しました！

【予約番号】
RES-${Date.now().toString().slice(-8)}

お支払いは当日、ご来院時にお願いいたします。

当日は予約時間の5分前までにご来院ください。
ご不明な点がございましたら、このチャットでお気軽にお問い合わせください。

${CLINIC_INFO.name}
💬 チャットサポート対応中`
      };
    }

    // ========== キャンセル待ち関連 ==========

    // 満席時間を選択した場合（キャンセル待ち案内）
    if (this.matchAny(input, ["満席時間選択_"])) {
      const timeMatch = input.match(/満席時間選択_(\d{1,2}:\d{2})/);
      const selectedTime = timeMatch ? timeMatch[1] : "ご指定の時間";

      const waitlistOptions: MenuOption[] = [
        { id: "waitlist", label: "⏳ キャンセル待ちに登録", value: `キャンセル待ち登録_${selectedTime}` },
        { id: "other_time", label: "🔄 別の時間を選ぶ", value: "別の時間を選びたい" },
      ];

      return {
        content: `申し訳ございません。
${selectedTime}は現在満席です。

キャンセル待ちに登録されますか？
空きが出次第、お電話にてご連絡いたします。`,
        menuOptions: waitlistOptions
      };
    }

    // キャンセル待ち登録 → 麻酔選択
    if (this.matchAny(input, ["キャンセル待ち登録_"])) {
      const timeMatch = input.match(/キャンセル待ち登録_(\d{1,2}:\d{2})/);
      const selectedTime = timeMatch ? timeMatch[1] : "";

      const anesthesiaOptions: MenuOption[] = [
        { id: "with_anesthesia", label: "麻酔クリームあり", value: `${selectedTime}キャンセル待ち確定_麻酔あり`, price: "+¥3,000" },
        { id: "without_anesthesia", label: "麻酔クリームなし", value: `${selectedTime}キャンセル待ち確定_麻酔なし`, price: "" },
      ];

      return {
        content: `${selectedTime}のキャンセル待ちですね。

強力麻酔クリームはご利用になりますか？
痛みが心配な方におすすめです。`,
        menuOptions: anesthesiaOptions
      };
    }

    // キャンセル待ち確定（麻酔選択後）→ 確認画面
    if (this.matchAny(input, ["キャンセル待ち確定_麻酔あり", "キャンセル待ち確定_麻酔なし"])) {
      const withAnesthesia = input.includes("麻酔あり");
      const timeMatch = input.match(/(\d{1,2}:\d{2})/);
      const selectedTime = timeMatch ? timeMatch[1] : "";

      const waitlistEntry: WaitlistEntry = {
        id: "WL-" + Date.now().toString().slice(-8),
        customerId: SAMPLE_CUSTOMER.customerId,
        customerName: SAMPLE_CUSTOMER.customerName,
        customerPhone: SAMPLE_CUSTOMER.customerPhone,
        date: "本日",
        time: selectedTime,
        menu: "ヒゲ脱毛 三部位 1回",
        position: 1, // 仮：1番目
        withAnesthesia,
      };

      return {
        content: `キャンセル待ち登録内容の確認です。`,
        showWaitlistConfirm: waitlistEntry
      };
    }

    // キャンセル待ち登録確定
    if (this.matchAny(input, ["キャンセル待ち登録確定"])) {
      return {
        content: `✅ キャンセル待ち登録が完了しました！

【待機番号】
WL-${Date.now().toString().slice(-8)}

【待機順位】
#1番目

キャンセルが発生次第、このチャットでご連絡いたします。
通知にお気をつけください。

${CLINIC_INFO.name}
💬 チャットサポート対応中`
      };
    }

    // 別の時間を選ぶ
    if (this.matchAny(input, ["別の時間を選びたい"])) {
      const timeSlots: TimeSlot[] = [
        { time: "11:00", available: true },
        { time: "11:30", available: true },
        { time: "12:00", available: false },
        { time: "12:30", available: true },
        { time: "14:00", available: true },
        { time: "14:30", available: false },
        { time: "15:00", available: true },
        { time: "15:30", available: true },
        { time: "17:00", available: true },
        { time: "17:30", available: true },
        { time: "18:00", available: false },
        { time: "18:30", available: true },
      ];

      return {
        content: `改めて空き時間をお選びください。
黄色の「待」マークは満席ですが、キャンセル待ち登録が可能です。`,
        timeSlots
      };
    }

    // 当日予約の場合 → 住所入力または直接近隣クリニック表示
    if (this.matchAny(input, ["今日の空き時間を見たい"])) {
      const customerAddress = getCustomerAddress();

      // 既に住所が登録されている場合は直接近隣クリニックを表示
      if (customerAddress.homeStation) {
        const nearbyClinicSlots = getNearbyClinicAvailability();

        if (nearbyClinicSlots.length === 0) {
          // 当院の空き状況を表示
          const timeSlots: TimeSlot[] = [
            { time: "11:00", available: true },
            { time: "11:30", available: false },
            { time: "12:00", available: false },
            { time: "14:00", available: true },
            { time: "15:00", available: false },
            { time: "17:00", available: true },
          ];

          return {
            content: `本日の当院（${CLINIC_INFO.name}）の空き状況です。

ご希望の時間をタップしてください。`,
            timeSlots
          };
        }

        return {
          content: `本日の予約ですね！

${customerAddress.homeStation}駅${customerAddress.workStation ? `・${customerAddress.workStation}駅` : ""}周辺で空きのあるクリニックをお調べしました。

ご都合の良いクリニック・時間をお選びください。`,
          showNearbyClinicSlots: nearbyClinicSlots
        };
      }

      // 住所が未登録の場合は住所入力フォームを表示
      return {
        content: `本日の予約ですね！

当院以外にも、お近くのクリニックの空き状況をお調べできます。
最寄り駅を教えていただけますか？`,
        showAddressForm: true
      };
    }

    // 日付選択（カレンダーから「2月5日（水）を予約」など）- 優先
    if (/\d{1,2}月\d{1,2}日/.test(input) || this.matchAny(input, ["明日の空き時間を見たい", "明後日の空き時間を見たい", "今週末の空き時間を見たい", "今週末の"])) {
      const timeSlots: TimeSlot[] = [
        { time: "11:00", available: true },
        { time: "11:30", available: true },
        { time: "12:00", available: false },
        { time: "12:30", available: true },
        { time: "14:00", available: true },
        { time: "14:30", available: false },
        { time: "15:00", available: true },
        { time: "15:30", available: true },
        { time: "17:00", available: true },
        { time: "17:30", available: true },
        { time: "18:00", available: false },
        { time: "18:30", available: true },
      ];

      return {
        content: `ご希望の日程ですね。

その日の空き状況です。
ご希望の時間をタップしてください。`,
        timeSlots
      };
    }

    // ========== 通常のチェック ==========

    // 挨拶
    if (this.matchAny(input, ["こんにちは", "はじめまして", "初めまして", "おはよう", "こんばんは"])) {
      return {
        content: `こんにちは！${CLINIC_INFO.name}へようこそ。

男性専門のヒゲ脱毛クリニックです。

【できること】
・ご予約のご案内
・料金・部位のご案内
・痛み・効果などのご質問

お気軽にお尋ねください！`
      };
    }

    // コース予約確定（日時選択へ）- 部位選択より先にチェック
    if (this.matchAny(input, ["コースで予約", "で予約", "1回で予約", "3回コースで予約", "6回コースで予約"])) {
      const dateOptions: MenuOption[] = [
        { id: "today", label: "今日", value: "今日の空き時間を見たい" },
        { id: "tomorrow", label: "明日", value: "明日の空き時間を見たい" },
        { id: "day_after", label: "明後日", value: "明後日の空き時間を見たい" },
        { id: "this_weekend", label: "今週末", value: "今週末の空き時間を見たい" },
      ];

      return {
        content: `承知いたしました！

ご希望の日程をお選びください。
カレンダーから日付を選ぶこともできます。

※強力麻酔クリーム（+¥3,000/回）もご利用いただけます。`,
        menuOptions: dateOptions,
        showCalendar: true
      };
    }

    // コース未消化分の消化を選択
    if (this.matchAny(input, ["未消化コースを消化", "コース消化"])) {
      const dateOptions: MenuOption[] = [
        { id: "today", label: "今日", value: "今日の空き時間を見たい" },
        { id: "tomorrow", label: "明日", value: "明日の空き時間を見たい" },
        { id: "day_after", label: "明後日", value: "明後日の空き時間を見たい" },
        { id: "this_weekend", label: "今週末", value: "今週末の空き時間を見たい" },
      ];

      return {
        content: `未消化コースの予約ですね！
追加料金なしでご利用いただけます。

ご希望の日程をお選びください。
カレンダーから日付を選ぶこともできます。

※強力麻酔クリーム（+¥3,000/回）もご利用いただけます。`,
        menuOptions: dateOptions,
        showCalendar: true
      };
    }

    // リマインダーからの「予約する」ボタン
    if (input === "予約する") {
      // 未消化コースをチェック
      const unusedCourses = getUnusedCourses();

      // 基本メニューオプション
      const baseMenuOptions: MenuOption[] = [
        { id: "three", label: "三部位（鼻下・アゴ・アゴ下）", value: "三部位を希望", price: "¥9,800〜 ← 一番人気！" },
        { id: "cheek", label: "もみあげ・頬", value: "もみあげ・頬を希望", price: "¥8,800〜" },
        { id: "neck", label: "首", value: "首を希望", price: "¥6,800〜" },
        { id: "three_cheek", label: "三部位 + もみあげ・頬", value: "三部位+もみあげ・頬を希望", price: "¥16,800〜" },
        { id: "three_neck", label: "三部位 + 首", value: "三部位+首を希望", price: "¥14,800〜" },
        { id: "cheek_neck", label: "もみあげ・頬 + 首", value: "もみあげ・頬+首を希望", price: "¥13,800〜" },
        { id: "all", label: "全部位", value: "全部位を希望", price: "¥19,800〜 ← しっかり脱毛" },
      ];

      // 未消化コースがある場合は一番上に追加
      let menuOptions: MenuOption[] = baseMenuOptions;

      if (unusedCourses.length > 0) {
        const courseOptions: MenuOption[] = unusedCourses.map((course, idx) => ({
          id: `unused_${idx}`,
          label: `🎫 ${course.courseName}（残り${course.remainingSessions}回）`,
          value: "未消化コースを消化",
          price: "← おすすめ！追加料金なし"
        }));
        menuOptions = [...courseOptions, ...baseMenuOptions];
      }

      return {
        content: `ありがとうございます！

それでは、メニューをお選びください。`,
        menuOptions
      };
    }

    // 「後で検討する」ボタン
    if (input === "後で検討する") {
      return {
        content: `かしこまりました。

ご都合の良い時にいつでもお声がけください。
下のボタンからもご予約いただけます。`,
        quickReplies: ["予約したい", "料金を見たい", "営業時間は？"]
      };
    }

    // 予約したい（部位選択へ）- 施術間隔チェック付き
    if (this.matchAny(input, ["予約したい", "よやくしたい", "取りたい", "行きたい", "受けたい", "申し込み"])) {
      // 施術間隔チェック
      const intervalCheck = checkTreatmentInterval();

      // 未消化コースをチェック
      const unusedCourses = getUnusedCourses();

      // 基本メニューオプション
      const baseMenuOptions: MenuOption[] = [
        { id: "three", label: "三部位（鼻下・アゴ・アゴ下）", value: "三部位を希望", price: "¥9,800〜 ← 一番人気！" },
        { id: "cheek", label: "もみあげ・頬", value: "もみあげ・頬を希望", price: "¥8,800〜" },
        { id: "neck", label: "首", value: "首を希望", price: "¥6,800〜" },
        { id: "three_cheek", label: "三部位 + もみあげ・頬", value: "三部位+もみあげ・頬を希望", price: "¥16,800〜" },
        { id: "three_neck", label: "三部位 + 首", value: "三部位+首を希望", price: "¥14,800〜" },
        { id: "cheek_neck", label: "もみあげ・頬 + 首", value: "もみあげ・頬+首を希望", price: "¥13,800〜" },
        { id: "all", label: "全部位", value: "全部位を希望", price: "¥19,800〜 ← しっかり脱毛" },
      ];

      // 未消化コースがある場合は一番上に追加
      let menuOptions: MenuOption[] = baseMenuOptions;
      let unusedCourseMessage = "";

      if (unusedCourses.length > 0) {
        const courseOptions: MenuOption[] = unusedCourses.map((course, idx) => ({
          id: `unused_${idx}`,
          label: `🎫 ${course.courseName}（残り${course.remainingSessions}回）`,
          value: "未消化コースを消化",
          price: "← おすすめ！追加料金なし"
        }));
        menuOptions = [...courseOptions, ...baseMenuOptions];
        unusedCourseMessage = `\n🎫 未消化のコースがあります！\n追加料金なしでご利用いただけます。\n`;
      }

      // 間隔が短い場合は警告を表示
      if (intervalCheck.isWarning && intervalCheck.daysSinceLast !== null) {
        return {
          content: `ご予約ですね。ありがとうございます！${unusedCourseMessage}

⚠️ 前回の施術から${intervalCheck.daysSinceLast}日です。
効果を最大限に発揮するため、4週間（28日）以上の間隔をおすすめしております。

それでもご予約を続ける場合は、メニューをお選びください。`,
          menuOptions,
          showIntervalWarning: true
        };
      }

      return {
        content: `ご予約ですね。ありがとうございます！${unusedCourseMessage}

メニューをお選びください。`,
        menuOptions
      };
    }

    // 三部位
    if (this.matchAny(input, ["三部位", "3部位", "鼻下", "アゴ", "あご"])) {
      const courseOptions: MenuOption[] = [
        { id: "three_1", label: "1回", value: "三部位1回コースで予約", price: "¥9,800" },
        { id: "three_3", label: "3回コース", value: "三部位3回コースで予約", price: "¥26,400（1回あたり¥8,800）" },
        { id: "three_6", label: "6回コース ← おすすめ", value: "三部位6回コースで予約", price: "¥48,000（1回あたり¥8,000）" },
      ];
      return {
        content: `三部位（鼻下・アゴ・アゴ下）ですね。
一番人気のエリアです！

コース回数をお選びください。`,
        menuOptions: courseOptions
      };
    }

    // 全部位
    if (this.matchAny(input, ["全部位", "全部", "フル", "ぜんぶ"])) {
      const courseOptions: MenuOption[] = [
        { id: "all_1", label: "1回", value: "全部位1回コースで予約", price: "¥19,800" },
        { id: "all_3", label: "3回コース", value: "全部位3回コースで予約", price: "¥53,400（1回あたり¥17,800）" },
        { id: "all_6", label: "6回コース ← 最もお得", value: "全部位6回コースで予約", price: "¥96,000（1回あたり¥16,000）" },
      ];
      return {
        content: `全部位（三部位+もみあげ・頬+首）ですね。
顔全体をしっかり脱毛したい方におすすめです！

コース回数をお選びください。`,
        menuOptions: courseOptions
      };
    }

    // もみあげ・頬
    if (this.matchAny(input, ["もみあげ", "頬", "ほほ"])) {
      const courseOptions: MenuOption[] = [
        { id: "cheek_1", label: "1回", value: "もみあげ・頬1回で予約", price: "¥8,800" },
        { id: "cheek_3", label: "3回コース", value: "もみあげ・頬3回コースで予約", price: "¥23,400" },
        { id: "cheek_6", label: "6回コース", value: "もみあげ・頬6回コースで予約", price: "¥42,000" },
      ];
      return {
        content: `もみあげ・頬エリアですね。

コース回数をお選びください。
※三部位とセットの「三部位+もみあげ・頬」もおすすめです。`,
        menuOptions: courseOptions
      };
    }

    // 首
    if (this.matchAny(input, ["首", "くび"])) {
      const courseOptions: MenuOption[] = [
        { id: "neck_1", label: "1回", value: "首1回で予約", price: "¥6,800" },
        { id: "neck_3", label: "3回コース", value: "首3回コースで予約", price: "¥18,000" },
        { id: "neck_6", label: "6回コース", value: "首6回コースで予約", price: "¥32,400" },
      ];
      return {
        content: `首エリアですね。
襟元の清潔感がアップします。

コース回数をお選びください。
※三部位とセットの「三部位+首」もおすすめです。`,
        menuOptions: courseOptions
      };
    }

    // 料金一覧
    if (this.matchAny(input, ["料金一覧", "価格一覧", "メニュー一覧", "全部の料金"])) {
      return { content: getPriceListText() };
    }

    // 料金全般
    if (this.matchAny(input, ["料金", "値段", "いくら", "価格"])) {
      const popularMenus = getPopularMenus()
        .map((m) => `・${m.name.replace("ヒゲ脱毛 ", "")}：${formatPrice(m.price, m.priceNote)}`)
        .join("\n");

      return {
        content: `【人気コースの料金】

${popularMenus}

「料金一覧」で全部位・全コースの料金をご確認いただけます。
強力麻酔クリームは+¥3,000/回です。`
      };
    }

    // 麻酔について
    if (this.matchAny(input, ["麻酔", "痛くない", "痛み軽減"])) {
      return {
        content: `強力麻酔クリームをご用意しております。

【強力麻酔クリーム】
料金：¥3,000/回
効果：施術の痛みを大幅に軽減

施術の30分前に塗布します。
痛みが心配な方には特におすすめです。

予約時に「麻酔あり」とお伝えください。`
      };
    }

    // 回数・効果
    if (this.matchAny(input, ["何回", "効果", "回数", "どのくらい"])) {
      return {
        content: `【効果の目安】

・1回：お試しに最適。効果を実感。
・3回：ヒゲが薄くなり、髭剃りが楽に。
・6回：しっかり効果を実感。1回あたり最安値。

個人差はありますが、3回目あたりから
「髭剃りの頻度が減った」と実感される方が多いです。

しっかり効果を出したい方には6回コースがおすすめです！`
      };
    }

    // 営業時間
    if (this.matchAny(input, ["営業時間", "何時から", "何時まで", "休み", "定休"])) {
      return {
        content: `${BUSINESS_HOURS_TEXT}

木曜は21時まで営業しているので、
お仕事帰りにも通いやすいですよ！

ご予約をご希望の場合は、ご希望の日時をお伝えください。`
      };
    }

    // アクセス・場所
    if (this.matchAny(input, ["場所", "どこ", "アクセス", "住所", "行き方"])) {
      return {
        content: `【アクセス】
${CLINIC_INFO.address}

JR新宿駅西口より徒歩5分です。

💬 ご不明な点はこのチャットでお気軽にどうぞ！`
      };
    }

    // FAQ検索
    const faq = findFAQByKeyword(input);
    if (faq) {
      return { content: faq.answer };
    }

    // 肯定的な返事
    if (this.matchAny(input, ["はい", "お願い", "それで", "いい", "ok", "オーケー", "確定"])) {
      const dateOptions: MenuOption[] = [
        { id: "today", label: "今日", value: "今日の空き時間を見たい" },
        { id: "tomorrow", label: "明日", value: "明日の空き時間を見たい" },
        { id: "day_after", label: "明後日", value: "明後日の空き時間を見たい" },
        { id: "this_weekend", label: "今週末", value: "今週末の空き時間を見たい" },
      ];

      return {
        content: `承知いたしました！

ご希望の日程をお選びください。
カレンダーから日付を選ぶこともできます。`,
        menuOptions: dateOptions,
        showCalendar: true
      };
    }

    // カウンセリング
    if (this.matchAny(input, ["カウンセリング", "相談", "初めて", "初回"])) {
      const dateOptions: MenuOption[] = [
        { id: "today", label: "今日", value: "今日の空き時間を見たい" },
        { id: "tomorrow", label: "明日", value: "明日の空き時間を見たい" },
        { id: "day_after", label: "明後日", value: "明後日の空き時間を見たい" },
        { id: "this_weekend", label: "今週末", value: "今週末の空き時間を見たい" },
      ];

      return {
        content: `無料カウンセリングのご予約ですね！

肌質やヒゲの状態を確認し、
最適なプランをご提案いたします。
当日施術も可能です。

ご希望の日程をお選びください。
カレンダーから日付を選ぶこともできます。`,
        menuOptions: dateOptions,
        showCalendar: true
      };
    }

    // デフォルト
    return {
      content: `申し訳ございません、ご質問の内容を理解できませんでした。

以下のようにお尋ねください：
・「予約したい」→ ご予約のご案内
・「料金を教えて」→ 料金のご案内
・「三部位の料金」→ 部位別料金
・「麻酔について」→ 麻酔のご案内
・「何回で効果出る？」→ 効果の目安

他にご不明な点がございましたら、このチャットでお気軽にお尋ねください！`
    };
  }

  private matchAny(input: string, keywords: string[]): boolean {
    return keywords.some((keyword) => input.includes(keyword.toLowerCase()));
  }

  configure(_config: AIProviderConfig): void {
    // モックでは設定不要
  }
}

export const mockProvider = new MockAIProvider();
