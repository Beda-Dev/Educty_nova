// lib/indexedDBStorage.ts
import { StateStorage } from 'zustand/middleware';
import { PersistStorage } from 'zustand/middleware';

interface IndexedDBStorage {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
}

// Configuration IndexedDB
const DB_NAME = 'school-management-db';
const DB_VERSION = 1;
const STORE_NAME = 'zustand-store';

class IndexedDBStorageImpl implements IndexedDBStorage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async getItem(name: string): Promise<string | null> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.get(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result ? String(request.result) : null);
      });
    } catch (error) {
      console.error('IndexedDB getItem error:', error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.put(value, name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      // En environnement SSR ou si IndexedDB est indisponible, on log et on no-op
      console.warn('IndexedDB setItem skipped (unavailable):', error);
      return;
    }
  }

  async removeItem(name: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = store.delete(name);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('IndexedDB removeItem error:', error);
      throw error;
    }
  }
}

// Adapter pour Zustand avec le bon type
export const createIndexedDBStorage = <T>(): PersistStorage<T> => {
  const idbStorage = new IndexedDBStorageImpl();

  return {
    getItem: async (name: string) => {
      const value = await idbStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    },
    setItem: async (name: string, value: any): Promise<void> => {
      await idbStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: async (name: string): Promise<void> => {
      await idbStorage.removeItem(name);
    },
  } as PersistStorage<T>;
};