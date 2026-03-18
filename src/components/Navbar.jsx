import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

const productMenuItems = [
  { label: 'Piatti Prementi', to: '/prodotti?categoria=piatti-prementi' },
  { label: 'Estrusori', to: '/prodotti?categoria=estrusori' },
  { label: 'Fusori per Hot-Melt', to: '/prodotti?categoria=fusori-hot-melt' },
  { label: 'Teste di Spalmatura', to: '/prodotti?categoria=teste-di-spalmatura' },
  { label: 'Fusori Plug & Work', to: '/prodotti?categoria=fusori-plug-work' },
  { label: 'Fusori DM-GO', to: '/prodotti?categoria=fusori-dm-go' },
  { label: 'Applicatori Hot-melt', to: '/prodotti?categoria=applicatori-hot-melt' },
  { label: 'Tubi elettroriscaldati', to: '/prodotti?categoria=tubi-elettroriscaldati' },
  { label: 'Applicatori per colla a freddo', to: '/prodotti?categoria=applicatori-colla-freddo' },
  { label: 'Pistole Manuali', to: '/prodotti?categoria=pistole-manuali' },
  { label: 'Ricambi Compatibili', to: '/prodotti?categoria=ricambi-compatibili' },
  { label: 'Custom Machines', to: '/prodotti?categoria=custom-machines', featured: true },
]

export default function Navbar() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
    setProductsOpen(false)
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const toggleProducts = () => setProductsOpen((prev) => !prev)

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

          <div
            className={`navbar__dropdown ${productsOpen ? 'is-open' : ''}`}
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              className="navbar__dropdown-trigger"
              aria-expanded={productsOpen}
              onClick={toggleProducts}
            >
              Prodotti
              <span className="navbar__dropdown-arrow">⌄</span>
            </button>

            <div className="navbar__dropdown-menu">
              {productMenuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`navbar__dropdown-link ${item.featured ? 'is-featured' : ''}`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

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