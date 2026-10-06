import './StatCard.css'

export default function StatCard({ icon, label, value, sub, color = 'primary' }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
    </div>
  )
}
