import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Footer.css'

export default function Footer() {
  const { user } = useAuth()

  return (
    <footer className="footer">
      <div className="site-container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">IT</div>

            <div className="footer__brand-copy">
              <strong>Idealtech</strong>
              <span>Industrial Gluing Solutions</span>
            </div>
          </div>

          <div className="footer__cols">
            <div className="footer__col">
              <h4>Navigazione</h4>
              <div className="footer__links">
                <Link to="/">Home</Link>
                <Link to="/chi-siamo">Chi siamo</Link>
                <Link to="/prodotti">Prodotti</Link>
                <Link to="/special-machines">Special Machines</Link>
                <Link to="/store">Usato</Link>
                <Link to="/servizi">Servizi</Link>
                <Link to="/contatti">Contatti</Link>
              </div>
            </div>

            <div className="footer__col">
              <h4>Area riservata</h4>
              <div className="footer__links">
                <Link to={user ? '/admin' : '/login'}>
                  {user ? 'Vai al pannello' : 'Login'}
                </Link>
                <Link to="/store">Store usato</Link>
              </div>
            </div>

            <div className="footer__col">
              <h4>Contatti</h4>
              <div className="footer__contact">
                <p>Email: info@idealtech.it</p>
                <p>Telefono: +39 0362 543041</p>
                <p>Via Sondrio, 11</p>
                <p>20814 Varedo (MB)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Idealtech. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  )
}