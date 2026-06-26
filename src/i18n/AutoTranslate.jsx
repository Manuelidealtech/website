import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { TRANSLATIONS } from './translations'
import { useLanguage } from './LanguageContext'

const ATTRIBUTE_NAMES = ['alt', 'aria-label', 'placeholder', 'title']
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEXTAREA', 'CODE', 'PRE'])

function normalizeText(value = '') {
  return value.replace(/\s+/g, ' ').trim()
}

function splitWhitespace(value = '') {
  return {
    leading: value.match(/^\s*/)?.[0] || '',
    trailing: value.match(/\s*$/)?.[0] || '',
  }
}

function buildReverseMaps() {
  const reverseMaps = {}

  Object.entries(TRANSLATIONS).forEach(([language, dictionary]) => {
    reverseMaps[language] = new Map()

    Object.entries(dictionary).forEach(([source, translated]) => {
      reverseMaps[language].set(normalizeText(translated), source)
    })
  })

  return reverseMaps
}

const REVERSE_TRANSLATIONS = buildReverseMaps()

function getSourceText(normalizedValue) {
  if (!normalizedValue) return ''

  if (TRANSLATIONS.en?.[normalizedValue] || TRANSLATIONS.tr?.[normalizedValue]) {
    return normalizedValue
  }

  for (const reverseMap of Object.values(REVERSE_TRANSLATIONS)) {
    const source = reverseMap.get(normalizedValue)
    if (source) return source
  }

  return ''
}

function translateValue(value, language) {
  const normalizedValue = normalizeText(value)
  const source = getSourceText(normalizedValue)

  if (!source) return value

  const { leading, trailing } = splitWhitespace(value)
  const translated = language === 'it'
    ? source
    : TRANSLATIONS[language]?.[source] || source

  return `${leading}${translated}${trailing}`
}

function shouldSkipNode(node) {
  const parent = node.parentElement
  if (!parent) return true
  if (parent.closest('[data-no-translate]')) return true
  return SKIP_TAGS.has(parent.tagName)
}

function translateTextNode(node, language) {
  if (shouldSkipNode(node)) return
  const nextValue = translateValue(node.nodeValue, language)

  if (nextValue !== node.nodeValue) {
    node.nodeValue = nextValue
  }
}

function translateElementAttributes(element, language) {
  if (element.closest('[data-no-translate]')) return
  if (SKIP_TAGS.has(element.tagName) && element.tagName !== 'TEXTAREA') return

  ATTRIBUTE_NAMES.forEach((attributeName) => {
    const currentValue = element.getAttribute(attributeName)
    if (!currentValue) return

    const nextValue = translateValue(currentValue, language)
    if (nextValue !== currentValue) {
      element.setAttribute(attributeName, nextValue)
    }
  })
}

function translateRoot(root, language) {
  if (!root) return

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
    return
  }

  const elementRoot = root.nodeType === Node.ELEMENT_NODE ? root : document.body

  if (elementRoot?.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributes(elementRoot, language)
  }

  const walker = document.createTreeWalker(
    elementRoot,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT
          if (SKIP_TAGS.has(node.tagName) && node.tagName !== 'TEXTAREA') return NodeFilter.FILTER_REJECT
          return NodeFilter.FILTER_ACCEPT
        }

        return NodeFilter.FILTER_SKIP
      },
    }
  )

  const nodes = []
  while (walker.nextNode()) {
    nodes.push(walker.currentNode)
  }

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      translateTextNode(node, language)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(node, language)
    }
  })
}

export default function AutoTranslate() {
  const { language } = useLanguage()
  const location = useLocation()

  const observerConfig = useMemo(
    () => ({
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRIBUTE_NAMES,
    }),
    []
  )

  useEffect(() => {
    let scheduled = false

    const applyTranslation = () => {
      scheduled = false
      translateRoot(document.body, language)
    }

    const scheduleTranslation = () => {
      if (scheduled) return
      scheduled = true
      window.requestAnimationFrame(applyTranslation)
    }

    scheduleTranslation()

    const observer = new MutationObserver(scheduleTranslation)
    observer.observe(document.body, observerConfig)

    return () => {
      observer.disconnect()
    }
  }, [language, location.pathname, observerConfig])

  return null
}
