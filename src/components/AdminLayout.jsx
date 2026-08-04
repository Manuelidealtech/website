import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/AdminLayout.css'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '⌂', end: true },
  { to: '/admin/macchinari', label: 'Macchinari', icon: '⚙' },
  { to: '/admin/news', label: 'News', icon: '✦' },
  { to: '/admin/contatti', label: 'Contatti', icon: '☎', adminOnly: true },
  { to: '/admin/utenti', label: 'Utenti admin', icon: '♙', adminOnly: true },
]

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { user, profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin'

  async function handleLogout() {
    const { error } = await signOut()
    if (error) alert(error.message)
  }

  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/logo-idealtech.png" alt="Idealtech" />
          <div>
            <strong>Idealtech</strong>
            <span>Gestione sito</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Navigazione amministrazione">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'is-active' : ''}`
                }
              >
                <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-account-card">
            <span>Accesso effettuato come</span>
            <strong>{profile?.full_name || user?.email || 'Amministratore'}</strong>
            <small>{isAdmin ? 'Amministratore' : 'Editor'}</small>
          </div>

          <a href="/" className="admin-site-link">Apri il sito pubblico ↗</a>
          <button type="button" className="admin-signout" onClick={handleLogout}>
            Esci
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <span className="admin-page-kicker">Area amministrazione</span>
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="admin-page-actions">{actions}</div> : null}
        </header>

        <div className="admin-page-body">{children}</div>
      </main>
    </div>
  )
}
