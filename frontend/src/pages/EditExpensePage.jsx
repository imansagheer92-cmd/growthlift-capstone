import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { expensesApi } from '../services/api'
import './ExpenseFormPage.css'

const CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment',
  'Health', 'Education', 'Utilities', 'Other',
]

export default function EditExpensePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    description: '',
    date: today,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await expensesApi.getOne(id)
        setForm({
          title: data.title,
          amount: data.amount,
          category: data.category,
          description: data.description || '',
          date: new Date(data.date).toISOString().split('T')[0],
        })
      } catch {
        setError('Expense not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchExpense()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) return setError('Title is required.')
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount greater than 0.')

    setSaving(true)
    try {
      await expensesApi.update(id, {
        ...form,
        amount: Number(form.amount),
      })
      navigate('/expenses')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>

  return (
    <div className="expense-form-page">
      <div className="container">
        <div className="expense-form-page__back">
          <Link to="/expenses">← Back to Expenses</Link>
        </div>

        <div className="expense-form-card card">
          <h1>Edit Expense</h1>
          <p className="text-muted">Update the details of your expense below.</p>

          {error && <div className="alert alert-error mt-2">{error}</div>}

          <form onSubmit={handleSubmit} noValidate className="expense-form">
            <div className="form-group">
              <label htmlFor="title">Expense title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div className="expense-form__row">
              <div className="form-group">
                <label htmlFor="amount">Amount (PKR) *</label>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                max={today}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Notes (optional)</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={300}
              />
            </div>

            <div className="expense-form__actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Update Expense'}
              </button>
              <Link to="/expenses" className="btn btn-outline">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
