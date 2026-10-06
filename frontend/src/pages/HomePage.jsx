import { Link } from 'react-router-dom'
import './HomePage.css'

const FEATURES = [
  { icon: '🔐', title: 'Secure Authentication', desc: 'Your data is protected with JWT tokens and encrypted passwords. Only you can see your expenses.' },
  { icon: '➕', title: 'Add Expenses Instantly', desc: 'Log any expense in seconds — enter the amount, pick a category, add a note, and you\'re done.' },
  { icon: '📊', title: 'Dashboard Overview', desc: 'See your total spend, this month\'s budget usage, and a breakdown by category at a glance.' },
  { icon: '✏️', title: 'Edit & Delete', desc: 'Made a mistake? Update or remove any expense at any time. Full control is always in your hands.' },
  { icon: '📱', title: 'Works on Any Device', desc: 'Fully responsive — use SpendWise on your phone, tablet, or desktop without losing any features.' },
  { icon: '🗂️', title: '8 Spending Categories', desc: 'Food, Transport, Shopping, Health, Education, Entertainment, Utilities, and more.' },
]

export default function HomePage() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="container home__hero-inner">
          <div className="home__hero-text">
            <span className="home__pill">Free Expense Tracker</span>
            <h1>Track Your Spending.<br />Take Back Control.</h1>
            <p className="home__hero-sub">
              SpendWise is a simple, powerful expense tracker for students and individuals who want to understand where their money goes — without the complexity.
            </p>
            <div className="home__hero-actions">
              <Link to="/register" className="btn btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn btn-outline">I Have an Account</Link>
            </div>
          </div>
          <div className="home__hero-visual" aria-hidden="true">
            <div className="home__hero-card">
              <div className="home__hero-card-row">
                <span>🍔 Food & Dining</span><strong>PKR 3,500</strong>
              </div>
              <div className="home__hero-card-row">
                <span>🚗 Transport</span><strong>PKR 1,200</strong>
              </div>
              <div className="home__hero-card-row">
                <span>📚 Education</span><strong>PKR 5,000</strong>
              </div>
              <div className="home__hero-card-row home__hero-card-row--total">
                <span>Total This Month</span><strong>PKR 9,700</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home__features">
        <div className="container">
          <h2 className="text-center">Everything you need to manage money</h2>
          <p className="text-center text-muted mt-1">No spreadsheets. No complexity. Just clean, simple tracking.</p>
          <div className="home__features-grid">
            {FEATURES.map((f) => (
              <div className="home__feature-card" key={f.title}>
                <span className="home__feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home__cta">
        <div className="container home__cta-inner">
          <h2>Ready to spend smarter?</h2>
          <p>Join thousands of students tracking their expenses with SpendWise.</p>
          <Link to="/register" className="btn btn-primary">Create Free Account</Link>
        </div>
      </section>
    </div>
  )
}
