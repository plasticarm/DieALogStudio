import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage, default as app } from "./firebase";
import { AppSession, ProjectState } from "../types";

/**
 * Helper to recursively remove undefined values from an object.
 * Firestore does not allow undefined values in documents.
 */
const sanitizeData = (data: any): any => {
  if (data === null || data === undefined) return null;
  
  if (Array.isArray(data)) {
    return data.map(v => sanitizeData(v));
  } 
  
  if (typeof data === 'object') {
    // Handle Date objects
    if (data instanceof Date) return data.getTime();
    
    // Handle plain objects
    const entries = Object.entries(data);
    const sanitizedEntries = entries
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, sanitizeData(v)]);
    
    return Object.fromEntries(sanitizedEntries);
  }
  
  return data;
};

/**
 * Estimates the size of a JSON-serializable object in bytes.
 */
const estimateSize = (obj: any): number => {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch (e) {
    return 0;
  }
};

/**
 * Firebase Service
 * Handles Firestore and Storage operations for the application.
 */
export const firebaseService = {
  /**
   * Syncs a session to Firestore.
   */
  async saveSession(session: AppSession): Promise<number> {
    if (!session.userId) throw new Error("User ID is required to save session");
    const sessionRef = doc(db, "sessions", session.id);
    
    // Sanitize data to remove undefined values which Firestore doesn't support
    const cleanSession = sanitizeData(session);
    const timestamp = session.lastModified || Date.now();
    
    const finalDoc = {
      ...cleanSession,
      lastModified: timestamp
    };

    const size = estimateSize(finalDoc);
    if (size > 1000000) { // Slightly less than 1MB to be safe
      console.error(`Document size (${size} bytes) exceeds Firestore limit. Pruning required.`);
      throw new Error(`Document too large (${(size / 1024 / 1024).toFixed(2)}MB). Please prune history or assets.`);
    }
    
    await setDoc(sessionRef, finalDoc);
    return timestamp;
  },

  /**
   * Loads a session from Firestore.
   */
  async loadSession(sessionId: string): Promise<AppSession | null> {
    const sessionRef = doc(db, "sessions", sessionId);
    const docSnap = await getDoc(sessionRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppSession;
    }
    return null;
  },

  /**
   * Loads all sessions for a specific user.
   */
  async loadUserSessions(userId: string): Promise<AppSession[]> {
    const sessionsRef = collection(db, "sessions");
    const q = query(sessionsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const sessions: AppSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push(doc.data() as AppSession);
    });
    return sessions;
  },

  /**
   * Deletes a session from Firestore.
   */
  async deleteSession(sessionId: string): Promise<void> {
    const sessionRef = doc(db, "sessions", sessionId);
    await deleteDoc(sessionRef);
  },

  /**
   * Uploads an image to Firebase Storage and returns the download URL.
   */
  async uploadImage(dataUrl: string, path: string): Promise<string> {
    if (!dataUrl.startsWith('data:')) return dataUrl;
    const storageRef = ref(storage, path);
    await uploadString(storageRef, dataUrl, 'data_url');
    return await getDownloadURL(storageRef);
  },

  /**
   * Deletes an image from Firebase Storage.
   */
  async deleteImage(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  /**
   * Fetches a blob from a Firebase Storage URL.
   * This is more reliable than direct fetch for canvas operations.
   */
  async getBlobFromUrl(url: string): Promise<Blob> {
    console.log(`[FirebaseService] Attempting to get blob from URL: ${url.substring(0, 100)}...`);
    
    const isFirebaseUrl = url.startsWith('gs://') || url.includes('firebasestorage.googleapis.com');
    
    // Helper function to use Firebase SDK
    const fetchViaSdk = async () => {
      const { ref, getBlob } = await import("firebase/storage");
      try {
        console.log("[FirebaseService] Creating storage ref from URL...");
        const storageRef = ref(storage, url);
        console.log("[FirebaseService] Successfully created storage ref, fetching blob...");
        const blob = await getBlob(storageRef);
        console.log(`[FirebaseService] Successfully fetched blob (${blob.size} bytes)`);
        return blob;
      } catch (sdkError: any) {
        console.warn(`[FirebaseService] SDK ref/getBlob failed (Code: ${sdkError?.code}), trying manual parsing:`, sdkError);
        
        // Manual parsing fallback for different buckets
        const bucketMatch = url.match(/\/b\/(.+?)\/o\//);
        const pathMatch = url.match(/\/o\/(.+?)(?:\?|$)/);
        
        if (bucketMatch && pathMatch) {
          const bucket = bucketMatch[1];
          const path = decodeURIComponent(pathMatch[1]);
          console.log(`[FirebaseService] Parsed bucket: ${bucket}, path: ${path}`);
          
          const { getStorage } = await import("firebase/storage");
          
          // Try to use the default storage if the bucket matches
          let storageToUse = storage;
          const defaultBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
          
          if (bucket !== defaultBucket && !defaultBucket?.includes(bucket) && !bucket.includes(defaultBucket || '')) {
            console.log(`[FirebaseService] Bucket ${bucket} differs from default ${defaultBucket}, creating new storage instance.`);
            storageToUse = getStorage(app, `gs://${bucket}`);
            storageToUse.maxOperationRetryTime = 3000;
          }
          
          const storageRef = ref(storageToUse, path);
          return await getBlob(storageRef);
        }
        
        throw sdkError;
      }
    };

    // For gs:// URLs, we MUST use the SDK
    if (url.startsWith('gs://')) {
      try {
        return await fetchViaSdk();
      } catch (error: any) {
        console.error("[FirebaseService] Failed to get blob from gs:// URL via SDK:", error);
        throw error;
      }
    }

    // For http(s) URLs, try standard fetch first (fastest, works if CORS is configured or URL is public)
    console.log(`[FirebaseService] Attempting standard fetch for: ${url.substring(0, 50)}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      console.log(`[FirebaseService] Fetch successful (${blob.size} bytes)`);
      return blob;
    } catch (fetchError) {
      console.warn("[FirebaseService] Fetch failed (likely CORS), trying server-side proxy:", fetchError);
      
      // Try server-side proxy to bypass CORS
      try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Proxy error! status: ${response.status}`);
        const blob = await response.blob();
        console.log(`[FirebaseService] Proxy fallback successful (${blob.size} bytes)`);
        return blob;
      } catch (proxyError) {
        console.warn("[FirebaseService] Proxy fallback failed:", proxyError);
        
        // If it's a Firebase URL and both fetch and proxy failed (e.g., private bucket without token),
        // try the SDK as a last resort.
        if (isFirebaseUrl) {
          console.log("[FirebaseService] Attempting SDK fallback for Firebase URL...");
          try {
            return await fetchViaSdk();
          } catch (sdkError: any) {
            console.error("[FirebaseService] SDK fallback failed:", sdkError);
            if (sdkError?.code === 'storage/retry-limit-exceeded') {
              console.error("[FirebaseService] Firebase Storage retry limit exceeded. This often indicates a CORS issue or an unreachable bucket. Please ensure CORS is configured for your bucket.");
            }
            throw sdkError;
          }
        }
        
        console.error("[FirebaseService] All fallback methods failed (fetch, proxy):", proxyError);
        throw proxyError;
      }
    }
  }
};
