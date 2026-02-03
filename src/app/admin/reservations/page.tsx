"use client";

import { useState } from "react";

// ダミー予約データ
const DUMMY_RESERVATIONS = [
  {
    id: "RES-001",
    customerId: "cust-001",
    customerName: "SBC太郎",
    patientNumber: "SBC-123456",
    date: "2025-02-04",
    time: "11:00",
    menu: "ヒゲ脱毛 三部位 6回コース（5回目）",
    clinic: "新宿院",
    status: "confirmed" as const,
    withAnesthesia: true,
  },
  {
    id: "RES-002",
    customerId: "cust-002",
    customerName: "山田一郎",
    patientNumber: "SBC-234567",
    date: "2025-02-04",
    time: "14:00",
    menu: "ヒゲ脱毛 全部位 6回コース（3回目）",
    clinic: "渋谷院",
    status: "confirmed" as const,
    withAnesthesia: true,
  },
  {
    id: "RES-003",
    customerId: "cust-003",
    customerName: "鈴木健太",
    patientNumber: "SBC-345678",
    date: "2025-02-05",
    time: "15:00",
    menu: "ヒゲ脱毛 三部位 1回",
    clinic: "池袋院",
    status: "pending" as const,
    withAnesthesia: false,
  },
  {
    id: "RES-004",
    customerId: "cust-005",
    customerName: "佐藤大輔",
    patientNumber: "SBC-567890",
    date: "2025-02-05",
    time: "17:00",
    menu: "ヒゲ脱毛 三部位 6回コース（1回目）",
    clinic: "渋谷院",
    status: "confirmed" as const,
    withAnesthesia: true,
  },
];

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

const STATUS_LABELS: Record<ReservationStatus, { label: string; color: string }> = {
  pending: { label: "仮予約", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "確定", color: "bg-green-100 text-green-800" },
  cancelled: { label: "キャンセル", color: "bg-red-100 text-red-800" },
  completed: { label: "完了", color: "bg-gray-100 text-gray-600" },
};

export default function ReservationsPage() {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReservations = DUMMY_RESERVATIONS.filter((res) => {
    if (dateFilter && res.date !== dateFilter) return false;
    if (statusFilter !== "all" && res.status !== statusFilter) return false;
    return true;
  });

  // 日付でグループ化
  const groupedByDate = filteredReservations.reduce((acc, res) => {
    if (!acc[res.date]) {
      acc[res.date] = [];
    }
    acc[res.date].push(res);
    return acc;
  }, {} as Record<string, typeof DUMMY_RESERVATIONS>);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">予約一覧</h2>
          <p className="text-sm text-gray-500 mt-1">
            本日の予約: {DUMMY_RESERVATIONS.filter((r) => r.date === "2025-02-04").length}件
          </p>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ステータス
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="pending">仮予約</option>
            <option value="confirmed">確定</option>
            <option value="cancelled">キャンセル</option>
            <option value="completed">完了</option>
          </select>
        </div>
        {(dateFilter || statusFilter !== "all") && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setDateFilter("");
                setStatusFilter("all");
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {/* 予約リスト */}
      <div className="space-y-6">
        {Object.entries(groupedByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, reservations]) => (
            <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  {date}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({reservations.length}件)
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {reservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((res) => (
                    <div
                      key={res.id}
                      className="p-4 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <p className="text-xl font-bold text-gray-900">
                            {res.time}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {res.customerName}
                            <span className="ml-2 text-sm font-normal text-gray-500 font-mono">
                              {res.patientNumber}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">{res.menu}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {res.clinic}
                            </span>
                            {res.withAnesthesia && (
                              <span className="text-xs text-blue-600">
                                麻酔あり
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            STATUS_LABELS[res.status].color
                          }`}
                        >
                          {STATUS_LABELS[res.status].label}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {filteredReservations.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          予約が見つかりません
        </div>
      )}
    </div>
  );
}
