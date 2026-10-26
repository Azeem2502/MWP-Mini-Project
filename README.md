# React Personal Expense Tracker

A modern, responsive, and beginner-friendly **Personal Finance & Expense Tracker Dashboard** built with **React.js** and **Vite**.

Designed for college project reviews and demonstrations, this application runs **directly in the browser** with persistent storage—meaning **no localhost backend or database setup is required to run and test it**! An optional full-stack Express.js & MongoDB backend is also included in the `server/` directory for students who need to demonstrate backend capabilities.

---

## 🌟 Live Features

1. **Financial Dashboard Overview**:
   - 4 Dynamic Summary Cards: Total Income, Total Expenses, Current Balance, and Monthly Savings in Indian Rupees (₹).
   - **Category Expenses Pie Chart (Recharts)**: Visual distribution of spending with interactive tooltips.
   - **Monthly Comparison Bar Chart (Recharts)**: 6-month historical Income vs. Expense comparison.
   - **Daily Spending Line Chart (Recharts)**: Daily spending trajectory for the active month.
   - **Recent Transactions**: Quick snapshot of the last 5 records.

2. **Add Transaction Form**:
   - Fields: Title, Amount, Type (Income / Expense tabs), Category, Date, Payment Method (Cash, UPI, Debit Card, Credit Card, Bank Transfer, Other), and Notes.
   - Instant validation: non-zero amounts, required titles, and valid dates.
   - Auto-reset upon submission with immediate dashboard recalculation.

3. **Transaction History & Management**:
   - Live debounced search by title.
   - Multi-filtering: by Type (All / Income / Expense), Category, and Date Range.
   - Multi-field sorting: by Date (newest/oldest) and Amount (highest/lowest).
   - **Edit in place**: Interactive modal allowing updates to any record.
   - **Delete with confirmation**: Safe deletion with instant recalculation.
   - **CSV Export**: One-click download of filtered or full transaction records.

4. **Monthly Budgets & Alert Thresholds**:
   - Set overall monthly spending budget and granular category budgets (Food, Rent, Transport, etc.).
   - Visual progress bars with automated alert banners:
     - 🟢 **Normal (< 80%)**: Safe spending zone.
     - 🟡 **Caution (80% - 100%)**: Amber warning banner.
     - 🔴 **Exceeded (> 100%)**: Red alert with exact over-budget amount.

5. **Reports & Analytics**:
   - Period filtering by Year and Month.
   - Highest Spending Category card and volume breakdown by payment method.
   - Download period-specific CSV spreadsheets.

6. **Settings & Demonstration Controls**:
   - Default currency configuration (INR ₹).
   - **One-Click Demo Seeder**: Instantly populates realistic demonstration data (Salary ₹25,000, Groceries ₹2,000, College Expenses ₹1,500, Internet ₹999, Rent ₹4,500, etc.).
   - **Clear All Data**: Resets all records with confirmation.

---

## 📁 Repository Structure

```text
expense-tracker/
├── index.html               # Main HTML entry point (relative assets for GitHub Pages)
├── package.json             # Root dependencies (React 18, React Router 6, Recharts, Lucide)
├── vite.config.js           # Vite build config with base: './' for GitHub Pages
├── .gitignore               # Excludes node_modules, dist, and .env files
├── README.md                # Documentation & Viva review guide
├── src/                     # React Application Source Code
│   ├── main.jsx             # DOM mounting
│   ├── App.jsx              # React Router routes
│   ├── index.css            # Custom design system (white theme, navy & sky-blue accents)
│   ├── layouts/
│   │   └── MainLayout.jsx   # Shell with Sidebar + Top Navbar + Outlet
│   ├── components/
│   │   ├── Navbar.jsx       # Header with live balance pill & currency badge
│   │   ├── Sidebar.jsx      # Navigation sidebar with active state icons
│   │   ├── SummaryCard.jsx  # Metric cards
│   │   ├── Modal.jsx        # Edit & delete confirmation modals
│   │   ├── LoadingSpinner.jsx
│   │   └── EmptyState.jsx   # Friendly empty state
│   ├── pages/
│   │   ├── Dashboard.jsx    # Overview dashboard & charts
│   │   ├── AddTransaction.jsx # Transaction entry form
│   │   ├── Transactions.jsx # Table, search, filters, edit, delete & CSV export
│   │   ├── Budgets.jsx      # Monthly budgets & warning thresholds
│   │   ├── Reports.jsx      # Period analytics & trend charts
│   │   └── Settings.jsx     # Currency, seeder & storage engine
│   ├── services/
│   │   └── api.js           # Direct browser storage engine (LocalStorage)
│   └── utils/
│       ├── constants.js     # Categories, payment methods & chart palette
│       └── formatters.js    # Indian Rupee (₹), date formatters & CSV generator
└── server/                  # Optional Express.js & MongoDB Backend (for college review)
    ├── server.js            # Express REST API
    ├── package.json
    ├── models/              # Mongoose schemas (Transaction, Budget)
    └── controllers/         # Backend controllers & seed script
```

---

## 🚀 How to Run Locally (Direct - No Backend Required)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open **`http://localhost:5173`** in your browser. All features work immediately!

---

## 🌐 How to Push This Project to GitHub

Follow these simple steps in your terminal inside the `expense-tracker` folder:

### Step 1: Initialize Git and Stage Files
```bash
git init
git add .
git commit -m "Initial commit: React Personal Expense Tracker"
```

### Step 2: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter repository name: `react-personal-expense-tracker`.
3. Choose **Public**.
4. Leave "Add a README file" unchecked (you already have this one).
5. Click **Create repository**.

### Step 3: Link and Push to GitHub
Copy the commands shown on GitHub (replace `<your-username>` with your GitHub username):
```bash
git branch -M main
git remote add origin https://github.com/<your-username>/react-personal-expense-tracker.git
git push -u origin main
```

---

## ⚡ Free 1-Click Hosting (Deploy to the Cloud)

Because this project runs directly in the browser with relative asset paths:

### Option A: Vercel (Recommended - Fastest)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** -> Select your `react-personal-expense-tracker` repo.
3. Click **Deploy**.
4. Your application will be live on a public URL (e.g. `https://react-personal-expense-tracker.vercel.app`) in under 1 minute!

### Option B: GitHub Pages
1. In your GitHub repository, go to **Settings** -> **Pages**.
2. Under **Build and deployment**, select **GitHub Actions**.
3. Choose the static/Vite workflow or run `npm run build` and deploy the `dist/` branch.

---

## 🎓 College Review & Viva Voce Q&A

**Q1: How does the application store data without requiring a localhost server or database?**
> *Answer:* The application uses the browser's native `localStorage` Web Storage API. When a transaction or budget is created, updated, or deleted, it is serialized as JSON and stored directly on the client machine. This allows the application to be hosted anywhere statically without server running costs or database setup.

**Q2: How are the totals (Income, Expenses, Balance, Monthly Savings) calculated?**
> *Answer:* Totals are calculated dynamically in real-time from the transaction array using JavaScript array methods (`filter` and `reduce`). For example, Total Income is the sum of transactions where `type === 'Income'`, and Current Balance is `Total Income - Total Expenses`.

**Q3: How does the budget warning alert system work?**
> *Answer:* The application filters all expense transactions for the selected month and category, summing the total spent. It computes the percentage of the budget limit consumed (`spent / limit * 100`). If usage is between 80% and 100%, a warning banner is triggered; if usage exceeds 100%, an exceeded alert is displayed.

**Q4: What charting library is used, and how is it integrated?**
> *Answer:* The project uses `Recharts`, a composable charting library built on React components and SVG. It renders responsive PieCharts, BarCharts, and LineCharts with custom tooltips, legends, and color palettes.
