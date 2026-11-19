export function resolveAccountRole({ user, profile, supportStaff, supportCustomer }) {
  const appRole = String(user?.app_metadata?.role || '').toLowerCase()
  const accountType = String(user?.app_metadata?.account_type || user?.user_metadata?.account_type || '').toLowerCase()

  // I ruoli scritti lato server in app_metadata hanno sempre la precedenza.
  if (appRole === 'admin') return 'admin'
  if (appRole === 'technician') return supportStaff?.active === false ? null : 'technician'
  if (appRole === 'customer') return 'customer'

  // Un account nato dal portale assistenza non deve mai ereditare per errore
  // un profilo editor creato da vecchi trigger o automazioni.
  if (accountType === 'support_customer') return 'customer'

  if (appRole === 'editor') return 'editor'

  if (supportStaff?.role === 'technician' && supportStaff?.active !== false) return 'technician'

  if (profile?.role === 'admin') return 'admin'

  // Se esiste il profilo cliente, ha priorità su un eventuale vecchio profilo editor.
  if (supportCustomer) return 'customer'

  if (profile?.role === 'editor') return 'editor'

  return null
}
