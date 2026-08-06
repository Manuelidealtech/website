import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Footer.css'

export default function Footer() {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" data-nosnippet>
      <div className="footer__titlebar" />

      <div className="site-container">
        <div className="footer__content">
          <div className="footer__logo-col">
            <Link to="/" className="footer__logo-box" aria-label="Torna alla home">
              <img
                src="/logo-idealtech-900.webp"
                alt="Idealtech"
                className="footer__logo-image"
                width="900"
                height="173"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>

          <div className="footer__middle">
            <div className="footer__section footer__section--company">
              <h3>IDEALTECH</h3>

              <div className="footer__info">
                <p>Idealtech s.r.l.</p>
                <p>Capitale sociale: € 70.000,00</p>
                <p>P. IVA e C.F.: 03058520960</p>
                <p>Via Sondrio 11, 20814 Varedo (MB)</p>
                <Link to="/contatti">Recapiti e uffici</Link>
                <Link to="/termini-e-privacy">Privacy e Termini</Link>
                <p className="footer__copyright">© {currentYear} Idealtech s.r.l. - Designed by <a href="https://vertex-ita.vercel.app" target="_blank" rel="noreferrer">Vertex</a></p>
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
                <Link to="/store">Macchinari usati</Link>
                <Link to="/servizi">Servizi</Link>
                <Link to="/contatti">Contatti</Link>
              </div>
            </div>
          </div>

          <div className="footer__social-col">
            <div className="footer__socials" aria-label="Canali social Idealtech">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="footer__social"
              >
                <img src="/fb-96.webp" alt="" width="96" height="96" loading="lazy" decoding="async" />
              </a>

              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="footer__social"
              >
                <img src="/ig-96.webp" alt="" width="96" height="96" loading="lazy" decoding="async" />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="footer__social"
              >
                <img src="/in-96.webp" alt="" width="96" height="96" loading="lazy" decoding="async" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
