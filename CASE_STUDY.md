# SpendWise — Case Study

**GrowthLift Digital Internship 2026 · Week 6 Capstone**

---

## Section 1 — The Project

**SpendWise** is a full-stack personal expense tracking web application. It lets students and individuals record, manage, and monitor daily expenses through a clean dashboard — with authentication so every user's data is private and secure.

**Who it's for:** Students and young professionals in Pakistan who want to understand where their money goes each month without the complexity of a spreadsheet.

**Why it matters:** Most people in Pakistan have no idea how much they spend on food, transport, or entertainment monthly. SpendWise makes it trivially easy to log and review every rupee spent.

---

## Section 2 — The Stack

| Technology | Why I Chose It |
|---|---|
| **React 19 + Vite** | Fast dev server, modern component model, great ecosystem |
| **React Router v7** | Client-side routing with protected routes for auth |
| **Axios** | Clean HTTP client with interceptors for attaching JWT automatically |
| **Node.js + Express 5** | Minimal, flexible, perfect for building REST APIs quickly |
| **MongoDB + Mongoose** | Schema-based NoSQL — great for flexible expense documents |
| **JWT + bcryptjs** | Industry-standard stateless auth; bcrypt secures passwords at rest |
| **Vercel** | Zero-config deployment for Vite/React frontends |
| **Render** | Free Node.js backend hosting with environment variable support |

---

## Section 3 — The Challenges

### Challenge 1: Protecting routes on both frontend and backend

**Problem:** I needed pages like `/dashboard` to redirect unauthenticated users to `/login`, while the backend needed to block API calls without a valid JWT.

**Solution:** On the backend I wrote a `protect` middleware that reads the `Authorization: Bearer <token>` header, verifies it with `jwt.verify()`, and attaches the user to `req.user`. On the frontend I built a `PrivateRoute` wrapper component that reads from `AuthContext` — if no user is stored, it uses React Router's `<Navigate>` to redirect automatically.

### Challenge 2: Keeping auth state across page refreshes

**Problem:** On every page refresh, React state resets. This would log users out even with a valid token.

**Solution:** I persist the user object (including the JWT) to `localStorage` when they log in. In `AuthContext`, a `useEffect` runs on mount and reads from `localStorage` to restore the session. The Axios interceptor then picks up the token from `localStorage` on every request automatically.

### Challenge 3: Making the category bar chart without a library

**Problem:** Wanted a visual spending breakdown without adding a heavy chart library like Chart.js.

**Solution:** I calculated each category's percentage of total spending (`amount / total * 100`) and drove a CSS `width` property on a styled `div`. Animated with `transition: width 0.6s ease`. This gave a clean, dependency-free bar chart.

---

## Section 4 — What I Learned

1. **JWT auth is a two-sided contract** — the token must be verified server-side on every protected request, and the client must attach it to every call. Writing both sides from scratch made this crystal clear.

2. **Context + localStorage is the right pattern for auth state in React** — `useState` alone loses data on refresh; Context makes it available app-wide; localStorage makes it persistent.

3. **Build structure before style** — following the guide's advice to stub all backend routes first, then fill in logic, and build all HTML pages before styling saved me from getting blocked on CSS before core functionality worked.

---

## Section 5 — Links

| Resource | Link |
|---|---|
| **Live URL** | [growthlift-capstone-frontend.vercel.app](https://growthlift-capstone-frontend.vercel.app) |
| **GitHub Repo** | [github.com/imansagheer92-cmd/growthlift-capstone](https://github.com/imansagheer92-cmd/growthlift-capstone) |
| **Backend API** | [growthlift-capstone-eta.vercel.app](https://growthlift-capstone-eta.vercel.app) |
| **Demo Video** | _To be added_ |
