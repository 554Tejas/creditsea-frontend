// Shared Types for Frontend

export enum UserRole {
  ADMIN = 'Admin',
  SALES = 'Sales',
  SANCTION = 'Sanction',
  DISBURSEMENT = 'Disbursement',
  COLLECTION = 'Collection',
  BORROWER = 'Borrower',
}

export enum EmploymentMode {
  SALARIED = 'Salaried',
  SELF_EMPLOYED = 'Self-Employed',
  UNEMPLOYED = 'Unemployed',
}

export enum LoanStatus {
  APPLIED = 'Applied',
  SANCTIONED = 'Sanctioned',
  REJECTED = 'Rejected',
  DISBURSED = 'Disbursed',
  CLOSED = 'Closed',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Loan {
  _id: string;
  borrower: User | string;
  personalDetails: {
    fullName: string;
    pan: string;
    dob: string;
    monthlySalary: number;
    employmentMode: EmploymentMode;
  };
  salarySlipUrl?: string;
  loanConfig: {
    amount: number;
    tenureDays: number;
    interestRate: number;
    simpleInterest: number;
    totalRepayment: number;
  };
  amountPaid: number;
  status: LoanStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loan: string;
  utr: string;
  amount: number;
  paymentDate: string;
  recordedBy: User | string;
  createdAt: string;
}