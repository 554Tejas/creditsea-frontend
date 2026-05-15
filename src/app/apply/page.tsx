"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { EmploymentMode } from "@/types";
import { AxiosError } from "axios";

// Form State Interfaces
interface PersonalDetails {
  fullName: string;
  pan: string;
  dob: string;
  monthlySalary: string;
  employmentMode: EmploymentMode;
}

interface LoanConfig {
  amount: number;
  tenureDays: number;
}

export default function ApplyPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Application Data State
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    fullName: "",
    pan: "",
    dob: "",
    monthlySalary: "",
    employmentMode: EmploymentMode.SALARIED,
  });
  const [salarySlipUrl, setSalarySlipUrl] = useState<string>("");
  const [loanConfig, setLoanConfig] = useState<LoanConfig>({
    amount: 100000,
    tenureDays: 180,
  });
  const [finalStatus, setFinalStatus] = useState<"success" | "rejected" | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="p-8 text-center">Loading...</div>;

  // STEP 1: BRE Check
  const handleBRECheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/loans/bre-check", {
        ...personalDetails,
        monthlySalary: Number(personalDetails.monthlySalary),
      });
      setStep(2); // Passed BRE!
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || err.response?.data?.message || "BRE Check Failed");
        setFinalStatus("rejected");
        setStep(4); // Move to end screen showing rejection
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("salarySlip", file);

    setError("");
    setIsSubmitting(true);
    try {
      const res = await api.post("/loans/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSalarySlipUrl(res.data.fileUrl);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "File upload failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Submit Application
  const handleSubmitApplication = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/loans/apply", {
        personalDetails: {
          ...personalDetails,
          monthlySalary: Number(personalDetails.monthlySalary),
        },
        salarySlipUrl,
        loanConfig,
      });
      setFinalStatus("success");
      setStep(4);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Application failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Math Calculation for Step 3
  const interestRate = 12;
  const simpleInterest = (loanConfig.amount * interestRate * loanConfig.tenureDays) / (365 * 100);
  const totalRepayment = loanConfig.amount + simpleInterest;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="font-bold text-xl text-primary-600">LMS Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">Hello, {user.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden h-fit">
          
          {/* Progress Bar */}
          <div className="bg-slate-50 border-b flex">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider ${
                  step === i ? "bg-primary-50 text-primary-600 border-b-2 border-primary-500" : 
                  step > i ? "text-slate-400" : "text-slate-300"
                }`}
              >
                Step {i}
              </div>
            ))}
          </div>

          <div className="p-8">
            {error && step !== 4 && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <form onSubmit={handleBRECheck} className="space-y-5">
                <h2 className="text-xl font-bold mb-4">Personal Details</h2>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" 
                      value={personalDetails.fullName} onChange={e => setPersonalDetails({...personalDetails, fullName: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                    <input type="text" required pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" title="Format: ABCDE1234F" className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none uppercase" 
                      value={personalDetails.pan} onChange={e => setPersonalDetails({...personalDetails, pan: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input type="date" required className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" 
                      value={personalDetails.dob} onChange={e => setPersonalDetails({...personalDetails, dob: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary (₹)</label>
                    <input type="number" required min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" 
                      value={personalDetails.monthlySalary} onChange={e => setPersonalDetails({...personalDetails, monthlySalary: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Employment Mode</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                      value={personalDetails.employmentMode} onChange={e => setPersonalDetails({...personalDetails, employmentMode: e.target.value as EmploymentMode})}>
                      <option value={EmploymentMode.SALARIED}>Salaried</option>
                      <option value={EmploymentMode.SELF_EMPLOYED}>Self-Employed</option>
                      <option value={EmploymentMode.UNEMPLOYED}>Unemployed</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
                  {isSubmitting ? "Checking Eligibility..." : "Continue"}
                </button>
              </form>
            )}

            {/* STEP 2: Upload Salary Slip */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Upload Salary Slip</h2>
                <p className="text-sm text-slate-500">Please upload your latest salary slip. Accepted formats: PDF, JPG, PNG. Max size: 5MB.</p>
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                  <input type="file" id="salarySlip" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} />
                  <label htmlFor="salarySlip" className="cursor-pointer flex flex-col items-center">
                    <div className="bg-primary-100 text-primary-600 p-3 rounded-full mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    </div>
                    <span className="text-sm font-medium text-primary-600 hover:text-primary-700">Click to upload document</span>
                  </label>
                  {isSubmitting && <p className="text-sm text-slate-500 mt-2">Uploading...</p>}
                </div>
                
                {salarySlipUrl && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center justify-between border border-green-200">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Document uploaded successfully!
                    </span>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Back</button>
                  <button onClick={() => setStep(3)} disabled={!salarySlipUrl} className="px-8 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">Continue</button>
                </div>
              </div>
            )}

            {/* STEP 3: Loan Config */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Configure Your Loan</h2>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-700">Loan Amount</label>
                      <span className="font-bold text-primary-600">₹{loanConfig.amount.toLocaleString()}</span>
                    </div>
                    <input type="range" min="50000" max="500000" step="10000" 
                      value={loanConfig.amount} onChange={(e) => setLoanConfig({...loanConfig, amount: Number(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>₹50K</span><span>₹5L</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-slate-700">Tenure (Days)</label>
                      <span className="font-bold text-primary-600">{loanConfig.tenureDays} Days</span>
                    </div>
                    <input type="range" min="30" max="365" step="5" 
                      value={loanConfig.tenureDays} onChange={(e) => setLoanConfig({...loanConfig, tenureDays: Number(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>30 Days</span><span>365 Days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8 space-y-3">
                  <h3 className="font-bold text-slate-800 border-b pb-2 mb-3">Calculation Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Principal Amount</span>
                    <span className="font-medium">₹{loanConfig.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Interest Rate (Fixed)</span>
                    <span className="font-medium">12% p.a.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Simple Interest</span>
                    <span className="font-medium text-orange-600">+ ₹{simpleInterest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t mt-2">
                    <span className="text-slate-800">Total Repayment</span>
                    <span className="text-primary-600">₹{totalRepayment.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Back</button>
                  <button onClick={handleSubmitApplication} disabled={isSubmitting} className="px-8 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
                    {isSubmitting ? "Applying..." : "Apply Now"}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Status Screen */}
            {step === 4 && (
              <div className="text-center py-8">
                {finalStatus === "success" ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h2>
                    <p className="text-slate-600">Your loan application has been successfully submitted and is pending review by our sanctioning team.</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Rejected</h2>
                    <p className="text-slate-600 mb-4">Unfortunately, your application did not pass our initial eligibility checks.</p>
                    <p className="font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 inline-block">Reason: {error}</p>
                    <div className="mt-8">
                      <button onClick={() => { setStep(1); setError(""); }} className="px-6 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium">Try Again</button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}