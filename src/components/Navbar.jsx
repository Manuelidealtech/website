import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/Navbar.css'

const productMenuItems = [
  { label: 'Piatti Prementi', to: '/prodotti/drum-line' },
  { label: 'Estrusori', to: '/prodotti/extruder-line' },
  { label: 'Fusori per Hot-Melt', to: '/prodotti/assy-line' },
  { label: 'Teste di Spalmatura', to: '/prodotti/coating-heads' },
  { label: 'Fusori Plug & Work', to: '/prodotti/idm-gp' },
  { label: 'Fusori DM-GO', to: '/prodotti/idm-gp' },
  { label: 'Applicatori Hot-melt', to: '/prodotti/gun-line' },
  { label: 'Tubi elettroriscaldati', to: '/prodotti/hose-line' },
  { label: 'Applicatori per colla a freddo', to: '/prodotti/cold-line' },
  { label: 'Pistole Manuali', to: '/prodotti/hand-gun' },
  { label: 'Ricambi Compatibili', to: '/prodotti/spare-parts' },
  { label: 'Custom Machines', to: '/prodotti/custom-machines'},
]

export default function Navbar() {
  const { user } = useAuth()
  const { language, languages, setLanguage } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
    setProductsOpen(false)
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const toggleProducts = () => setProductsOpen((prev) => !prev)

  const languageSwitcher = (
    <div className="navbar__language-switcher" aria-label="Language selector" data-no-translate>
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          className={`navbar__language-btn ${language === item.code ? 'is-active' : ''}`}
          onClick={() => setLanguage(item.code)}
          title={item.label}
          aria-label={item.label}
          aria-pressed={language === item.code}
        >
          <img
            src={item.flagSrc}
            alt=""
            aria-hidden="true"
            className="navbar__language-flag"
          />
          <span className="navbar__language-code">{item.label}</span>
        </button>
      ))}
    </div>
  )

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
            <NavLink
              to="/prodotti"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'navbar__link active' : 'navbar__link'
              }
            >
              Prodotti
              <span className="navbar__dropdown-arrow">⌄</span>
            </NavLink>

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

          <div className="navbar__mobile-language">{languageSwitcher}</div>

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
          {languageSwitcher}

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