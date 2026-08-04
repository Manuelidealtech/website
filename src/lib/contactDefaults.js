export const defaultContactRows = [
  {
    id: 'default-commerciale-italia',
    section_key: 'commerciale',
    section_title: 'Ufficio commerciale',
    office: 'Ufficio commerciale Italia',
    employee: 'Lucia Bisceglia',
    phone: '+39 0362 543041',
    phone_href: '+390362543041',
    extension: 'Interno 1',
    email: 'lucia.bisceglia@idealtech.it',
    photo_url: '/images/team/lucia-bisceglia.png',
    description: '',
    sort_order: 10,
  },
  {
    id: 'default-commerciale-estero',
    section_key: 'commerciale',
    section_title: 'Ufficio commerciale',
    office: 'Ufficio commerciale estero',
    employee: 'Noemi Silvio',
    phone: '+39 338 1382452',
    phone_href: '+393381382452',
    extension: 'Interno 2',
    email: 'info@idealtech.it',
    photo_url: '/images/team/Noemi.png',
    description: '',
    sort_order: 20,
  },
  {
    id: 'default-acquisti',
    section_key: 'acquisti',
    section_title: 'Ufficio acquisti',
    office: '',
    employee: 'Lucia Bisceglia',
    phone: '+39 0362 543041',
    phone_href: '+390362543041',
    extension: 'Interno 3',
    email: 'acquisti@idealtech.it',
    photo_url: '/images/team/lucia-bisceglia.png',
    description: 'Contattaci per ordini, forniture e richieste acquisti dedicate.',
    sort_order: 30,
  },
  {
    id: 'default-amministrazione',
    section_key: 'amministrazione',
    section_title: 'Amministrazione',
    office: '',
    employee: 'Federica Ceppi',
    phone: '+39 0362 543041',
    phone_href: '+390362543041',
    extension: 'Interno 4',
    email: 'amministrazione@idealtech.it',
    photo_url: '',
    description: 'Supporto per fatturazione, pratiche amministrative e documentazione.',
    sort_order: 40,
  },
  {
    id: 'default-tecnico',
    section_key: 'tecnico',
    section_title: 'Ufficio tecnico',
    office: '',
    employee: 'Giorgio Perego',
    phone: '+39 0362 543041',
    phone_href: '+390362543041',
    extension: 'Interno 5',
    email: 'ufficiotecnico1@idealtech.it',
    photo_url: '',
    description: 'Supporto tecnico e consulenza.',
    sort_order: 50,
  },
  {
    id: 'default-assistenza',
    section_key: 'assistenza',
    section_title: 'Assistenza tecnica',
    office: '',
    employee: '',
    phone: '+39 0362 543041',
    phone_href: '+390362543041',
    extension: 'Interno 6',
    email: 'assistenza@idealtech.it',
    photo_url: '',
    description: 'Supporto operativo e manutenzione su impianti e linee di incollaggio.',
    sort_order: 60,
  },
]

export function groupContactRows(rows) {
  const groups = new Map()

  ;(rows || []).forEach((row) => {
    const key = row.section_key || row.section_title || 'altro'
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: row.section_title || 'Contatti',
        items: [],
      })
    }
    groups.get(key).items.push(row)
  })

  return Array.from(groups.values()).map((group) => ({
    ...group,
    items: group.items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
  }))
}
