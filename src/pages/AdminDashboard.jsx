import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import '../styles/AdminDashboard.css'

const quickActions = [
  {
    to: '/admin/macchinari/nuovo',
    icon: '＋',
    title: 'Nuovo macchinario',
    description: 'Crea una scheda prodotto. La bozza resta salvata anche cambiando pagina.',
    tag: 'Azione rapida',
  },
  {
    to: '/admin/macchinari',
    icon: '⚙',
    title: 'Gestisci macchinari',
    description: 'Modifica prezzi, IVA, immagini e pubblicazione dello store.',
    tag: 'Store',
  },
  {
    to: '/admin/news',
    icon: '✦',
    title: 'Gestione news',
    description: 'Crea e aggiorna le notizie mostrate nel sito.',
    tag: 'Contenuti',
  },
  {
    to: '/admin/contatti',
    icon: '☎',
    title: 'Dipendenti e contatti',
    description: 'Aggiorna nomi, recapiti e fotografie di tutti gli uffici.',
    tag: 'Contatti',
    adminOnly: true,
  },
  {
    to: '/admin/utenti',
    icon: '♙',
    title: 'Utenti amministratori',
    description: 'Crea gli accessi per i colleghi che gestiscono il sito.',
    tag: 'Accessi',
    adminOnly: true,
  },
  {
    to: '/admin/seo',
    icon: '⌕',
    title: 'Gestione SEO',
    description: 'Ottimizza titoli, descrizioni e anteprime social delle pagine.',
    tag: 'Visibilità',
    adminOnly: true,
  },
  {
    to: '/store',
    icon: '↗',
    title: 'Anteprima sito',
    description: 'Apri lo store pubblico e controlla il risultato finale.',
    tag: 'Preview',
  },
]

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ machines: '—', published: '—', news: '—' })

  useEffect(() => {
    let active = true

    async function loadStats() {
      const [machinesResult, publishedResult, newsResult] = await Promise.all([
        supabase.from('machines').select('*', { count: 'exact', head: true }),
        supabase.from('machines').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('news').select('*', { count: 'exact', head: true }),
      ])

      if (!active) return
      setStats({
        machines: machinesResult.count ?? '—',
        published: publishedResult.count ?? '—',
        news: newsResult.count ?? '—',
      })
    }

    loadStats()
    return () => {
      active = false
    }
  }, [])

  const isAdmin = profile?.role === 'admin'

  return (
    <AdminLayout
      title="Pannello di controllo"
      subtitle="Gestisci tutto il sito Idealtech da un’unica area, con accessi separati per i colleghi."
      actions={<Link className="admin-primary-button" to="/admin/macchinari/nuovo">+ Nuovo macchinario</Link>}
    >
      <section className="admin-overview-cards">
        <div className="admin-mini-card">
          <span className="admin-mini-card-label">Macchinari totali</span>
          <strong>{stats.machines}</strong>
          <p>Schede presenti nel gestionale.</p>
        </div>
        <div className="admin-mini-card">
          <span className="admin-mini-card-label">Online nello store</span>
          <strong>{stats.published}</strong>
          <p>Macchinari attualmente visibili.</p>
        </div>
        <div className="admin-mini-card">
          <span className="admin-mini-card-label">News</span>
          <strong>{stats.news}</strong>
          <p>Contenuti pubblicati o in bozza.</p>
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <span className="admin-section-kicker">Gestione rapida</span>
            <h2>Cosa vuoi aggiornare?</h2>
          </div>
        </div>

        <div className="dashboard-grid dashboard-grid-modern">
          {quickActions
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
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
    </AdminLayout>
  )
}
