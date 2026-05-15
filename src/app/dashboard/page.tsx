"use client";

import { useAuth } from "@/store/AuthContext";
import { UserRole } from "@/types";
import SalesView from "@/components/dashboard/SalesView";
import SanctionView from "@/components/dashboard/SanctionView";
import DisbursementView from "@/components/dashboard/DisbursementView";
import CollectionView from "@/components/dashboard/CollectionView";
import AdminView from "@/components/dashboard/AdminView";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {user.role === UserRole.SALES && <SalesView />}
      {user.role === UserRole.SANCTION && <SanctionView />}
      {user.role === UserRole.DISBURSEMENT && <DisbursementView />}
      {user.role === UserRole.COLLECTION && <CollectionView />}
      {user.role === UserRole.ADMIN && <AdminView />}
    </div>
  );
}