"use client";

import { useState } from "react";
import { FAQ_DATA, FAQItem, findFAQByKeyword } from "@/data/faq";
import { CLINIC_INFO } from "@/data/clinic";

export default function FAQContainer() {
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<FAQItem | null>(null);
  const [noResult, setNoResult] = useState(false);

  // 質問ボタンクリック
  const handleFAQSelect = (faq: FAQItem) => {
    setSelectedFAQ(faq);
    setSearchResult(null);
    setNoResult(false);
    setSearchQuery("");
  };

  // 検索実行
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const result = findFAQByKeyword(searchQuery);
    if (result) {
      setSearchResult(result);
      setSelectedFAQ(null);
      setNoResult(false);
    } else {
      setSearchResult(null);
      setSelectedFAQ(null);
      setNoResult(true);
    }
  };

  // Enterキーで検索
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 表示するFAQ（選択されたものまたは検索結果）
  const displayFAQ = selectedFAQ || searchResult;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg">
          ❓
        </div>
        <div>
          <h1 className="font-semibold text-gray-800">よくある質問</h1>
          <p className="text-xs text-gray-500">{CLINIC_INFO.name}</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* よくある質問ボタンリスト */}
        <section>
          <h2 className="text-sm font-medium text-gray-600 mb-3">
            タップして質問を選択
          </h2>
          <div className="flex flex-wrap gap-2">
            {FAQ_DATA.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFAQSelect(faq)}
                className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                  selectedFAQ?.id === faq.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {faq.question.replace("？", "")}
              </button>
            ))}
          </div>
        </section>

        {/* 検索エリア */}
        <section className="pt-2">
          <h2 className="text-sm font-medium text-gray-600 mb-3">
            または、キーワードで検索
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="例：痛み、料金、キャンセル..."
              className="flex-1 px-4 py-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              検索
            </button>
          </div>
        </section>

        {/* 回答表示エリア */}
        {displayFAQ && (
          <section className="pt-2">
            <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  Q
                </span>
                <h3 className="font-medium text-gray-800 pt-1">
                  {displayFAQ.question}
                </h3>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">
                  A
                </span>
                <p className="text-sm text-gray-700 leading-relaxed pt-1">
                  {displayFAQ.answer}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 検索結果なし */}
        {noResult && (
          <section className="pt-2">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center">
              <p className="text-gray-500 text-sm mb-2">
                「{searchQuery}」に該当する質問が見つかりませんでした
              </p>
              <p className="text-gray-400 text-xs">
                上のボタンから質問を選択するか、
                <br />
                別のキーワードで検索してください
              </p>
            </div>
          </section>
        )}

        {/* 初期状態のヒント */}
        {!displayFAQ && !noResult && (
          <section className="pt-4">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center">
              <p className="text-blue-600 text-sm">
                上のボタンをタップするか、
                <br />
                キーワードを入力して検索してください
              </p>
            </div>
          </section>
        )}

        {/* お問い合わせ案内 */}
        <section className="pt-2 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              お探しの内容が見つからない場合
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
