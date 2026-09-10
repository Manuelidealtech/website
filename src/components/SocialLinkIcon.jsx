const paths = {
  website: <><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7.5 10v7M7.5 7.5v.01M11 17v-4a3 3 0 0 1 6 0v4M11 10v7"/></>,
  facebook: <><path d="M14 8h3V4.2c-.5-.1-1.8-.2-3.4-.2C10.3 4 8 6 8 9.7V13H5v4h3v7h4v-7h3.4l.6-4H12V10c0-1.2.3-2 2-2Z"/></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>,
  whatsapp: <><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.4 2 2 3.8 4.4 5 .5.2 1.1-.3 1.5-.8"/></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  phone: <><path d="M7 4h3l1.2 4-2 1.5a15 15 0 0 0 5.3 5.3l1.5-2L20 14v3c0 1.7-1.3 3-3 3C9.8 20 4 14.2 4 7c0-1.7 1.3-3 3-3Z"/></>,
  contact: <><path d="M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 3v-4.2A2 2 0 0 1 3 15V7a2 2 0 0 1 2-2Z"/><path d="M8 10h8M8 14h5"/></>,
  support: <><circle cx="12" cy="12" r="8"/><path d="M8.5 16.5 6 19M15.5 16.5 18 19M8 8l8 8M16 8l-8 8"/></>,
  catalog: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"/></>,
  download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"/></>,
  map: <><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.3"/></>,
  external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></>,
}

export default function SocialLinkIcon({ type = 'external', className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[type] || paths.external}
    </svg>
  )
}
