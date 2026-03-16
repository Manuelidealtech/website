import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { user } = useAuth()

  return (
    <header className="navbar">
      <div className="site-container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Idealtech Home">
          <img
            src="/logo-idealtech.png"
            alt="Idealtech"
            className="navbar__brand-logo"
          />
        </Link>

        <nav className="navbar__nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/chi-siamo"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Chi siamo
          </NavLink>

          <NavLink
            to="/prodotti"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Prodotti
          </NavLink>

          <NavLink
            to="/special-machines"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Special Machines
          </NavLink>

          <NavLink
            to="/store"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Usato
          </NavLink>

          <NavLink
            to="/news"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            News
          </NavLink>

          <NavLink
            to="/servizi"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Servizi
          </NavLink>

          <NavLink
            to="/contatti"
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Contatti
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to={user ? '/admin' : '/login'} className="navbar__login-btn">
            {user ? 'Pannello' : 'Login'}
          </Link>
        </div>
      </div>
    </header>
  )
}