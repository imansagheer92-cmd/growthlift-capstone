import { useNavigate } from 'react-router-dom'
import './ExpenseItem.css'

const CATEGORY_ICONS = {
  'Food & Dining': '🍔',
  'Transport': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Health': '💊',
  'Education': '📚',
  'Utilities': '💡',
  'Other': '📦',
}

export default function ExpenseItem({ expense, onDelete }) {
  const navigate = useNavigate()

  const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="expense-item">
      <div className="expense-item__icon">
        {CATEGORY_ICONS[expense.category] || '📦'}
      </div>
      <div className="expense-item__info">
        <p className="expense-item__title">{expense.title}</p>
        <p className="expense-item__meta">
          <span className="badge expense-item__category">{expense.category}</span>
          <span className="expense-item__date">{formattedDate}</span>
        </p>
        {expense.description && (
          <p className="expense-item__desc">{expense.description}</p>
        )}
      </div>
      <div className="expense-item__right">
        <p className="expense-item__amount">PKR {expense.amount.toLocaleString()}</p>
        <div className="expense-item__actions">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/edit-expense/${expense._id}`)}
            aria-label={`Edit ${expense.title}`}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(expense._id)}
            aria-label={`Delete ${expense.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
