"use client";

import Link from "next/link";
import { Customer } from "@/types/customer";
import { getClinicNameById, getCustomerContracts } from "@/data/customers";

interface CustomerListProps {
  customers: Customer[];
}

export default function CustomerList({ customers }: CustomerListProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              診察券番号
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              氏名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              電話番号
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              契約状況
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最終来店
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              詳細
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => {
            const contracts = getCustomerContracts(customer.id);
            const activeContracts = contracts.filter(
              (c) => c.remainingSessions > 0
            );

            return (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-sm text-gray-900">
                    {customer.patientNumber}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </p>
                    {customer.nameKana && (
                      <p className="text-xs text-gray-500">{customer.nameKana}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {customer.phone}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activeContracts.length > 0 ? (
                    <div className="space-y-1">
                      {activeContracts.map((contract) => (
                        <span
                          key={contract.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          残{contract.remainingSessions}回
                        </span>
                      ))}
                    </div>
                  ) : contracts.length > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      完了
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      都度払い
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.lastVisit.date}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getClinicNameById(customer.lastVisit.clinicId)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細 →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {customers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          顧客が見つかりません
        </div>
      )}
    </div>
  );
}
