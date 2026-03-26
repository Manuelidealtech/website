import emailjs from '@emailjs/browser'

export function sendContactEmail(params) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT,
    params,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  )
}

export function sendServicesEmail(params) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_SERVICES,
    params,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  )
}