import { BrowserCompatibilityManager } from "./browser-compatibility" // Assuming this exists and works

interface StoredItem<T> {
  value: T
  timestamp: number
  ttl?: number | null
  version?: string // For data versioning
}

const CURRENT_DATA_VERSION = "1.0" // Example version for your app's data structure

export class StorageManager {
  private static instance: StorageManager
  private compatibilityManager: BrowserCompatibilityManager
  private readonly STORAGE_PREFIX = "mirror_app_" // Unique prefix for your app
  private readonly MAX_RETRIES_ON_QUOTA_EXCEEDED = 1

  private constructor() {
    this.compatibilityManager = BrowserCompatibilityManager.getInstance()
    // No need for periodic monitoring if we handle quota errors reactively
    // and Supabase handles its own session persistence.
    // If you still want periodic cleanup for app data:
    // this.initializePeriodicMaintenance();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  // private initializePeriodicMaintenance(): void {
  //   setInterval(async () => {
  //     console.debug("Performing periodic storage maintenance...");
  //     await this.performMaintenance("local");
  //     await this.performMaintenance("session");
  //   }, 5 * 60 * 1000); // Every 5 minutes
  // }

  private getStorage(type: "local" | "session"): Storage | null {
    if (typeof window === "undefined") return null
    return type === "local" ? localStorage : sessionStorage
  }

  async setItem<T>(
    key: string,
    value: T,
    options: {
      storageType?: "local" | "session"
      ttl?: number // Time-to-live in milliseconds
      version?: string
    } = {},
    retries = 0,
  ): Promise<boolean> {
    const { storageType = "local", ttl, version = CURRENT_DATA_VERSION } = options
    const storage = this.getStorage(storageType)
    if (!storage) return false

    const prefixedKey = `${this.STORAGE_PREFIX}${key}`
    const itemToStore: StoredItem<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl ? Date.now() + ttl : null,
      version,
    }

    try {
      const serializedValue = JSON.stringify(itemToStore)
      // Future: Consider compression here if values are large:
      // const compressedValue = await compress(serializedValue);
      // storage.setItem(prefixedKey, compressedValue);
      storage.setItem(prefixedKey, serializedValue)
      return true
    } catch (error: any) {
      if (
        (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        retries < this.MAX_RETRIES_ON_QUOTA_EXCEEDED
      ) {
        console.warn(`Storage quota exceeded for key "${prefixedKey}". Attempting cleanup and retry...`)
        await this.performMaintenance(storageType, true) // Aggressive cleanup
        return this.setItem(key, value, options, retries + 1)
      }
      console.error(`Storage setItem failed for key "${prefixedKey}":`, error)
      return false
    }
  }

  async getItem<T = any>(
    key: string,
    options: {
      storageType?: "local" | "session"
      defaultValue?: T | null
    } = {},
  ): Promise<T | null> {
    const { storageType = "local", defaultValue = null } = options
    const storage = this.getStorage(storageType)
    if (!storage) return defaultValue

    const prefixedKey = `${this.STORAGE_PREFIX}${key}`

    try {
      const serializedValue = storage.getItem(prefixedKey)
      if (!serializedValue) return defaultValue

      // Future: Consider decompression here if values were compressed:
      // serializedValue = await decompress(serializedValue);

      const item: StoredItem<T> = JSON.parse(serializedValue)

      // TTL Check
      if (item.ttl && Date.now() > item.ttl) {
        console.log(`Item "${prefixedKey}" expired. Removing.`)
        this.removeItem(key, { storageType })
        return defaultValue
      }

      // Version Check (optional: implement migration or discard logic)
      if (item.version !== CURRENT_DATA_VERSION) {
        console.warn(
          `Item "${prefixedKey}" has outdated version ${item.version}. Expected ${CURRENT_DATA_VERSION}. Discarding.`,
        )
        this.removeItem(key, { storageType })
        return defaultValue // Or attempt migration
      }

      return item.value
    } catch (error) {
      console.error(`Storage getItem failed for key "${prefixedKey}", removing corrupted item:`, error)
      // If parsing fails, the item is likely corrupted, remove it.
      storage.removeItem(prefixedKey)
      return defaultValue
    }
  }

  removeItem(key: string, options: { storageType?: "local" | "session" } = {}): void {
    const { storageType = "local" } = options
    const storage = this.getStorage(storageType)
    if (!storage) return

    const prefixedKey = `${this.STORAGE_PREFIX}${key}`
    try {
      storage.removeItem(prefixedKey)
    } catch (error) {
      console.error(`Storage removeItem failed for key "${prefixedKey}":`, error)
    }
  }

  async performMaintenance(storageType: "local" | "session", aggressive = false): Promise<void> {
    const storage = this.getStorage(storageType)
    if (!storage) return

    console.log(`Performing ${aggressive ? "aggressive " : ""}maintenance for ${storageType}Storage...`)
    let itemsRemovedCount = 0
    const keysToRemove: { key: string; timestamp: number }[] = []

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        try {
          const itemString = storage.getItem(key)
          if (itemString) {
            const item: StoredItem<any> = JSON.parse(itemString)
            if ((item.ttl && Date.now() > item.ttl) || aggressive) {
              keysToRemove.push({ key, timestamp: item.timestamp })
            }
          } else {
            // Key exists but no item string, likely an anomaly
            keysToRemove.push({ key, timestamp: 0 })
          }
        } catch (e) {
          // Corrupted item, mark for removal
          console.warn(`Corrupted item found during maintenance: ${key}. Marking for removal.`)
          keysToRemove.push({ key, timestamp: 0 })
        }
      }
    }

    // If aggressive, sort by oldest timestamp to remove oldest items first
    if (aggressive) {
      keysToRemove.sort((a, b) => a.timestamp - b.timestamp)
      // Remove a certain percentage or number of oldest items if still over threshold
      // This part needs integration with `checkStorageQuota`
      // For now, we'll remove all identified for aggressive cleanup (which includes expired)
    }

    for (const { key } of keysToRemove) {
      storage.removeItem(key)
      itemsRemovedCount++
    }

    console.log(`Storage maintenance completed for ${storageType}. Removed ${itemsRemovedCount} items.`)

    // Optional: Check quota after cleanup
    // const quota = await this.compatibilityManager.checkStorageQuota(storageType);
    // if (quota && quota.percentage > 0.8) {
    //   console.warn(`${storageType}Storage usage still high after cleanup: ${quota.percentage * 100}%`);
    // }
  }

  async clearAllAppStorage(storageType: "local" | "session"): Promise<void> {
    const storage = this.getStorage(storageType)
    if (!storage) return

    console.warn(`Clearing all app-specific data from ${storageType}Storage...`)
    const keysToRemove: string[] = []
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => storage.removeItem(key))
    console.log(`Cleared ${keysToRemove.length} app-specific items from ${storageType}Storage.`)
  }

  // IndexedDB methods can remain if you use them for larger, structured offline data.
  // For the "quota exceeded" issue, localStorage is the primary concern.
  // ... (setIndexedDBItem, getIndexedDBItem, removeIndexedDBItem from your existing code)
  // Ensure they also handle errors gracefully.
  private async setIndexedDBItem(key: string, data: any): Promise<boolean> {
    return new Promise((resolve) => {
      const request = indexedDB.open("AppStorage", 1)

      request.onerror = () => resolve(false)

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["storage"], "readwrite")
        const store = transaction.objectStore("storage")

        const putRequest = store.put({ key, data })
        putRequest.onsuccess = () => resolve(true)
        putRequest.onerror = () => resolve(false)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("storage")) {
          db.createObjectStore("storage", { keyPath: "key" })
        }
      }
    })
  }

  private async getIndexedDBItem(key: string): Promise<any> {
    return new Promise((resolve) => {
      const request = indexedDB.open("AppStorage", 1)

      request.onerror = () => resolve(null)

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["storage"], "readonly")
        const store = transaction.objectStore("storage")

        const getRequest = store.get(key)
        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result ? result.data : null)
        }
        getRequest.onerror = () => resolve(null)
      }
    })
  }

  private async removeIndexedDBItem(key: string): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open("AppStorage", 1)

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["storage"], "readwrite")
        const store = transaction.objectStore("storage")

        const deleteRequest = store.delete(key)
        deleteRequest.onsuccess = () => resolve()
        deleteRequest.onerror = () => resolve()
      }

      request.onerror = () => resolve()
    })
  }
}
