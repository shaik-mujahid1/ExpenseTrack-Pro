# ExpenseTrack Pro — Modern Personal Expense Tracker

> A complete, professional, full-stack Personal Expense & Wealth Management Web Application prototype built from absolute scratch with **Spring Boot 3**, **React (Vite)**, **Tailwind CSS**, **Recharts**, **Spring Security (JWT)**, and an **H2 Persistent File-based Database**.

---

## 1. Project Overview

**ExpenseTrack Pro** is an enterprise-grade financial management dashboard engineered for personal wealth tracking, budgeting, and analytical forecasting. Designed with a SaaS aesthetic—dark navy navigation, emerald green growth accents, subtle card shadows, and fluid interactive data visualizations.

---

## 2. Technology Stack

### Frontend
- **React.js 18** with **Vite 5** (Fast HMR & Optimized Bundling)
- **Tailwind CSS 3** with modern dark navy & emerald financial palette
- **Recharts 2** for responsive data charts (Bar, Donut, Area graphs)
- **Lucide React** for modern financial icons
- **Axios** with automatic JWT authorization interceptors
- **React Router 6** for seamless protected client-side navigation

### Backend
- **Java 21 / 24**
- **Spring Boot 3.3.5** (Web, Data JPA, Security, Validation)
- **Spring Security 6** with stateless **JWT Authentication** (JJWT 0.12.6)
- **BCrypt** password hashing
- **Maven 3.9.9** (Included self-contained wrapper, zero external Maven installation required)
- **H2 Persistent File-based Database** (`jdbc:h2:file:./data/expensedb`) for persistent local storage across restarts, cleanly prepared for future MySQL migration

---

## 3. Key Features

1. **Authentication & Security**
   - User registration with custom full name, email, password, and default currency (INR, USD, EUR, GBP, CAD, AUD).
   - User login returning a secure stateless JWT token.
   - User-specific database isolation: every single query and mutation verifies the authenticated user via Spring Security context.
   - Password encryption using BCrypt.

2. **Executive Financial Dashboard**
   - Real-time KPI Cards: Net Balance, Total Inflow, Total Expenses, Monthly Savings, and Savings Efficiency Rate %.
   - Monthly Income vs. Expenses comparative bar chart.
   - Expense category breakdown donut chart with percentage allocation.
   - Net savings and cashflow trend area chart.
   - Recent activity ledger with category badges, amounts, and payment method chips.
   - Live budget watch widgets with dynamic warning thresholds.

3. **Expense Management**
   - Full CRUD: Add, edit, delete, and view all expense records.
   - Comprehensive filtering: keyword search by description, category dropdown, payment mode (UPI, Credit Card, Debit Card, Net Banking, Cash, Other), and date range (from/to).
   - Statistical overview cards: Total filtered spend, transaction count, average spend.

4. **Income Stream Tracking**
   - Full CRUD: Record salaries, consulting retainers, dividends, and business profits.
   - Categorize income sources.
   - Search and date range filtering.

5. **Category Architecture**
   - 16 pre-seeded default categories (Food, Shopping, Transportation, Education, Healthcare, Entertainment, Bills, Travel, Personal, Other, Salary, Freelance, Investments, Business, Gifts, Other Income).
   - Custom category creator: users can define custom categories with customized colors and Lucide icons.
   - Protected defaults: system default categories cannot be deleted by users.

6. **Budget Management & Smart Alerts**
   - Define monthly spending allocations overall or by specific category.
   - Real-time tracking against actual expense records.
   - Visual progress bars with smart alerting:
     - **Green**: Under 80% utilization (Safe)
     - **Amber Warning**: 80% to 100% utilization (Near Limit warning)
     - **Red Alert**: Over 100% utilization (Exceeded alert)

7. **Advanced Analytics & Insights**
   - Timeframe toggles: Weekly, Monthly, Yearly, and Custom date ranges.
   - Category leaderboard ranked by outflow volume with percentage share.
   - Savings efficiency metrics.

8. **Spreadsheet-Ready Reports (CSV Export)**
   - Export downloadable CSV statements with customizable filters (transaction type, category, date range).
   - Standard UTF-8 format ready for Excel, Google Sheets, or tax archiving.

9. **User Profile & Settings**
   - Update full name and default currency (INR ₹, USD $, EUR €, GBP £, CAD C$, AUD A$).
   - Change password with current password verification.
   - Dashboard theme selection.

---

## 4. Project Directory Structure

```
expense-tracker-prototype/
├── backend/
│   ├── .tools/apache-maven-3.9.9/   # Self-contained Maven distribution
│   ├── data/expensedb.*             # Persistent H2 file database
│   ├── mvnw.cmd                     # Maven wrapper script (CMD)
│   ├── mvnw.ps1                     # Maven wrapper script (PowerShell)
│   ├── pom.xml                      # Spring Boot 3.3.5 & dependencies
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/expensetracker/
│   │   │   │   ├── config/          # DataInitializer (Default categories & demo user)
│   │   │   │   ├── controller/      # Auth, User, Expense, Income, Category, Budget, Dashboard, Report
│   │   │   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   │   │   ├── entity/          # User, Expense, Income, Category, Budget
│   │   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   │   ├── security/        # JWT Token Provider, Auth Filter, SecurityConfig
│   │   │   │   ├── service/         # Business logic services
│   │   │   │   └── ExpenseTrackerApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties # H2 file persistence & JWT config
│   │   └── test/                    # Integration and context test suites
├── frontend/
│   ├── node_modules/                # Core packages (React, Vite, Recharts, Lucide, Axios)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # StatCard, Modal, LoadingSpinner, EmptyState, DynamicIcon
│   │   │   ├── dashboard/           # SummaryCards, IncomeExpenseChart, CategoryPieChart, RecentTransactionsTable, BudgetWidget
│   │   │   └── layout/              # Sidebar (Dark Navy), Navbar (Glassmorphism), AppLayout
│   │   ├── context/                 # AuthContext (JWT, user state, currency formatters)
│   │   ├── pages/                   # Login, Register, Dashboard, Transactions, Expenses, Income, Budgets, Categories, Analytics, Reports, Settings, Profile
│   │   ├── services/                # Axios API services (Auth, Expense, Income, Category, Budget, Dashboard, Report)
│   │   ├── App.jsx                  # React Router routes & ProtectedRoute guards
│   │   ├── index.css                # Custom utilities & scrollbars
│   │   └── main.jsx                 # React root mount
│   ├── index.html                   # HTML entry point with Tailwind CDN & typography
│   ├── package.json                 # Node dependencies & scripts
│   └── vite.config.js               # Vite config with /api reverse proxy to port 8080
├── .gitignore                       # Git ignore rules
├── README.md                        # Documentation & college presentation guide
└── start-app.ps1                    # One-click Windows PowerShell startup script
```

---

## 5. How to Run the Application

### Method A: One-Click Startup (Recommended)

Open **Windows PowerShell** in the project root directory:

```powershell
Set-Location "C:\Users\shaik mujahid\.gemini\antigravity\scratch\expense-tracker-prototype"
.\start-app.ps1
```

This automated launcher will:
1. Detect and configure Java JDK.
2. Launch the Spring Boot backend on port 8080.
3. Launch the React Vite frontend on port 5173.
4. Open the dashboard directly in your default browser at `http://localhost:5173`.

---

### Method B: Manual Step-by-Step Execution

#### Step 1: Start the Backend (Terminal 1)
```powershell
Set-Location "C:\Users\shaik mujahid\.gemini\antigravity\scratch\expense-tracker-prototype\backend"
.\mvnw.ps1 spring-boot:run
```
*The backend REST API will start on `http://localhost:8080`.*

#### Step 2: Start the Frontend (Terminal 2)
```powershell
Set-Location "C:\Users\shaik mujahid\.gemini\antigravity\scratch\expense-tracker-prototype\frontend"
npm run dev
```
*The Vite frontend server will start on `http://localhost:5173`.*

---

## 6. Demo & Presentation Credentials

The system includes pre-seeded demo transactions and budgets for immediate demonstration:

- **Email**: `demo@expensetracker.com`
- **Password**: `Password123!`

*(You can also simply click the green **"Fill Demo Credentials (1-Click)"** button on the Login page).*

Alternatively, you can click **"Create an account"** to register a fresh personal account with your own custom name and default currency.

---

## 7. Database Configuration Details

- **Database Type**: H2 File-based Database
- **Storage Location**: `expense-tracker-prototype/backend/data/expensedb.mv.db`
- **H2 Web Console**: Accessible at `http://localhost:8080/h2-console`
  - **JDBC URL**: `jdbc:h2:file:./data/expensedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`
  - **User**: `sa`
  - **Password**: *(leave blank)*
- **Persistence**: Transactions, categories, budgets, and users are written to local disk. Restarting the backend preserves all user records without data loss.
- **MySQL Migration Ready**: The entities use standard JPA/Hibernate annotations. To switch to MySQL, update `pom.xml` to include `mysql-connector-j` and set `spring.datasource.url=jdbc:mysql://localhost:3306/expensedb`.
