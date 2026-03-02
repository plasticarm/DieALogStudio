import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { AppSession, ProjectState } from "../types";

/**
 * Helper to recursively remove undefined values from an object.
 * Firestore does not allow undefined values in documents.
 */
const sanitizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(v => sanitizeData(v));
  } else if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, sanitizeData(v)])
    );
  }
  return data;
};

/**
 * Firebase Service
 * Handles Firestore and Storage operations for the application.
 */
export const firebaseService = {
  /**
   * Syncs a session to Firestore.
   */
  async saveSession(session: AppSession): Promise<void> {
    if (!session.userId) throw new Error("User ID is required to save session");
    const sessionRef = doc(db, "sessions", session.id);
    
    // Sanitize data to remove undefined values which Firestore doesn't support
    const cleanSession = sanitizeData(session);
    
    await setDoc(sessionRef, {
      ...cleanSession,
      lastModified: Date.now()
    });
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
  }
};
