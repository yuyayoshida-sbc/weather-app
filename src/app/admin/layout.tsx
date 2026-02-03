"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/customers", label: "顧客一覧", icon: "👥" },
  { href: "/admin/reservations", label: "予約一覧", icon: "📅" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/admin/customers" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <h1 className="font-bold text-lg">SBC Men's Flash</h1>
                <p className="text-xs text-gray-300">管理画面</p>
              </div>
            </Link>
            <Link
              href="/reservation"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              顧客側へ →
            </Link>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative
                    ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
