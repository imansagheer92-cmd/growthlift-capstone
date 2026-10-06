import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { expensesApi } from '../services/api'
import StatCard from '../components/StatCard'
import ExpenseItem from '../components/ExpenseItem'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, expensesRes] = await Promise.all([
        expensesApi.getStats(),
        expensesApi.getAll({ sort: 'newest' }),
      ])
      setStats(statsRes.data)
      setRecent(expensesRes.data.slice(0, 5))
    } catch {
      setError('Failed to load dashboard data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await expensesApi.remove(id)
      fetchData()
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }

  const fmt = (n) => `PKR ${(n || 0).toLocaleString()}`

  const topCategory = stats
    ? Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1])[0]
    : null

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard__header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-muted">Welcome back, <strong>{user?.name}</strong> 👋</p>
          </div>
          <Link to="/add-expense" className="btn btn-primary">
            + Add Expense
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="dashboard__stats">
              <StatCard
                icon="💰"
                label="Total Spent"
                value={fmt(stats?.total)}
                sub={`${stats?.count || 0} expenses total`}
                color="primary"
              />
              <StatCard
                icon="📅"
                label="This Month"
                value={fmt(stats?.thisMonth)}
                sub="Current month spending"
                color="success"
              />
              <StatCard
                icon="📆"
                label="Last 7 Days"
                value={fmt(stats?.last7Days)}
                sub="Past week spending"
                color="warning"
              />
              <StatCard
                icon="🏆"
                label="Top Category"
                value={topCategory ? topCategory[0] : 'None'}
                sub={topCategory ? fmt(topCategory[1]) : 'No expenses yet'}
                color="danger"
              />
            </div>

            {/* Category Breakdown */}
            {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
              <div className="dashboard__breakdown card">
                <h3>Spending by Category</h3>
                <div className="dashboard__bars">
                  {Object.entries(stats.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amt]) => {
                      const pct = stats.total > 0 ? Math.round((amt / stats.total) * 100) : 0
                      return (
                        <div className="dashboard__bar-row" key={cat}>
                          <span className="dashboard__bar-label">{cat}</span>
                          <div className="dashboard__bar-track">
                            <div
                              className="dashboard__bar-fill"
                              style={{ width: `${pct}%` }}
                              role="progressbar"
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                          <span className="dashboard__bar-amt">{fmt(amt)}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Recent expenses */}
            <div className="dashboard__recent">
              <div className="dashboard__recent-header">
                <h3>Recent Expenses</h3>
                <Link to="/expenses" className="btn btn-outline btn-sm">View All</Link>
              </div>

              {recent.length === 0 ? (
                <div className="dashboard__empty">
                  <p>No expenses yet.</p>
                  <Link to="/add-expense" className="btn btn-primary">Add your first expense</Link>
                </div>
              ) : (
                <div className="dashboard__expense-list">
                  {recent.map((exp) => (
                    <ExpenseItem key={exp._id} expense={exp} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
