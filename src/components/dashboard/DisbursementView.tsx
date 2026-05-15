"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Loan } from "@/types";
import { AxiosError } from "axios";

export default function DisbursementView() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get("/dashboard/disbursement");
      setLoans(res.data.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to fetch disbursement queue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async (id: string) => {
    if (!window.confirm("Confirm releasing funds to the borrower's account? This action cannot be undone.")) return;
    
    setActionLoading(id);
    try {
      await api.patch(`/loans/${id}/disburse`);
      setLoans((prev) => prev.filter((loan) => loan._id !== id));
    } catch (err) {
      alert("Failed to disburse loan");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading queue...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Disbursement Queue</h2>
        <p className="text-slate-500 mt-1">Sanctioned loans waiting for funds to be released.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No sanctioned loans pending disbursement.
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
              
              <div className="flex-1 flex flex-col md:flex-row gap-8 w-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Disbursement Amount</p>
                    <p className="text-2xl font-bold text-slate-800">₹{loan.loanConfig.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-8">
                  <p className="text-xs text-slate-400 font-semibold uppercase">Borrower Info</p>
                  <p className="font-medium text-slate-900 mt-1">{loan.personalDetails.fullName}</p>
                  <p className="text-sm text-slate-600">PAN: {loan.personalDetails.pan}</p>
                  <p className="text-sm text-slate-500 text-xs mt-1">Sanctioned: {new Date(loan.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <button 
                  onClick={() => handleDisburse(loan._id)}
                  disabled={actionLoading === loan._id}
                  className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === loan._id ? "Processing..." : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Mark as Disbursed
                    </>
                  )}
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}