import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__inner">
        <span className="not-found__emoji">😕</span>
        <h1>404 — Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">Go Back Home</Link>
      </div>
    </div>
  )
}
