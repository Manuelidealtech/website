import { useEffect, useMemo, useState } from 'react'
import SocialLinkIcon from '../components/SocialLinkIcon'
import { SOCIAL_LANDING_DEFAULTS, SOCIAL_LINK_DEFAULTS } from '../lib/socialLandingDefaults'
import { supabase } from '../lib/supabase'
import '../styles/SocialLinksPage.css'

function mergeSettings(row) {
  return { ...SOCIAL_LANDING_DEFAULTS, ...(row || {}) }
}

function resolveHref(value) {
  const href = String(value || '').trim()
  if (!href) return '#'
  return href
}

export default function SocialLinksPage() {
  const [settings, setSettings] = useState(SOCIAL_LANDING_DEFAULTS)
  const [links, setLinks] = useState(SOCIAL_LINK_DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [settingsResult, linksResult] = await Promise.all([
          supabase.from('social_landing_settings').select('*').eq('id', 'main').maybeSingle(),
          supabase.from('social_landing_links').select('*').eq('active', true).order('sort_order', { ascending: true }),
        ])

        if (!active) return

        if (!settingsResult.error && settingsResult.data) {
          setSettings(mergeSettings(settingsResult.data))
        }

        if (!linksResult.error && linksResult.data?.length) {
          setLinks(linksResult.data)
        }
      } catch (error) {
        console.warn('Landing social: uso configurazione predefinita.', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  const style = useMemo(() => ({
    '--social-bg': settings.background_color || SOCIAL_LANDING_DEFAULTS.background_color,
    '--social-secondary': settings.secondary_color || SOCIAL_LANDING_DEFAULTS.secondary_color,
    '--social-accent': settings.accent_color || SOCIAL_LANDING_DEFAULTS.accent_color,
    '--social-card': settings.card_color || SOCIAL_LANDING_DEFAULTS.card_color,
    '--social-text': settings.text_color || SOCIAL_LANDING_DEFAULTS.text_color,
    '--social-button-text': settings.button_text_color || SOCIAL_LANDING_DEFAULTS.button_text_color,
    '--social-bg-image': settings.background_image_url ? `url("${settings.background_image_url}")` : 'none',
  }), [settings])

  if (!loading && settings.enabled === false) {
    return (
      <main className="social-links-unavailable">
        <img src="/logo-idealtech-900.webp" alt="Idealtech" />
        <h1>Pagina non disponibile</h1>
        <p>Questa landing è momentaneamente disattivata.</p>
      </main>
    )
  }

  return (
    <main className={`social-links-page ${loading ? 'is-loading' : ''}`} style={style}>
      <div className="social-links-noise" aria-hidden="true" />
      <div className="social-links-orb social-links-orb-one" aria-hidden="true" />
      <div className="social-links-orb social-links-orb-two" aria-hidden="true" />

      <section className="social-links-shell" aria-label="Collegamenti Idealtech">
        <header className="social-links-profile">
          <div className="social-links-logo-wrap">
            <div className="social-links-logo-halo" aria-hidden="true" />
            <img
              className="social-links-logo"
              src={settings.logo_url || '/logo-cerchio.png'}
              alt="Idealtech"
              decoding="async"
            />
          </div>

          {settings.eyebrow ? <span className="social-links-eyebrow">{settings.eyebrow}</span> : null}
          <h1>{settings.title}</h1>
          {settings.subtitle ? <p className="social-links-subtitle">{settings.subtitle}</p> : null}
          {settings.description ? <p className="social-links-description">{settings.description}</p> : null}

          {settings.show_made_in_italy ? (
            <div className="social-made-in-italy" aria-label="Made in Italy">
              <span className="italy-green" />
              <span className="italy-white" />
              <span className="italy-red" />
              <strong>Made in Italy</strong>
            </div>
          ) : null}
        </header>

        <div className="social-links-list">
          {links.map((link) => {
            const customStyle = {
              ...(link.background_color ? { '--link-bg': link.background_color } : {}),
              ...(link.text_color ? { '--link-text': link.text_color } : {}),
            }

            return (
              <a
                key={link.id}
                className={`social-link-card ${link.featured ? 'is-featured' : ''}`}
                href={resolveHref(link.url)}
                target={link.new_tab ? '_blank' : undefined}
                rel={link.new_tab ? 'noreferrer' : undefined}
                style={customStyle}
              >
                <span className="social-link-icon-wrap">
                  <SocialLinkIcon type={link.icon_key} />
                </span>
                <span className="social-link-copy">
                  <strong>{link.label}</strong>
                  {link.subtitle ? <small>{link.subtitle}</small> : null}
                </span>
                <span className="social-link-arrow" aria-hidden="true">↗</span>
              </a>
            )
          })}
        </div>

        <footer className="social-links-footer">
          <img src="/logo-idealtech-900.webp" alt="" aria-hidden="true" />
          {settings.footer_text ? <span>{settings.footer_text}</span> : null}
        </footer>
      </section>
    </main>
  )
}
