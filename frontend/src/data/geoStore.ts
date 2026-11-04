import type { GeoLayerRecord } from './geojson'

const DATABASE_NAME = 'disaster-scope-geodata'
const DATABASE_VERSION = 1
const STORE_NAME = 'layers'
export const GEO_LAYERS_CHANGED_EVENT = 'disaster-scope:geo-layers-changed'

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('このブラウザーではIndexedDBを利用できません。'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('importedAt', 'importedAt', { unique: false })
        store.createIndex('category', 'category', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('データベースを開けませんでした。'))
    request.onblocked = () => reject(new Error('別のタブがデータベース更新を妨げています。ほかのタブを閉じて再試行してください。'))
  })
}

function completeTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('保存処理に失敗しました。'))
    transaction.onabort = () => reject(transaction.error ?? new Error('保存処理が中断されました。'))
  })
}

function notifyChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GEO_LAYERS_CHANGED_EVENT))
  }
}

export async function listGeoLayers(): Promise<GeoLayerRecord[]> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).getAll() as IDBRequest<GeoLayerRecord[]>
    const layers = await new Promise<GeoLayerRecord[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? [])
      request.onerror = () => reject(request.error ?? new Error('レイヤ一覧を読み込めませんでした。'))
    })
    return layers.sort((a, b) => b.importedAt.localeCompare(a.importedAt))
  } finally {
    database.close()
  }
}

export async function saveGeoLayer(layer: GeoLayerRecord): Promise<void> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put(layer)
    await completeTransaction(transaction)
    notifyChanged()
  } finally {
    database.close()
  }
}

export async function deleteGeoLayer(id: string): Promise<void> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(id)
    await completeTransaction(transaction)
    notifyChanged()
  } finally {
    database.close()
  }
}

export async function clearGeoLayers(): Promise<void> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).clear()
    await completeTransaction(transaction)
    notifyChanged()
  } finally {
    database.close()
  }
}
