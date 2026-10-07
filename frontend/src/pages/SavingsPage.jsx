import { useState, useEffect } from 'react'
import { incomeApi } from '../services/api'
import './SavingsPage.css'

const SOURCES = ['Salary', 'Freelance', 'Business', 'Gift', 'Investment', 'Other']

const SOURCE_ICONS = {
  Salary: '💼', Freelance: '💻', Business: '🏪',
  Gift: '🎁', Investment: '📈', Other: '💵',
}

export default function SavingsPage() {
  const [summary, setSummary] = useState(null)
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    title: '', amount: '', source: 'Salary', description: '', date: today,
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [summaryRes, incomesRes] = await Promise.all([
        incomeApi.getSummary(),
        incomeApi.getAll(),
      ])
      setSummary(summaryRes.data)
      setIncomes(incomesRes.data)
    } catch {
      setError('Failed to load savings data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setFormError('Title is required.')
    if (!form.amount || Number(form.amount) <= 0) return setFormError('Enter a valid amount.')
    setSaving(true)
    try {
      await incomeApi.create({ ...form, amount: Number(form.amount) })
      setForm({ title: '', amount: '', source: 'Salary', description: '', date: today })
      setShowForm(false)
      fetchData()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add income.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) return
    try {
      await incomeApi.remove(id)
      fetchData()
    } catch {
      alert('Failed to delete. Please try again.')
    }
  }

  const fmt = (n) => `PKR ${(n || 0).toLocaleString()}`

  const savingsRate = summary && summary.totalIncome > 0
    ? Math.round((summary.netSavings / summary.totalIncome) * 100)
    : 0

  return (
    <div className="savings-page">
      <div className="container">
        <div className="savings-page__header">
          <div>
            <h1>Savings & Income</h1>
            <p className="text-muted">Track your income and see how much you're saving.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ Add Income'}
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Add Income Form */}
        {showForm && (
          <div className="savings-page__form card">
            <h3>Add Income Entry</h3>
            {formError && <div className="alert alert-error mt-2">{formError}</div>}
            <form onSubmit={handleSubmit} className="savings-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input id="title" name="title" type="text"
                  placeholder="e.g. Monthly Salary" value={form.title} onChange={handleChange} required />
              </div>
              <div className="savings-form__row">
                <div className="form-group">
                  <label htmlFor="amount">Amount (PKR) *</label>
                  <input id="amount" name="amount" type="number"
                    placeholder="0" value={form.amount} onChange={handleChange} min="0.01" step="0.01" required />
                </div>
                <div className="form-group">
                  <label htmlFor="source">Source *</label>
                  <select id="source" name="source" value={form.source} onChange={handleChange}>
                    {SOURCES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input id="date" name="date" type="date" value={form.date} onChange={handleChange} max={today} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Notes (optional)</label>
                <textarea id="description" name="description"
                  placeholder="Any details..." value={form.description} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Income'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="savings-page__stats">
              <div className="savings-stat-card savings-stat-card--income">
                <span className="savings-stat-card__icon">💰</span>
                <div>
                  <p className="savings-stat-card__label">Total Income</p>
                  <p className="savings-stat-card__value">{fmt(summary?.totalIncome)}</p>
                </div>
              </div>
              <div className="savings-stat-card savings-stat-card--expense">
                <span className="savings-stat-card__icon">💸</span>
                <div>
                  <p className="savings-stat-card__label">Total Expenses</p>
                  <p className="savings-stat-card__value">{fmt(summary?.totalExpenses)}</p>
                </div>
              </div>
              <div className={`savings-stat-card ${summary?.netSavings >= 0 ? 'savings-stat-card--positive' : 'savings-stat-card--negative'}`}>
                <span className="savings-stat-card__icon">{summary?.netSavings >= 0 ? '📈' : '📉'}</span>
                <div>
                  <p className="savings-stat-card__label">Net Savings</p>
                  <p className="savings-stat-card__value">{fmt(summary?.netSavings)}</p>
                </div>
              </div>
              <div className="savings-stat-card savings-stat-card--rate">
                <span className="savings-stat-card__icon">🎯</span>
                <div>
                  <p className="savings-stat-card__label">Savings Rate</p>
                  <p className="savings-stat-card__value">{savingsRate}%</p>
                </div>
              </div>
            </div>

            {/* This Month */}
            <div className="savings-page__month card">
              <h3>This Month</h3>
              <div className="savings-month__grid">
                <div className="savings-month__item">
                  <span>Income</span>
                  <strong className="savings-month__income">{fmt(summary?.thisMonthIncome)}</strong>
                </div>
                <div className="savings-month__item">
                  <span>Expenses</span>
                  <strong className="savings-month__expense">{fmt(summary?.thisMonthExpenses)}</strong>
                </div>
                <div className="savings-month__item">
                  <span>Savings</span>
                  <strong className={summary?.thisMonthSavings >= 0 ? 'savings-month__positive' : 'savings-month__negative'}>
                    {fmt(summary?.thisMonthSavings)}
                  </strong>
                </div>
              </div>

              {/* Savings progress bar */}
              {summary?.thisMonthIncome > 0 && (
                <div className="savings-progress">
                  <div className="savings-progress__labels">
                    <span>Spent</span>
                    <span>{Math.min(100, Math.round((summary.thisMonthExpenses / summary.thisMonthIncome) * 100))}% of income</span>
                  </div>
                  <div className="savings-progress__track">
                    <div
                      className={`savings-progress__fill ${summary.thisMonthExpenses > summary.thisMonthIncome ? 'savings-progress__fill--over' : ''}`}
                      style={{ width: `${Math.min(100, (summary.thisMonthExpenses / summary.thisMonthIncome) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Income list */}
            <div className="savings-page__list">
              <h3>Income History</h3>
              {incomes.length === 0 ? (
                <div className="savings-page__empty">
                  <p>No income entries yet. Add your first income to start tracking savings.</p>
                  <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Income</button>
                </div>
              ) : (
                <div className="savings-income-list">
                  {incomes.map((inc) => (
                    <div className="savings-income-item" key={inc._id}>
                      <span className="savings-income-item__icon">{SOURCE_ICONS[inc.source] || '💵'}</span>
                      <div className="savings-income-item__info">
                        <p className="savings-income-item__title">{inc.title}</p>
                        <p className="savings-income-item__meta">
                          <span className="badge" style={{ background: '#f0fdf4', color: '#15803d' }}>{inc.source}</span>
                          <span className="text-muted" style={{ fontSize: 12 }}>
                            {new Date(inc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </p>
                        {inc.description && <p className="savings-income-item__desc">{inc.description}</p>}
                      </div>
                      <div className="savings-income-item__right">
                        <p className="savings-income-item__amount">{fmt(inc.amount)}</p>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inc._id)}
                          aria-label={`Delete ${inc.title}`}>Delete</button>
                      </div>
                    </div>
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
