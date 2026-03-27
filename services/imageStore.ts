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

    console.log(`[ImageStore] Initializing IndexedDB: ${this.dbName}`);
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn("[ImageStore] IndexedDB initialization timed out (10s), falling back to memory cache.");
        this.isFallbackMode = true;
        resolve(null);
      }, 10000);

      try {
        if (!window.indexedDB) {
          clearTimeout(timeout);
          console.warn("[ImageStore] IndexedDB not supported, falling back to memory cache.");
          this.isFallbackMode = true;
          resolve(null);
          return;
        }

        const request = indexedDB.open(this.dbName, 2);
        
        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          console.log(`[ImageStore] Upgrading IndexedDB to version ${db.version}`);
          if (!db.objectStoreNames.contains(this.storeName)) {
            console.log(`[ImageStore] Creating object store: ${this.storeName}`);
            db.createObjectStore(this.storeName);
          }
        };

        request.onsuccess = () => {
          clearTimeout(timeout);
          console.log('[ImageStore] IndexedDB initialized successfully');
          this.db = request.result;
          
          // Add error handler for the database connection
          this.db!.onversionchange = () => {
            this.db!.close();
            this.db = null;
            console.warn("[ImageStore] Database version changed elsewhere, closing connection.");
          };

          resolve(this.db!);
        };

        request.onerror = (event: any) => {
          clearTimeout(timeout);
          console.error("[ImageStore] IndexedDB error during open:", event.target.error);
          this.isFallbackMode = true;
          resolve(null);
        };

        request.onblocked = () => {
          clearTimeout(timeout);
          console.warn("[ImageStore] IndexedDB blocked. Falling back to memory cache.");
          this.isFallbackMode = true;
          resolve(null);
        };
      } catch (e) {
        clearTimeout(timeout);
        console.error("[ImageStore] Failed to initialize IndexedDB:", e);
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
    console.log(`[ImageStore] Storing image with key: ${key}`);
    const db = await this.init();
    
    if (!db || this.isFallbackMode) {
      console.log(`[ImageStore] Using memory cache for: ${key}`);
      this.memoryCache.set(key, dataUrl);
      return key;
    }
    
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(dataUrl, key);
        
        request.onsuccess = () => {
          console.log(`[ImageStore] Successfully stored in IndexedDB: ${key}`);
          resolve(key);
        };
        request.onerror = (err: any) => {
          console.error(`[ImageStore] Error storing in IndexedDB: ${key}`, err);
          this.memoryCache.set(key, dataUrl);
          resolve(key);
        };
      } catch (e) {
        console.error(`[ImageStore] Transaction error for: ${key}`, e);
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
    if (!key.startsWith('vault:')) {
      console.log(`[ImageStore] Not a vault reference, returning as-is: ${key.substring(0, 30)}...`);
      return key;
    }
    const actualKey = key.replace('vault:', '');
    console.log(`[ImageStore] Retrieving vault image: ${actualKey}`);
    
    if (this.memoryCache.has(actualKey)) {
      console.log(`[ImageStore] Found in memory cache: ${actualKey}`);
      return this.memoryCache.get(actualKey) || null;
    }

    const db = await this.init();
    if (!db || this.isFallbackMode) {
      console.warn(`[ImageStore] DB not available for retrieval: ${actualKey}`);
      return null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(actualKey);
        
        request.onsuccess = () => {
          if (request.result) {
            console.log(`[ImageStore] Found in IndexedDB: ${actualKey}`);
          } else {
            console.warn(`[ImageStore] Not found in IndexedDB: ${actualKey}`);
          }
          resolve(request.result || null);
        };
        request.onerror = (err: any) => {
          console.error(`[ImageStore] Error retrieving from IndexedDB: ${actualKey}`, err);
          resolve(null);
        };
      } catch (e) {
        console.error(`[ImageStore] Transaction error for retrieval: ${actualKey}`, e);
        resolve(null);
      }
    });
  }

  /**
   * Gets a URL that is safe for canvas operations (e.g. data URL or blob URL).
   * If it's a cloud URL, it fetches it as a blob.
   */
  async getSafeUrl(key: string | undefined | null): Promise<string | null> {
    if (!key) return null;
    
    // If it's already a safe URL, return it
    if (key.startsWith('data:') || key.startsWith('blob:')) {
      return key;
    }

    // Resolve vault reference first
    const url = await this.getImage(key);
    if (!url) {
      console.warn(`[ImageStore] Could not resolve key: ${key}`);
      return null;
    }
    
    // If the resolved URL is a data/blob URL, return it
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    
    // If it's a cloud URL, fetch it as a blob to avoid CORS issues
    if (url.startsWith('http')) {
      try {
        console.log(`[ImageStore] Fetching cloud image as blob: ${url.substring(0, 50)}...`);
        const { firebaseService } = await import('./firebaseService');
        const blob = await firebaseService.getBlobFromUrl(url);
        if (!blob) {
          console.warn(`[ImageStore] Failed to fetch blob for: ${url}, returning raw URL.`);
          return url; // Fallback to raw URL
        }
        const blobUrl = URL.createObjectURL(blob);
        console.log(`[ImageStore] Created blob URL: ${blobUrl}`);
        return blobUrl;
      } catch (e) {
        console.error("[ImageStore] Failed to create safe URL for cloud image:", e);
        return url; 
      }
    }
    
    return url;
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
