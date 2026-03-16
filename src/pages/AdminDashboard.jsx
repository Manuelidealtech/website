import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BackButton from '../components/BackButton'
import '../styles/AdminDashboard.css'

const quickActions = [
  {
    to: '/admin/macchinari/nuovo',
    icon: '＋',
    title: 'Nuovo macchinario',
    description: 'Crea una nuova scheda da pubblicare nello store.',
    tag: 'Azione rapida',
  },
  {
    to: '/admin/macchinari',
    icon: '🛠',
    title: 'Macchinari caricati',
    description: 'Visualizza, modifica ed elimina i macchinari inseriti.',
    tag: 'Gestione',
  },
  {
    to: '/admin/news',
    icon: '📰',
    title: 'Gestione news',
    description: 'Pubblica, modifica ed elimina le news visibili nel sito.',
    tag: 'Contenuti',
  },
  {
    to: '/store',
    icon: '🛒',
    title: 'Store pubblico',
    description: 'Controlla la vetrina pubblica dei macchinari online.',
    tag: 'Preview',
  },
  {
    to: '/news',
    icon: '🌐',
    title: 'Pagina news',
    description: 'Verifica come vengono mostrate pubblicamente le notizie.',
    tag: 'Preview',
  },
]

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth()

  async function handleLogout() {
    const { error } = await signOut()
    if (error) {
      alert(error.message)
    }
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-bg admin-dashboard-bg-1" />
      <div className="admin-dashboard-bg admin-dashboard-bg-2" />

      <div className="page-shell admin-dashboard-shell">
        <section className="admin-hero">
          <div className="admin-hero-main">
            <span className="admin-kicker">Area amministrazione</span>
            <h1>Pannello di controllo</h1>
            <p>
              Gestisci contenuti, macchinari e aggiornamenti del sito da un’unica
              area riservata.
            </p>

            <div className="admin-user-meta">
              <div className="admin-user-chip">
                <span className="admin-user-label">Utente</span>
                <strong>{profile?.full_name || user?.email || 'Admin'}</strong>
              </div>

              <div className="admin-user-chip">
                <span className="admin-user-label">Ruolo</span>
                <strong>{profile?.role || 'admin'}</strong>
              </div>
            </div>
          </div>

          <div className="admin-hero-actions">
            <BackButton fallback="/" />
            <button className="admin-logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </section>

        <section className="admin-overview-cards">
          <div className="admin-mini-card">
            <span className="admin-mini-card-label">Contenuti</span>
            <strong>News & pagine</strong>
            <p>Aggiorna la parte pubblica del sito in pochi clic.</p>
          </div>

          <div className="admin-mini-card">
            <span className="admin-mini-card-label">Store</span>
            <strong>Macchinari usati</strong>
            <p>Gestisci le schede prodotto e la vetrina pubblica.</p>
          </div>

          <div className="admin-mini-card">
            <span className="admin-mini-card-label">Controllo</span>
            <strong>Preview rapida</strong>
            <p>Verifica subito come i contenuti vengono mostrati online.</p>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head">
            <div>
              <span className="admin-section-kicker">Azioni rapide</span>
              <h2>Gestione principale</h2>
            </div>
          </div>

          <div className="dashboard-grid dashboard-grid-modern">
            {quickActions.map((item) => (
              <Link to={item.to} className="dashboard-card dashboard-card-modern" key={item.to}>
                <div className="dashboard-card-top">
                  <span className="dashboard-card-icon">{item.icon}</span>
                  <span className="dashboard-card-tag">{item.tag}</span>
                </div>

                <div className="dashboard-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <span className="dashboard-card-link">Apri sezione →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}