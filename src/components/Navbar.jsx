import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useSiteContent } from '../context/SiteContentContext'
import { defaultNavbarItems, defaultProductMenuItems } from '../lib/siteContentDefaults'
import '../styles/Navbar.css'

export default function Navbar() {
  const { user } = useAuth()
  const { language, languages, setLanguage } = useLanguage()
  const { get } = useSiteContent()
  const [menuOpen, setMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)

  const navItems = (get('navbar.items', defaultNavbarItems) || []).filter((item) => item.visible !== false)
  const productMenuItems = (get('navbar.products', defaultProductMenuItems) || []).filter((item) => item.visible !== false)

  const closeMenu = () => {
    setMenuOpen(false)
    setProductsOpen(false)
  }

  const toggleMenu = () => setMenuOpen((prev) => !prev)
  const toggleProducts = () => setProductsOpen((prev) => !prev)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = menuOpen ? 'hidden' : previousOverflow || ''

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

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
          <img src={item.flagSrc} alt="" aria-hidden="true" className="navbar__language-flag" width="32" height="32" decoding="async" />
          <span className="navbar__language-code">{item.label}</span>
        </button>
      ))}
    </div>
  )

  function renderNavItem(item) {
    if (item.id === 'products' || item.hasDropdown) {
      return (
        <div
          key={item.id}
          className={`navbar__dropdown ${productsOpen ? 'is-open' : ''}`}
          onMouseEnter={() => !menuOpen && setProductsOpen(true)}
          onMouseLeave={() => !menuOpen && setProductsOpen(false)}
        >
          <div className="navbar__dropdown-top">
            <NavLink
              to={item.to || '/prodotti'}
              onClick={closeMenu}
              className={({ isActive }) => isActive ? 'navbar__link active' : 'navbar__link'}
            >
              {item.label}
            </NavLink>
            <button type="button" className="navbar__dropdown-toggle" onClick={toggleProducts} aria-label={productsOpen ? 'Chiudi elenco prodotti' : 'Apri elenco prodotti'} aria-expanded={productsOpen}>
              <span className="navbar__dropdown-arrow">⌄</span>
            </button>
          </div>
          <div className="navbar__dropdown-menu">
            {productMenuItems.map((product) => (
              <Link key={product.id || product.label} to={product.to} className="navbar__dropdown-link" onClick={closeMenu}>
                {product.label}
              </Link>
            ))}
          </div>
        </div>
      )
    }

    return (
      <NavLink
        key={item.id || item.to}
        to={item.to}
        onClick={closeMenu}
        className={({ isActive }) => {
          const shopClass = item.shop || item.id === 'shop' ? ' navbar__shop-link' : ''
          return `navbar__link${shopClass}${isActive ? ' active' : ''}`
        }}
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <header className="navbar">
      <div className="site-container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Idealtech Home" onClick={closeMenu}>
          <img src="/logo-idealtech-900.webp" alt="Idealtech" className="navbar__brand-logo" width="900" height="173" decoding="async" />
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navigazione principale">
          <div className="navbar__mobile-panel-header">
            <span>Menu</span>
            <button type="button" className="navbar__mobile-close" onClick={closeMenu} aria-label="Chiudi menu">×</button>
          </div>

          {navItems.map(renderNavItem)}

          <div className="navbar__mobile-language">{languageSwitcher}</div>
          <div className="navbar__mobile-actions">
            <Link to={user ? '/admin' : '/login'} className="navbar__login-btn" onClick={closeMenu}>
              {user ? 'Pannello' : 'Login'}
            </Link>
          </div>
        </nav>

        <div className="navbar__actions">
          {languageSwitcher}
          <Link to={user ? '/admin' : '/login'} className="navbar__login-btn">{user ? 'Pannello' : 'Login'}</Link>
        </div>

        <button className={`navbar__toggle ${menuOpen ? 'is-open' : ''}`} type="button" aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'} aria-expanded={menuOpen} onClick={toggleMenu}>
          <span></span><span></span><span></span>
        </button>
      </div>
      {menuOpen && <div className="navbar__overlay" onClick={closeMenu}></div>}
    </header>
  )
}
