async function sendEmailRequest(params) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || 'Errore durante l’invio del messaggio.')
  }

  return data
}

export function sendContactEmail(params) {
  return sendEmailRequest({
    ...params,
    title: params.title || 'Nuovo messaggio dal sito',
  })
}

export function sendServicesEmail(params) {
  return sendEmailRequest({
    ...params,
    title: params.title || 'Richiesta preventivo dal sito',
  })
}
