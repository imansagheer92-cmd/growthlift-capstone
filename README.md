# 💰 SpendWise — Personal Expense Tracker

A full-stack MERN expense tracking web application built as the Week 6 Capstone for the GrowthLift Digital Internship 2026.

![SpendWise Dashboard](./screenshots/dashboard.png)

## 🔗 Live Links

| Resource | URL |
|---|---|
| **Frontend (Vercel)** | [growthlift-capstone-frontend.vercel.app](https://growthlift-capstone-frontend.vercel.app) |
| **Backend API (Vercel)** | [spendwise-api-delta.vercel.app](https://spendwise-api-delta.vercel.app) |
| **GitHub Repo** | [github.com/imansagheer92-cmd/growthlift-capstone](https://github.com/imansagheer92-cmd/growthlift-capstone) |
| **Demo Video** | _To be added_ |

---

## 📋 Features

- 🔐 **User Authentication** — JWT-secured register & login
- ➕ **Add Expenses** — title, amount, category, date, notes
- ✏️ **Edit & Delete** — full CRUD on your own expenses
- 📊 **Dashboard** — total spend, this month, last 7 days, category breakdown
- 🗂️ **Filter & Sort** — filter by category, sort by date
- 📱 **Fully Responsive** — works on mobile (375px), tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Axios, Vite |
| Backend | Node.js, Express 5, JWT, bcryptjs |
| Database | MongoDB, Mongoose |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
# Create .env with:  VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
growthlift-capstone/
├── backend/
│   ├── middleware/auth.js      # JWT protect middleware
│   ├── models/
│   │   ├── User.js             # User schema + password hashing
│   │   └── Expense.js          # Expense schema
│   ├── routes/
│   │   ├── auth.js             # register / login / me
│   │   └── expenses.js         # CRUD + stats
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/         # Navbar, Footer, StatCard, ExpenseItem
│       ├── context/            # AuthContext (user state + JWT)
│       ├── pages/              # All page components
│       └── services/api.js     # Axios instance + expense helpers
├── PROJECT_BRIEF.md
├── CASE_STUDY.md
└── README.md
```

---

## 🌐 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/expenses` | Yes | Get all expenses (filterable) |
| GET | `/api/expenses/stats` | Yes | Get spending statistics |
| POST | `/api/expenses` | Yes | Create expense |
| PUT | `/api/expenses/:id` | Yes | Update expense |
| DELETE | `/api/expenses/:id` | Yes | Delete expense |

---

## 👨‍💻 Author

Built by **Iman** during the GrowthLift Digital Internship 2026.

GrowthLift Digital · [growthlift-digital.vercel.app](https://growthlift-digital.vercel.app)
