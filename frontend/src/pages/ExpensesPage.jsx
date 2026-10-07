import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { expensesApi } from '../services/api'
import ExpenseItem from '../components/ExpenseItem'
import { exportToCSV } from '../utils/exportCSV'
import './ExpensesPage.css'

const CATEGORIES = ['All', 'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Utilities', 'Other']

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')

  const fetchExpenses = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { sort }
      if (category !== 'All') params.category = category
      const { data } = await expensesApi.getAll(params)
      setExpenses(data)
    } catch {
      setError('Failed to load expenses. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExpenses() }, [category, sort])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try {
      await expensesApi.remove(id)
      setExpenses((prev) => prev.filter((e) => e._id !== id))
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="expenses-page">
      <div className="container">
        {/* Header */}
        <div className="expenses-page__header">
          <div>
            <h1>All Expenses</h1>
            <p className="text-muted">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}&nbsp;
              {expenses.length > 0 && `— Total: PKR ${total.toLocaleString()}`}
            </p>
          </div>
          <Link to="/add-expense" className="btn btn-primary">+ Add Expense</Link>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (expenses.length === 0) {
                alert('No expenses to export. Add some expenses first.')
                return
              }
              exportToCSV(expenses)
            }}
            title="Download expenses as CSV"
          >
            ⬇ Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="expenses-page__filters card">
          <div className="form-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="sort-filter">Sort by</label>
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <button
            className="btn btn-outline btn-sm expenses-page__reset"
            onClick={() => { setCategory('All'); setSort('newest') }}
          >
            Reset Filters
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : expenses.length === 0 ? (
          <div className="expenses-page__empty">
            <p>No expenses found{category !== 'All' ? ` in "${category}"` : ''}.</p>
            <Link to="/add-expense" className="btn btn-primary">Add an Expense</Link>
          </div>
        ) : (
          <div className="expenses-page__list">
            {expenses.map((exp) => (
              <ExpenseItem key={exp._id} expense={exp} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
