/**
 * ImageStore Service
 * Provides a persistent local cache for large image data using IndexedDB.
 * This bypasses the 5MB-10MB limit of localStorage.
 */

export class ImageStore {
  private dbName = 'DieALogVault';
  private storeName = 'image_cache';
  private db: IDBDatabase | null = null;
  private memoryCache: Map<string, string> = new Map();
  private isFallbackMode = false;

  private async init(): Promise<IDBDatabase | null> {
    if (this.db) return this.db;
    if (this.isFallbackMode) return null;

    return new Promise((resolve) => {
      try {
        if (!window.indexedDB) {
          console.warn("IndexedDB not supported, falling back to memory cache.");
          this.isFallbackMode = true;
          resolve(null);
          return;
        }

        const request = indexedDB.open(this.dbName, 2);
        
        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db!);
        };

        request.onerror = (event: any) => {
          console.error("IndexedDB error:", event.target.error);
          this.isFallbackMode = true;
          resolve(null);
        };
      } catch (e) {
        console.error("Failed to initialize IndexedDB:", e);
        this.isFallbackMode = true;
        resolve(null);
      }
    });
  }

  /**
   * Stores an image in the cache.
   * Returns a cache key that can be used to retrieve it later.
   */
  async storeImage(dataUrl: string, id?: string): Promise<string> {
    const key = id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const db = await this.init();
    
    if (!db || this.isFallbackMode) {
      this.memoryCache.set(key, dataUrl);
      return key;
    }
    
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(dataUrl, key);
        
        request.onsuccess = () => resolve(key);
        request.onerror = () => {
          this.memoryCache.set(key, dataUrl);
          resolve(key);
        };
      } catch (e) {
        this.memoryCache.set(key, dataUrl);
        resolve(key);
      }
    });
  }

  /**
   * Retrieves an image from the cache by its key.
   * If the key is not a vault reference, it returns the key as-is.
   */
  async getImage(key: string | undefined | null): Promise<string | null> {
    if (!key) return null;
    if (!key.startsWith('vault:')) return key;
    const actualKey = key.replace('vault:', '');
    
    if (this.memoryCache.has(actualKey)) {
      return this.memoryCache.get(actualKey) || null;
    }

    const db = await this.init();
    if (!db || this.isFallbackMode) return null;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(actualKey);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  /**
   * Checks if a string is a vault reference.
   */
  isVaultReference(url: string): boolean {
    return typeof url === 'string' && url.startsWith('vault:');
  }

  /**
   * Helper to convert a data URL to a vault reference and store it.
   */
  async vaultify(url: string): Promise<string> {
    if (!url || !url.startsWith('data:')) return url;
    const key = await this.storeImage(url);
    return `vault:${key}`;
  }

  /**
   * Helper to upload a data URL to Firebase Storage and return the download URL.
   * This is useful for sharing or persistent cloud storage.
   */
  async cloudify(url: string, userId: string, pathPrefix: string = 'images'): Promise<string> {
    if (!url || !url.startsWith('data:')) return url;
    
    // Lazy import to avoid circular dependencies or loading firebase when not needed
    const { firebaseService } = await import('./firebaseService');
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
    const path = `${userId}/${pathPrefix}/${fileName}`;
    
    try {
      const cloudUrl = await firebaseService.uploadImage(url, path);
      return cloudUrl;
    } catch (error) {
      console.error("Cloud upload failed, falling back to vault:", error);
      return await this.vaultify(url);
    }
  }

  /**
   * Deletes an image from the cache.
   */
  async deleteImage(key: string): Promise<void> {
    if (!key || !key.startsWith('vault:')) return;
    const actualKey = key.replace('vault:', '');
    
    this.memoryCache.delete(actualKey);

    const db = await this.init();
    if (!db || this.isFallbackMode) return;

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(actualKey);
        
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }
}

export const imageStore = new ImageStore();
