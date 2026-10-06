import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import AddExpensePage from './pages/AddExpensePage'
import EditExpensePage from './pages/EditExpensePage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

// Redirect to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

// Redirect to login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><ExpensesPage /></PrivateRoute>} />
          <Route path="/add-expense" element={<PrivateRoute><AddExpensePage /></PrivateRoute>} />
          <Route path="/edit-expense/:id" element={<PrivateRoute><EditExpensePage /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
