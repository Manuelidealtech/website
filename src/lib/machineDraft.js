const DB_NAME = 'idealtech-admin-drafts'
const DB_VERSION = 1
const STORE_NAME = 'machine-files'
const FILE_KEY = 'new-machine-files'

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      resolve(null)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveMachineDraftFiles(files) {
  const db = await openDb()
  if (!db) return

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(files, FILE_KEY)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })

  db.close()
}

export async function loadMachineDraftFiles() {
  const db = await openDb()
  if (!db) return []

  const files = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).get(FILE_KEY)
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })

  db.close()
  return Array.from(files || [])
}

export async function clearMachineDraftFiles() {
  const db = await openDb()
  if (!db) return

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(FILE_KEY)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })

  db.close()
}
