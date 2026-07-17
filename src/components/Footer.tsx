import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-text">
        Built assisted with Claude.{' '}
        <a
          href="https://github.com/reverseon/personal-website"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Source Code
        </a>
      </p>
    </footer>
  )
}
