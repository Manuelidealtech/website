import { TRANSLATIONS } from './translations'

export const CMS_LANGUAGES = ['it', 'en', 'tr']


const CMS_TRANSLATION_OVERRIDES = {
  en: {
    'Sistemi e soluzioni per l’incollaggio industriale': 'Systems and solutions for industrial gluing',
    'Sistemi, componenti e soluzioni per la fusione, il dosaggio, il trasferimento e l’applicazione di adesivi in ambito industriale.': 'Systems, components and solutions for melting, dosing, transferring and applying adhesives in industrial environments.',
    'Una gamma completa': 'A complete range',
    'Idealtech propone una gamma completa di sistemi e componenti per l’incollaggio industriale: fusori hot-melt, piatti prementi, estrusori, sistemi di dosaggio, tubi elettroriscaldati, applicatori automatici e manuali e teste di spalmatura. L’offerta comprende inoltre sistemi per colle a freddo, macchine speciali e ricambi dedicati alle diverse applicazioni.': 'Idealtech offers a complete range of systems and components for industrial gluing: hot-melt melters, drum melters, extruders, dosing systems, electrically heated hoses, automatic and manual applicators, and coating heads. The range also includes cold-glue systems, special machines and spare parts for different applications.',
    'Soluzioni per diverse esigenze applicative': 'Solutions for different application requirements',
    'La gamma Idealtech comprende soluzioni con differenti capacità, configurazioni e caratteristiche tecniche, pensate per adattarsi a diverse esigenze di applicazione e produzione. Scopri le categorie prodotto e consulta le caratteristiche delle singole soluzioni.': 'The Idealtech range includes solutions with different capacities, configurations and technical features, designed to adapt to a wide variety of application and production requirements. Explore the product categories and review the features of each solution.',
    'Tessile e non-woven': 'Textile and non-woven',
    'Tessile e Non-woven': 'Textile and non-woven',
    'Legno e paper converting': 'Wood and paper converting',
    'Automobilistico': 'Automotive',
    'Produzione filtri aria': 'Air filter production',
    'Igienico-sanitario': 'Hygiene and sanitary',
    'Produzione materassi': 'Mattress production',
    'Edilizia': 'Construction',
    'Grafica': 'Graphics',
    'Progettati per la fusione e il pompaggio di adesivi hot-melt direttamente da fusti da 20 L & 200 L.': 'Designed for melting and pumping hot-melt adhesives directly from 20 L and 200 L drums.',
    'Sistemi hot-melt modulari da 5, 12 e 30 L, progettati per la fusione e l’erogazione controllata di adesivi termoplastici.': 'Modular 5, 12 and 30 L hot-melt systems designed for controlled melting and dispensing of thermoplastic adhesives.',
    'Sistemi hot-melt di media capacità, con serbatoi da 9 a 50 L e configurazioni fino a quattro pompe per diverse esigenze produttive.': 'Medium-capacity hot-melt systems with 9 to 50 L tanks and configurations with up to four pumps for different production requirements.',
    'Fusori IdealMelt': 'IdealMelt Melters',
    "I fusori hot-melt della serie IdealMelt sono progettati per la fusione e l'erogazione di adesivi termoplastici. Grazie alla struttura modulare, al controllo preciso della temperatura e alle diverse possibilità di configurazione, offrono una soluzione affidabile e versatile per le applicazioni di incollaggio industriale.": 'IdealMelt hot-melt melters are designed for melting and dispensing thermoplastic adhesives. Thanks to their modular construction, precise temperature control and multiple configuration options, they provide a reliable and versatile solution for industrial gluing applications.',
    'I fusori hot-melt della serie IdealMelt sono progettati per la fusione e l’erogazione di adesivi termoplastici. Grazie alla struttura modulare, al controllo preciso della temperatura e alle diverse possibilità di configurazione, offrono una soluzione affidabile e versatile per le applicazioni di incollaggio industriale.': 'IdealMelt hot-melt melters are designed for melting and dispensing thermoplastic adhesives. Thanks to their modular construction, precise temperature control and multiple configuration options, they provide a reliable and versatile solution for industrial gluing applications.',
    "La serie IdealMelt comprende fusori hot-melt modulari progettati per la fusione e l'erogazione di adesivi termoplastici, tra cui EVA e PSA. Disponibili con serbatoi da 5, 12 e 30 litri, questi sistemi combinano affidabilità, semplicità di utilizzo e flessibilità di configurazione.": 'The IdealMelt series includes modular hot-melt melters designed for melting and dispensing thermoplastic adhesives, including EVA and PSA. Available with 5, 12 and 30 litre tanks, these systems combine reliability, ease of use and configuration flexibility.',
    'La serie IdealMelt comprende fusori hot-melt modulari progettati per la fusione e l’erogazione di adesivi termoplastici, tra cui EVA e PSA. Disponibili con serbatoi da 5, 12 e 30 litri, questi sistemi combinano affidabilità, semplicità di utilizzo e flessibilità di configurazione.': 'The IdealMelt series includes modular hot-melt melters designed for melting and dispensing thermoplastic adhesives, including EVA and PSA. Available with 5, 12 and 30 litre tanks, these systems combine reliability, ease of use and configuration flexibility.',
    "Il controllo preciso della temperatura e le diverse capacità di fusione consentono di adattare il sistema alle esigenze di un'ampia gamma di applicazioni industriali.": 'Precise temperature control and the different melting capacities allow the system to be adapted to the requirements of a wide range of industrial applications.',
    'Grazie alla struttura modulare, i fusori IdealMelt possono essere configurati con differenti accessori e sistemi di controllo, offrendo soluzioni personalizzabili in base alle specifiche esigenze produttive.': 'Thanks to their modular design, IdealMelt melters can be configured with different accessories and control systems, providing customisable solutions for specific production requirements.',
    'Design modulare: configurazioni flessibili per diverse esigenze applicative': 'Modular design: flexible configurations for different application requirements',
    'Capacità del serbatoio: disponibili versioni da 5, 12 e 30 litri': 'Tank capacity: available in 5, 12 and 30 litre versions',
    "Controllo della temperatura: regolazione precisa per una fusione uniforme dell'adesivo": 'Temperature control: precise regulation for uniform adhesive melting',
    "Manutenzione semplificata: struttura progettata per facilitare l'accesso ai componenti": 'Simplified maintenance: structure designed to provide easy access to components',
    'Flessibilità applicativa: compatibilità con tubi riscaldati e applicatori manuali e automatici': 'Application flexibility: compatible with heated hoses and manual and automatic applicators',
    'Configurazioni opzionali: alimentazione automatica del granulato, controllo dei pattern di applicazione e pannello operatore remoto': 'Optional configurations: automatic granulate feeding, application pattern control and remote operator panel',
    'Grazie alle loro caratteristiche si prestano pertanto ad essere installati in qualsiasi linea produttiva.': 'Thanks to their characteristics, they can be installed in virtually any production line.',
    'Grazie al nostro servizio interno di progettazione, concepiamo e realizziamo progetti custom per rispondere anche a richieste di piccole e medie automazioni.': 'Thanks to our in-house engineering service, we design and manufacture custom projects to meet the requirements of small and medium-sized automation systems.',
    'Grazie al nostro servizio interno di progettazione, concepiamo e realizziamo progetti custom, sviluppati attorno alle reali esigenze produttive del cliente. Siamo in grado di rispondere anche a richieste per piccole e medie automazioni.': 'Thanks to our in-house engineering service, we design and manufacture custom projects around the customer’s actual production requirements. We can also meet requests for small and medium-sized automation systems.',
    'NORDSON 8503686 – Applicatore hot-melt H201-T': 'NORDSON 8503686 – H201-T hot-melt applicator',
    'NORDSON 729450C – Scheda controllo temperatura TR6K+': 'NORDSON 729450C – TR6K+ temperature control board',
    'Applicatore hot-melt Nordson H201-T, codice 8503686, configurato con singolo modulo per l’erogazione di adesivo termofusibile.': 'Nordson H201-T hot-melt applicator, code 8503686, configured with a single module for dispensing thermoplastic adhesive.',
    'Il gruppo utilizza un sistema di azionamento pneumatico Air Open / Spring Close ed è dotato di controllo temperatura tramite sensore RTD. È progettato per applicazioni industriali di dosaggio hot-melt con erogazione precisa e ripetibile.': 'The unit uses an Air Open / Spring Close pneumatic actuation system and features temperature control via an RTD sensor. It is designed for industrial hot-melt dosing applications requiring precise and repeatable dispensing.',
    'Caratteristiche principali:': 'Main features:',
    'Produttore: Nordson': 'Manufacturer: Nordson',
    'Codice prodotto: 8503686': 'Product code: 8503686',
    'Modello: H201-T': 'Model: H201-T',
    'Tipologia: applicatore / pistola hot-melt': 'Type: hot-melt applicator / gun',
    'Configurazione: 1 modulo': 'Configuration: 1 module',
    'Azionamento: Air Open / Spring Close': 'Actuation: Air Open / Spring Close',
    'Controllo temperatura: RTD': 'Temperature control: RTD',
    'Alimentazione: 240 V': 'Power supply: 240 V',
    'Applicazione: erogazione adesivi hot-melt': 'Application: hot-melt adhesive dispensing',
  },
  tr: {
    'Sistemi e soluzioni per l’incollaggio industriale': 'Endüstriyel yapıştırma sistemleri ve çözümleri',
    'Sistemi, componenti e soluzioni per la fusione, il dosaggio, il trasferimento e l’applicazione di adesivi in ambito industriale.': 'Endüstriyel uygulamalarda yapıştırıcıların eritilmesi, dozajlanması, aktarılması ve uygulanması için sistemler, bileşenler ve çözümler.',
    'Una gamma completa': 'Eksiksiz bir ürün yelpazesi',
    'Idealtech propone una gamma completa di sistemi e componenti per l’incollaggio industriale: fusori hot-melt, piatti prementi, estrusori, sistemi di dosaggio, tubi elettroriscaldati, applicatori automatici e manuali e teste di spalmatura. L’offerta comprende inoltre sistemi per colle a freddo, macchine speciali e ricambi dedicati alle diverse applicazioni.': 'Idealtech; hot-melt eritme üniteleri, varil eritme sistemleri, ekstrüderler, dozajlama sistemleri, elektrikli ısıtmalı hortumlar, otomatik ve manuel aplikatörler ile kaplama kafalarından oluşan eksiksiz bir endüstriyel yapıştırma ürün yelpazesi sunar. Ürün gamında ayrıca soğuk tutkal sistemleri, özel makineler ve farklı uygulamalara yönelik yedek parçalar bulunur.',
    'Soluzioni per diverse esigenze applicative': 'Farklı uygulama ihtiyaçları için çözümler',
    'La gamma Idealtech comprende soluzioni con differenti capacità, configurazioni e caratteristiche tecniche, pensate per adattarsi a diverse esigenze di applicazione e produzione. Scopri le categorie prodotto e consulta le caratteristiche delle singole soluzioni.': 'Idealtech ürün gamı; farklı uygulama ve üretim ihtiyaçlarına uyum sağlayacak şekilde tasarlanmış, çeşitli kapasite, konfigürasyon ve teknik özelliklere sahip çözümler içerir. Ürün kategorilerini keşfedin ve her çözümün özelliklerini inceleyin.',
    'Tessile e non-woven': 'Tekstil ve non-woven',
    'Tessile e Non-woven': 'Tekstil ve non-woven',
    'Legno e paper converting': 'Ahşap ve kağıt işleme',
    'Automobilistico': 'Otomotiv',
    'Produzione filtri aria': 'Hava filtresi üretimi',
    'Igienico-sanitario': 'Hijyen ve sağlık',
    'Produzione materassi': 'Yatak üretimi',
    'Edilizia': 'İnşaat',
    'Grafica': 'Grafik',
    'Progettati per la fusione e il pompaggio di adesivi hot-melt direttamente da fusti da 20 L & 200 L.': 'Hot-melt yapıştırıcıların 20 L ve 200 L varillerden doğrudan eritilmesi ve pompalanması için tasarlanmıştır.',
    'Sistemi hot-melt modulari da 5, 12 e 30 L, progettati per la fusione e l’erogazione controllata di adesivi termoplastici.': 'Termoplastik yapıştırıcıların kontrollü eritilmesi ve uygulanması için tasarlanmış modüler 5, 12 ve 30 L hot-melt sistemleri.',
    'Sistemi hot-melt di media capacità, con serbatoi da 9 a 50 L e configurazioni fino a quattro pompe per diverse esigenze produttive.': 'Farklı üretim ihtiyaçları için 9 ila 50 L tanklara ve dört pompaya kadar konfigürasyonlara sahip orta kapasiteli hot-melt sistemleri.',
    'Fusori IdealMelt': 'IdealMelt Eritme Üniteleri',
    "I fusori hot-melt della serie IdealMelt sono progettati per la fusione e l'erogazione di adesivi termoplastici. Grazie alla struttura modulare, al controllo preciso della temperatura e alle diverse possibilità di configurazione, offrono una soluzione affidabile e versatile per le applicazioni di incollaggio industriale.": 'IdealMelt serisi hot-melt eritme üniteleri termoplastik yapıştırıcıların eritilmesi ve uygulanması için tasarlanmıştır. Modüler yapıları, hassas sıcaklık kontrolü ve farklı konfigürasyon seçenekleri sayesinde endüstriyel yapıştırma uygulamaları için güvenilir ve çok yönlü bir çözüm sunarlar.',
    'I fusori hot-melt della serie IdealMelt sono progettati per la fusione e l’erogazione di adesivi termoplastici. Grazie alla struttura modulare, al controllo preciso della temperatura e alle diverse possibilità di configurazione, offrono una soluzione affidabile e versatile per le applicazioni di incollaggio industriale.': 'IdealMelt serisi hot-melt eritme üniteleri termoplastik yapıştırıcıların eritilmesi ve uygulanması için tasarlanmıştır. Modüler yapıları, hassas sıcaklık kontrolü ve farklı konfigürasyon seçenekleri sayesinde endüstriyel yapıştırma uygulamaları için güvenilir ve çok yönlü bir çözüm sunarlar.',
    "La serie IdealMelt comprende fusori hot-melt modulari progettati per la fusione e l'erogazione di adesivi termoplastici, tra cui EVA e PSA. Disponibili con serbatoi da 5, 12 e 30 litri, questi sistemi combinano affidabilità, semplicità di utilizzo e flessibilità di configurazione.": 'IdealMelt serisi, EVA ve PSA dahil termoplastik yapıştırıcıların eritilmesi ve uygulanması için tasarlanmış modüler hot-melt eritme ünitelerinden oluşur. 5, 12 ve 30 litrelik tank seçenekleriyle bu sistemler güvenilirlik, kullanım kolaylığı ve konfigürasyon esnekliğini bir araya getirir.',
    'La serie IdealMelt comprende fusori hot-melt modulari progettati per la fusione e l’erogazione di adesivi termoplastici, tra cui EVA e PSA. Disponibili con serbatoi da 5, 12 e 30 litri, questi sistemi combinano affidabilità, semplicità di utilizzo e flessibilità di configurazione.': 'IdealMelt serisi, EVA ve PSA dahil termoplastik yapıştırıcıların eritilmesi ve uygulanması için tasarlanmış modüler hot-melt eritme ünitelerinden oluşur. 5, 12 ve 30 litrelik tank seçenekleriyle bu sistemler güvenilirlik, kullanım kolaylığı ve konfigürasyon esnekliğini bir araya getirir.',
    "Il controllo preciso della temperatura e le diverse capacità di fusione consentono di adattare il sistema alle esigenze di un'ampia gamma di applicazioni industriali.": 'Hassas sıcaklık kontrolü ve farklı eritme kapasiteleri, sistemin çok çeşitli endüstriyel uygulama ihtiyaçlarına uyarlanmasını sağlar.',
    'Grazie alla struttura modulare, i fusori IdealMelt possono essere configurati con differenti accessori e sistemi di controllo, offrendo soluzioni personalizzabili in base alle specifiche esigenze produttive.': 'Modüler yapıları sayesinde IdealMelt eritme üniteleri farklı aksesuarlar ve kontrol sistemleriyle yapılandırılabilir ve özel üretim ihtiyaçlarına göre özelleştirilebilir çözümler sunar.',
    'Design modulare: configurazioni flessibili per diverse esigenze applicative': 'Modüler tasarım: farklı uygulama ihtiyaçları için esnek konfigürasyonlar',
    'Capacità del serbatoio: disponibili versioni da 5, 12 e 30 litri': 'Tank kapasitesi: 5, 12 ve 30 litrelik versiyonlar mevcuttur',
    "Controllo della temperatura: regolazione precisa per una fusione uniforme dell'adesivo": 'Sıcaklık kontrolü: yapıştırıcının homojen eritilmesi için hassas ayar',
    "Manutenzione semplificata: struttura progettata per facilitare l'accesso ai componenti": 'Kolay bakım: bileşenlere erişimi kolaylaştırmak üzere tasarlanmış yapı',
    'Flessibilità applicativa: compatibilità con tubi riscaldati e applicatori manuali e automatici': 'Uygulama esnekliği: ısıtmalı hortumlar ile manuel ve otomatik aplikatörlerle uyumluluk',
    'Configurazioni opzionali: alimentazione automatica del granulato, controllo dei pattern di applicazione e pannello operatore remoto': 'Opsiyonel konfigürasyonlar: otomatik granül besleme, uygulama deseni kontrolü ve uzaktan operatör paneli',
    'Grazie alle loro caratteristiche si prestano pertanto ad essere installati in qualsiasi linea produttiva.': 'Özellikleri sayesinde hemen hemen her üretim hattına kurulabilirler.',
    'Grazie al nostro servizio interno di progettazione, concepiamo e realizziamo progetti custom per rispondere anche a richieste di piccole e medie automazioni.': 'Şirket içi mühendislik hizmetimiz sayesinde küçük ve orta ölçekli otomasyon ihtiyaçlarını da karşılamak üzere özel projeler tasarlayıp üretiyoruz.',
    'Grazie al nostro servizio interno di progettazione, concepiamo e realizziamo progetti custom, sviluppati attorno alle reali esigenze produttive del cliente. Siamo in grado di rispondere anche a richieste per piccole e medie automazioni.': 'Şirket içi mühendislik hizmetimiz sayesinde müşterinin gerçek üretim ihtiyaçlarına göre özel projeler tasarlayıp üretiyoruz. Küçük ve orta ölçekli otomasyon taleplerini de karşılayabiliyoruz.',
    'NORDSON 8503686 – Applicatore hot-melt H201-T': 'NORDSON 8503686 – H201-T hot-melt aplikatörü',
    'NORDSON 729450C – Scheda controllo temperatura TR6K+': 'NORDSON 729450C – TR6K+ sıcaklık kontrol kartı',
    'Applicatore hot-melt Nordson H201-T, codice 8503686, configurato con singolo modulo per l’erogazione di adesivo termofusibile.': 'Nordson H201-T hot-melt aplikatörü, 8503686 kodlu, termoplastik yapıştırıcı uygulaması için tek modüllü konfigürasyon.',
    'Il gruppo utilizza un sistema di azionamento pneumatico Air Open / Spring Close ed è dotato di controllo temperatura tramite sensore RTD. È progettato per applicazioni industriali di dosaggio hot-melt con erogazione precisa e ripetibile.': 'Ünite Air Open / Spring Close pnömatik tahrik sistemi kullanır ve RTD sensörü ile sıcaklık kontrolüne sahiptir. Hassas ve tekrarlanabilir uygulama gerektiren endüstriyel hot-melt dozaj uygulamaları için tasarlanmıştır.',
    'Caratteristiche principali:': 'Başlıca özellikler:',
    'Produttore: Nordson': 'Üretici: Nordson',
    'Codice prodotto: 8503686': 'Ürün kodu: 8503686',
    'Modello: H201-T': 'Model: H201-T',
    'Tipologia: applicatore / pistola hot-melt': 'Tip: hot-melt aplikatörü / tabancası',
    'Configurazione: 1 modulo': 'Konfigürasyon: 1 modül',
    'Azionamento: Air Open / Spring Close': 'Tahrik: Air Open / Spring Close',
    'Controllo temperatura: RTD': 'Sıcaklık kontrolü: RTD',
    'Alimentazione: 240 V': 'Besleme: 240 V',
    'Applicazione: erogazione adesivi hot-melt': 'Uygulama: hot-melt yapıştırıcı dozajı',
  },
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFKC')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s*([,;:!?])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('it-IT')
}

const NORMALIZED_TRANSLATIONS = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([language, dictionary]) => [
    language,
    new Map(Object.entries(dictionary).map(([source, translated]) => [normalizeText(source), translated])),
  ])
)

const NORMALIZED_CMS_OVERRIDES = Object.fromEntries(
  Object.entries(CMS_TRANSLATION_OVERRIDES).map(([language, dictionary]) => [
    language,
    new Map(Object.entries(dictionary).map(([source, translated]) => [normalizeText(source), translated])),
  ])
)

const KNOWN_TRANSLATION_FRAGMENTS = Object.fromEntries(
  CMS_LANGUAGES.filter((language) => language !== 'it').map((language) => {
    const merged = new Map([
      ...Array.from(NORMALIZED_TRANSLATIONS[language]?.entries?.() || []),
      ...Array.from(NORMALIZED_CMS_OVERRIDES[language]?.entries?.() || []),
    ])
    const fragments = Array.from(merged.entries())
      .filter(([source]) => source.length >= 28)
      .sort((a, b) => b[0].length - a[0].length)
    return [language, fragments]
  })
)

function translateKnownFragments(value, language) {
  const source = normalizeText(value)
  if (!source) return null
  const fragments = KNOWN_TRANSLATION_FRAGMENTS[language] || []
  const memo = new Map()

  function walk(position) {
    while (source[position] === ' ') position += 1
    if (position >= source.length) return []
    if (memo.has(position)) return memo.get(position)

    for (const [knownSource, translated] of fragments) {
      if (!source.startsWith(knownSource, position)) continue
      const nextPosition = position + knownSource.length
      const nextChar = source[nextPosition]
      if (nextChar && nextChar !== ' ' && !/[.!?]/.test(nextChar)) continue
      const rest = walk(nextPosition)
      if (rest) {
        const result = [translated, ...rest]
        memo.set(position, result)
        return result
      }
    }

    memo.set(position, null)
    return null
  }

  const translatedParts = walk(0)
  return translatedParts?.length ? translatedParts.join(' ') : null
}

export function isLocalizedValue(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.__i18n === true)
}

export function translateKnownText(value, language) {
  if (language === 'it' || typeof value !== 'string' || !value.trim()) return value
  const normalized = normalizeText(value)
  const override = CMS_TRANSLATION_OVERRIDES[language]?.[value] || NORMALIZED_CMS_OVERRIDES[language]?.get(normalized)
  if (override) return override
  const direct = TRANSLATIONS[language]?.[value]
  if (direct) return direct
  const known = NORMALIZED_TRANSLATIONS[language]?.get(normalized)
  if (known) return known

  // Supporta paragrafi CMS ottenuti unendo più blocchi/frasi già tradotti.
  // La traduzione viene usata solo se l'intero testo è coperto da frammenti completi noti:
  // niente sostituzioni parola-per-parola e quindi niente frasi ibride italiano/inglese.
  const translatedFragments = translateKnownFragments(value, language)
  if (translatedFragments) return translatedFragments

  // Per contenuti CMS completamente nuovi la traduzione va inserita esplicitamente nell'editor IT/EN/TR.
  return value
}

export function readLocalizedText(value, language = 'it') {
  if (isLocalizedValue(value)) {
    const selected = value[language]
    if (typeof selected === 'string' && selected.trim()) return selected
    const italian = typeof value.it === 'string' ? value.it : ''
    return language === 'it' ? italian : translateKnownText(italian, language)
  }

  if (typeof value !== 'string') return value ?? ''
  return translateKnownText(value, language)
}

export function writeLocalizedText(value, language, nextText) {
  const base = isLocalizedValue(value)
    ? { ...value }
    : {
        __i18n: true,
        it: typeof value === 'string' ? value : '',
        en: '',
        tr: '',
      }

  base.__i18n = true
  base[language] = nextText
  return base
}

export function hasExplicitTranslation(value, language) {
  if (language === 'it') return true
  return isLocalizedValue(value) && typeof value[language] === 'string' && Boolean(value[language].trim())
}

export function resolveLocalizedContent(value, language = 'it') {
  if (isLocalizedValue(value)) return readLocalizedText(value, language)
  if (Array.isArray(value)) return value.map((item) => resolveLocalizedContent(item, language))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveLocalizedContent(child, language)])
    )
  }
  if (typeof value === 'string') return translateKnownText(value, language)
  return value
}
