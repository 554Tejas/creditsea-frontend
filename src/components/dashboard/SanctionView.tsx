"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Loan, LoanStatus } from "@/types";
import { AxiosError } from "axios";

export default function SanctionView() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Rejection Modal State
  const [rejectingLoanId, setRejectingLoanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get("/dashboard/sanction");
      setLoans(res.data.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to fetch sanction queue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Are you sure you want to sanction this loan?")) return;
    
    setActionLoading(id);
    try {
      await api.patch(`/loans/${id}/approve`);
      // Remove from queue
      setLoans((prev) => prev.filter((loan) => loan._id !== id));
    } catch (err) {
      alert("Failed to approve loan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingLoanId || !rejectReason.trim()) return;
    
    setActionLoading(rejectingLoanId);
    try {
      await api.patch(`/loans/${rejectingLoanId}/reject`, { reason: rejectReason });
      setLoans((prev) => prev.filter((loan) => loan._id !== rejectingLoanId));
      setRejectingLoanId(null);
      setRejectReason("");
    } catch (err) {
      alert("Failed to reject loan");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div>Loading queue...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Sanction Queue</h2>
        <p className="text-slate-500 mt-1">Review applied loans and process approvals or rejections.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No applications pending sanction.
          </div>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Borrower Details</p>
                  <p className="font-medium text-slate-900 mt-1">{loan.personalDetails.fullName}</p>
                  <p className="text-sm text-slate-600">PAN: {loan.personalDetails.pan}</p>
                  <p className="text-sm text-slate-600">Salary: ₹{loan.personalDetails.monthlySalary.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Loan Config</p>
                  <p className="font-medium text-primary-600 mt-1">₹{loan.loanConfig.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Tenure: {loan.loanConfig.tenureDays} Days</p>
                  <p className="text-sm text-slate-600">Interest: 12% p.a.</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Documents</p>
                  {loan.salarySlipUrl ? (
                    <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${loan.salarySlipUrl}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      View Salary Slip
                    </a>
                  ) : (
                    <span className="text-sm text-red-500 mt-1">No Document</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <button 
                  onClick={() => setRejectingLoanId(loan._id)}
                  disabled={actionLoading === loan._id}
                  className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleApprove(loan._id)}
                  disabled={actionLoading === loan._id}
                  className="flex-1 md:flex-none px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {actionLoading === loan._id ? "Processing..." : "Approve"}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectingLoanId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Reject Application</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide a reason for rejecting this loan application.</p>
            <textarea
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none mb-4"
              rows={3}
              placeholder="E.g., Credit score too low, Salary slip unclear..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button onClick={() => {setRejectingLoanId(null); setRejectReason("");}} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border">Cancel</button>
              <button onClick={handleRejectSubmit} disabled={!rejectReason.trim() || actionLoading === rejectingLoanId} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50">
                {actionLoading === rejectingLoanId ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}