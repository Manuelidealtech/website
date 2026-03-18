import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Footer.css'

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="footer">
      <div className="footer__titlebar">

      </div>

      <div className="site-container">
        <div className="footer__content">
          <div className="footer__logo-col">
            <Link to="/" className="footer__logo-box" aria-label="Torna alla home">
              <img
                src="/logo-idealtech.png"
                alt="Idealtech"
                className="footer__logo-image"
              />
            </Link>
          </div>

          <div className="footer__middle">
            <div className="footer__section footer__section--contacts">
              <h3>CONTATTI</h3>

              <div className="footer__info">
                <p>Idealtech s.r.l.</p>
                <p>Via Sondrio 11, Varedo (MB)</p>
                <p>Tel. 0362543041</p>
                <p>Email: info@idealtech.it</p>
                <p>PEC: direzione.idealtech@pec.it</p>
                <Link to="/termini-e-privacy">Privacy e Termini</Link>
              </div>
            </div>

            <div className="footer__divider" />

            <div className="footer__section footer__section--private">
              <h3>AREA PERSONALE</h3>

              <div className="footer__links">
                <Link to={user ? '/admin' : '/login'}>
                  {user ? 'Vai al pannello' : 'Login'}
                </Link>
                <Link to="/prodotti">Prodotti</Link>
                <Link to="/servizi">Servizi</Link>
                <Link to="/contatti">Contatti</Link>
              </div>
            </div>
          </div>

          <div className="footer__social-col">

            <div className="footer__socials">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="footer__social"
              >
                <img src="/fb.png" alt="Facebook" />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="footer__social"
              >
                <img src="/ig.png" alt="Instagram" />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="footer__social"
              >
                <img src="/in.png" alt="LinkedIn" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}