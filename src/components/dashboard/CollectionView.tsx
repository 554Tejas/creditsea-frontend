"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { Loan } from "@/types";
import { AxiosError } from "axios";

export default function CollectionView() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Payment Modal State
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [utr, setUtr] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get("/dashboard/collection");
      setLoans(res.data.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to fetch collection queue");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) return;

    setPaymentError("");
    setPaymentLoading(true);

    try {
      const res = await api.post("/payments", {
        loanId: activeLoan._id,
        utr,
        amount: Number(amount),
        paymentDate
      });

      // Update local state based on response
      const { amountPaid, loanStatus } = res.data.data;
      
      setLoans((prev) => 
        prev.map((l) => {
          if (l._id === activeLoan._id) {
            return { ...l, amountPaid, status: loanStatus };
          }
          return l;
        }).filter(l => l.status === "Disbursed") // Remove closed loans from view
      );

      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setPaymentError(err.response?.data?.error || "Failed to record payment");
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const closeModal = () => {
    setActiveLoan(null);
    setUtr("");
    setAmount("");
    setPaymentError("");
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  if (loading) return <div>Loading active loans...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Collection Queue</h2>
        <p className="text-slate-500 mt-1">Manage active loans and record borrower repayments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loans.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No active loans requiring collection.
          </div>
        ) : (
          loans.map((loan) => {
            const outstanding = loan.loanConfig.totalRepayment - loan.amountPaid;
            const progress = (loan.amountPaid / loan.loanConfig.totalRepayment) * 100;

            return (
              <div key={loan._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{loan.personalDetails.fullName}</h3>
                    <p className="text-xs text-slate-500">Loan ID: {loan._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-200">
                    Active
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Repayment</span>
                    <span className="font-medium">₹{loan.loanConfig.totalRepayment.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Amount Paid</span>
                    <span className="font-medium text-green-600">₹{loan.amountPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t font-semibold">
                    <span className="text-slate-800">Outstanding Balance</span>
                    <span className="text-red-600">₹{outstanding.toFixed(2)}</span>
                  </div>

                  <div className="pt-2">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveLoan(loan); setAmount(outstanding.toFixed(2)); }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Record Payment
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {activeLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Record Repayment</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Recording payment for <span className="font-semibold text-slate-800">{activeLoan.personalDetails.fullName}</span>
            </p>

            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {paymentError}
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">UTR Number</label>
                <input required type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none uppercase"
                  value={utr} onChange={(e) => setUtr(e.target.value.toUpperCase())} placeholder="e.g. UTR123456789" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (₹)</label>
                <input required type="number" step="0.01" min="1" max={activeLoan.loanConfig.totalRepayment - activeLoan.amountPaid} 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                  value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                <input required type="date" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 outline-none"
                  value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
              </div>

              <button type="submit" disabled={paymentLoading} className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                {paymentLoading ? "Recording..." : "Save Payment"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}