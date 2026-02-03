"use client";

import { useParams } from "next/navigation";
import { findCustomerById, getCustomerContracts, getCustomerHistory } from "@/data/customers";
import CustomerDetail from "@/components/admin/CustomerDetail";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const customer = findCustomerById(customerId);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">顧客が見つかりません</p>
      </div>
    );
  }

  const contracts = getCustomerContracts(customerId);
  const history = getCustomerHistory(customerId);

  return (
    <CustomerDetail
      customer={customer}
      contracts={contracts}
      history={history}
    />
  );
}
