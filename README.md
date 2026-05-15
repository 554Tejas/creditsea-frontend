# 🌊 CreditSea - Frontend Application

This repository contains the frontend web application for the **CreditSea Loan Management System (LMS)**. Built with Next.js and Tailwind CSS, it provides dedicated, secure portals for borrowers and loan executives.

## 🚀 Live Demo
* **Website:** [Insert your Vercel URL here]
* **Backend API Repo:** [Insert link to your backend repo]
* **Video Walkthrough:** [Insert your YouTube/Drive Link here]

## ✨ Key Features
* **Role-Specific Dashboards:** Custom UI layouts for Borrowers, Sanctioning, Disbursement, and Collections.
* **Multi-Step Application Form:** A seamless, user-friendly interface for borrowers to submit PAN, salary, and employment details.
* **Real-Time API Integration:** Connected to the CreditSea Node.js backend using Axios for dynamic data fetching and state updates.
* **Fully Responsive:** Styled with Tailwind CSS to ensure a clean experience across desktop and mobile devices.

## 🛠️ Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **HTTP Client:** Axios

## 🔑 Demo Credentials
To explore the different role-based portals, use the following credentials. All accounts share the password: `password123`.

* `borrower@lms.com` (Loan Application & Status)
* `sanction@lms.com` (Approval & Rejection)
* `disbursement@lms.com` (Fund Release)
* `collection@lms.com` (EMI Logging & Closure)
* `admin@lms.com` (Full Access)

## 💻 Local Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/creditsea-frontend.git
cd creditsea-frontend
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory. Point it to your local backend server:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run the Application
```bash
npm run dev
```
The application will start on `http://localhost:3000`. Ensure your backend server is also running to enable login and data fetching!
