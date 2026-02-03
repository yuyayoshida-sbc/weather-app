"use client";

import { useState } from "react";
import Link from "next/link";
import { Customer } from "@/types/customer";
import { TreatmentHistory } from "@/types/reservation";
import { CourseContract } from "@/data/history";
import { getClinicNameById } from "@/data/customers";

interface CustomerDetailProps {
  customer: Customer;
  contracts: CourseContract[];
  history: TreatmentHistory[];
}

type TabType = "info" | "contracts" | "history" | "feedback";

export default function CustomerDetail({
  customer,
  contracts,
  history,
}: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("info");

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "info", label: "基本情報", icon: "👤" },
    { id: "contracts", label: "契約内容", icon: "📋" },
    { id: "history", label: "施術履歴", icon: "📜" },
    { id: "feedback", label: "フィードバック", icon: "⭐" },
  ];

  const feedbackHistory = history.filter((h) => h.feedback);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="text-gray-500 hover:text-gray-700"
          >
            ← 戻る
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            <p className="text-sm text-gray-500 font-mono">
              {customer.patientNumber}
            </p>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium relative transition-colors
                  ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* 基本情報タブ */}
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  個人情報
                </h3>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">氏名</dt>
                    <dd className="text-gray-900">{customer.name}</dd>
                  </div>
                  {customer.nameKana && (
                    <div className="flex">
                      <dt className="w-24 text-gray-500 text-sm">フリガナ</dt>
                      <dd className="text-gray-900">{customer.nameKana}</dd>
                    </div>
                  )}
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">性別</dt>
                    <dd className="text-gray-900">
                      {customer.gender === "male" ? "男性" : "女性"}
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">生年月日</dt>
                    <dd className="text-gray-900">
                      {customer.birthDate}（{customer.age}歳）
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  連絡先
                </h3>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">電話番号</dt>
                    <dd className="text-gray-900">{customer.phone}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">メール</dt>
                    <dd className="text-gray-900">{customer.email}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">住所</dt>
                    <dd className="text-gray-900">
                      {customer.address.postalCode && (
                        <span className="block text-xs text-gray-500">
                          〒{customer.address.postalCode}
                        </span>
                      )}
                      {customer.address.prefecture}
                      {customer.address.city}
                      {customer.address.street}
                      {customer.address.building && (
                        <span className="block">{customer.address.building}</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">
                  来店情報
                </h3>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">初来店</dt>
                    <dd className="text-gray-900">
                      {customer.firstVisit.date}
                      <span className="text-gray-500 ml-2">
                        ({getClinicNameById(customer.firstVisit.clinicId)})
                      </span>
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">最終来店</dt>
                    <dd className="text-gray-900">
                      {customer.lastVisit.date}
                      <span className="text-gray-500 ml-2">
                        ({getClinicNameById(customer.lastVisit.clinicId)})
                      </span>
                    </dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-gray-500 text-sm">施術回数</dt>
                    <dd className="text-gray-900">{history.length}回</dd>
                  </div>
                </dl>
              </div>

              {(customer.address.homeStation || customer.address.workStation) && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">
                    最寄り駅
                  </h3>
                  <dl className="space-y-3">
                    {customer.address.homeStation && (
                      <div className="flex">
                        <dt className="w-24 text-gray-500 text-sm">自宅</dt>
                        <dd className="text-gray-900">
                          {customer.address.homeStation}駅
                        </dd>
                      </div>
                    )}
                    {customer.address.workStation && (
                      <div className="flex">
                        <dt className="w-24 text-gray-500 text-sm">職場</dt>
                        <dd className="text-gray-900">
                          {customer.address.workStation}駅
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}

          {/* 契約内容タブ */}
          {activeTab === "contracts" && (
            <div className="space-y-4">
              {contracts.length > 0 ? (
                contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">
                        {contract.courseName}
                      </h4>
                      {contract.remainingSessions > 0 ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          アクティブ
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          完了
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">総回数</p>
                        <p className="font-medium">{contract.totalSessions}回</p>
                      </div>
                      <div>
                        <p className="text-gray-500">使用済み</p>
                        <p className="font-medium">{contract.usedSessions}回</p>
                      </div>
                      <div>
                        <p className="text-gray-500">残り</p>
                        <p className="font-medium text-green-600">
                          {contract.remainingSessions}回
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">有効期限</p>
                        <p className="font-medium">{contract.expiryDate}</p>
                      </div>
                    </div>
                    {/* 進捗バー */}
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${
                              (contract.usedSessions / contract.totalSessions) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        進捗:{" "}
                        {Math.round(
                          (contract.usedSessions / contract.totalSessions) * 100
                        )}
                        %
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  コース契約がありません（都度払い）
                </div>
              )}
            </div>
          )}

          {/* 施術履歴タブ */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          日付
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          メニュー
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          クリニック
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          レーザー
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          担当
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          麻酔
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {h.date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {h.menu}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {h.clinicName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {h.laserType}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {h.nurseName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {h.withAnesthesia ? (
                              <span className="text-blue-600">あり</span>
                            ) : (
                              <span className="text-gray-400">なし</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  施術履歴がありません
                </div>
              )}
            </div>
          )}

          {/* フィードバックタブ */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              {feedbackHistory.length > 0 ? (
                feedbackHistory.map((h) => (
                  <div
                    key={h.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{h.date}</p>
                        <p className="text-sm text-gray-500">{h.menu}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 text-lg">
                          {"★".repeat(h.feedback!.satisfactionRating)}
                          {"☆".repeat(5 - h.feedback!.satisfactionRating)}
                        </div>
                      </div>
                    </div>

                    {h.feedback!.hasLeakage && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-700 text-sm font-medium">
                          ⚠️ 照射漏れ報告あり
                        </p>
                        {h.feedback!.leakageDetails && (
                          <p className="text-red-600 text-sm mt-1">
                            {h.feedback!.leakageDetails}
                          </p>
                        )}
                      </div>
                    )}

                    {h.feedback!.comment && (
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-gray-700 text-sm">
                          {h.feedback!.comment}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      回答日: {new Date(h.feedback!.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  フィードバックがありません
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
