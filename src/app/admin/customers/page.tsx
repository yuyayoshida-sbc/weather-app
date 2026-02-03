"use client";

import { useState, useMemo } from "react";
import { searchCustomers, getAllCustomers } from "@/data/customers";
import CustomerList from "@/components/admin/CustomerList";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return getAllCustomers();
    }
    return searchCustomers(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">顧客一覧</h2>
          <p className="text-sm text-gray-500 mt-1">
            登録顧客数: {getAllCustomers().length}名
          </p>
        </div>
      </div>

      {/* 検索バー */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="名前、電話番号、診察券番号で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
              text-gray-900 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 顧客リスト */}
      <CustomerList customers={filteredCustomers} />
    </div>
  );
}
