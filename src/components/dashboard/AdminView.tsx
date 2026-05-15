"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Loan } from "@/types";
import { AxiosError } from "axios";

interface AdminStats {
  totalLoans: number;
  activeLoans: number;
  totalDisbursedAmount: number;
}

export default function AdminView() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get("/dashboard/admin");
      setStats(res.data.stats);
      setRecentLoans(res.data.recentLoans);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to fetch admin overview");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading admin overview...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Overview</h2>
        <p className="text-slate-500 mt-1">High-level view of system metrics and recent activities.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-slate-800">{stats?.totalLoans}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Active Loans (Disbursed)</p>
          <p className="text-3xl font-bold text-slate-800">{stats?.activeLoans}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-l-4 border-l-purple-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Disbursed Volume</p>
          <p className="text-3xl font-bold text-slate-800">₹{stats?.totalDisbursedAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Loans Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-800 uppercase text-xs font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Borrower Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLoans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No applications found.</td>
                </tr>
              ) : (
                recentLoans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{loan.personalDetails.fullName}</td>
                    <td className="px-6 py-4">₹{loan.loanConfig.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        loan.status === 'Applied' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        loan.status === 'Sanctioned' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        loan.status === 'Disbursed' ? 'bg-green-50 text-green-700 border-green-200' :
                        loan.status === 'Closed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}