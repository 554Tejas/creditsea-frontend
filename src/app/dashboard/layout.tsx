"use client";

import { useAuth } from "@/store/AuthContext";
import { UserRole } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role === UserRole.BORROWER) {
        // Enforce strict frontend RBAC - Borrowers cannot see the dashboard
        router.push("/apply");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="p-8 text-center">Loading Dashboard...</div>;
  if (user.role === UserRole.BORROWER) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold tracking-wider text-primary-400">LMS ADMIN</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase">{user.role} PORTAL</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className={`block px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            Overview
          </Link>
          {/* Add more nav links here if expanding beyond the single-page view */}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="mb-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <button onClick={logout} className="w-full py-2 bg-slate-800 hover:bg-red-600 text-white text-sm rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Operations Dashboard</h1>
          <div className="md:hidden flex items-center gap-4">
            <span className="text-sm font-medium">{user.role}</span>
            <button onClick={logout} className="text-sm text-red-500 font-medium">Logout</button>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}