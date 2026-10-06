import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__brand">💰 SpendWise</span>
        <span className="footer__copy">© {year} SpendWise. Track smarter, spend wiser.</span>
        <div className="footer__links">
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  )
}
