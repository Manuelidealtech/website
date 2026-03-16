import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)
  const toggleMenu = () => setMenuOpen((prev) => !prev)

  return (
    <header className="navbar">
      <div className="site-container navbar__inner">
        <Link
          to="/"
          className="navbar__brand"
          aria-label="Idealtech Home"
          onClick={closeMenu}
        >
          <img
            src="/logo-idealtech.png"
            alt="Idealtech"
            className="navbar__brand-logo"
          />
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink
            to="/"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/chi-siamo"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Chi siamo
          </NavLink>

          <NavLink
            to="/prodotti"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Prodotti
          </NavLink>

          <NavLink
            to="/special-machines"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Special Machines
          </NavLink>

          <NavLink
            to="/store"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Usato
          </NavLink>

          <NavLink
            to="/news"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            News
          </NavLink>

          <NavLink
            to="/servizi"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Servizi
          </NavLink>

          <NavLink
            to="/contatti"
            onClick={closeMenu}
            className={({ isActive }) =>
              isActive ? 'navbar__link active' : 'navbar__link'
            }
          >
            Contatti
          </NavLink>

          <div className="navbar__mobile-actions">
            <Link
              to={user ? '/admin' : '/login'}
              className="navbar__login-btn"
              onClick={closeMenu}
            >
              {user ? 'Pannello' : 'Login'}
            </Link>
          </div>
        </nav>

        <div className="navbar__actions">
          <Link to={user ? '/admin' : '/login'} className="navbar__login-btn">
            {user ? 'Pannello' : 'Login'}
          </Link>
        </div>

        <button
          className={`navbar__toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuOpen && <div className="navbar__overlay" onClick={closeMenu}></div>}
    </header>
  )
}