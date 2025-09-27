import { ChatData } from '../types/chat'

const CHAT_DATA_KEY = 'chatData'
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

// IndexedDB wrapper with cross-browser support and error handling
const DB_NAME = 'WhatsAppAnalyzer';
const STORE_NAME = 'chatData';
const DB_VERSION = 1;

interface DBOptions {
  onError?: (error: Error) => void;
  onBlocked?: () => void;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;

  constructor(dbName: string = DB_NAME, version: number = DB_VERSION) {
    this.dbName = dbName;
    this.version = version;
  }

  async init(options: DBOptions = {}): Promise<boolean> {
    if (!this.isIndexedDBSupported()) {
      throw new Error('IndexedDB is not supported in this browser');
    }

    try {
      this.db = await this.openDatabase(options);
      return true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  private isIndexedDBSupported(): boolean {
    try {
      return !!window.indexedDB;
    } catch (e) {
      return false;
    }
  }

  private openDatabase(options: DBOptions): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbName, this.version);

        request.onerror = (event) => {
          const error = new Error(`Failed to open database: ${(event.target as IDBOpenDBRequest).error?.message}`);
          options.onError?.(error);
          reject(error);
        };

        request.onblocked = () => {
          options.onBlocked?.();
          reject(new Error('Database opening blocked. Please close other tabs with this site open.'));
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object store if it doesn't exist
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          
          // Handle database closing
          this.db.onclose = () => {
            this.db = null;
          };

          // Handle version change
          this.db.onversionchange = () => {
            if (this.db) {
              this.db.close();
              this.db = null;
              options.onBlocked?.();
            }
          };

          resolve(this.db);
        };
      } catch (error) {
        reject(new Error('Failed to open IndexedDB: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }

  async store(key: string, data: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          throw new Error('Database not initialized');
        }

        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.put(data, key);

        request.onerror = () => {
          reject(new Error('Failed to store data in IndexedDB'));
        };

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = (event) => {
          reject(new Error(`Transaction failed: ${(event.target as IDBTransaction).error?.message}`));
        };
      } catch (error) {
        reject(new Error('Failed to store data: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }

  async retrieve(key: string): Promise<any> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          throw new Error('Database not initialized');
        }

        const transaction = this.db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onerror = () => {
          reject(new Error('Failed to retrieve data from IndexedDB'));
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      } catch (error) {
        reject(new Error('Failed to retrieve data: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          throw new Error('Database not initialized');
        }

        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onerror = () => {
          reject(new Error('Failed to delete data from IndexedDB'));
        };

        transaction.oncomplete = () => {
          resolve();
        };
      } catch (error) {
        reject(new Error('Failed to delete data: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }

  async clear(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.db) {
          throw new Error('Database not initialized');
        }

        const transaction = this.db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => {
          reject(new Error('Failed to clear IndexedDB'));
        };

        transaction.oncomplete = () => {
          resolve();
        };
      } catch (error) {
        reject(new Error('Failed to clear data: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create and export a singleton instance
export const dbService = new IndexedDBService();

// Export types and constants
export type { DBOptions };
export { DB_NAME, STORE_NAME, DB_VERSION };

export async function storeChatData(data: ChatData): Promise<void> {
  try {
    const serializedData = JSON.stringify(data)
    if (serializedData.length <= CHUNK_SIZE) {
      localStorage.setItem(CHAT_DATA_KEY, serializedData)
    } else {
      const chunks = Math.ceil(serializedData.length / CHUNK_SIZE)
      for (let i = 0; i < chunks; i++) {
        const chunk = serializedData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        localStorage.setItem(`${CHAT_DATA_KEY}_${i}`, chunk)
      }
      localStorage.setItem(`${CHAT_DATA_KEY}_chunks`, chunks.toString())
    }
  } catch (err) {
    console.error('Error storing chat data:', err)
    throw new Error('Failed to store chat data. The file might be too large.')
  }
}

export async function retrieveChatData(): Promise<ChatData | null> {
  try {
    const chunksStr = localStorage.getItem(`${CHAT_DATA_KEY}_chunks`)
    if (chunksStr) {
      const chunks = parseInt(chunksStr, 10)
      let serializedData = ''
      for (let i = 0; i < chunks; i++) {
        const chunk = localStorage.getItem(`${CHAT_DATA_KEY}_${i}`)
        if (chunk) serializedData += chunk
      }
      return JSON.parse(serializedData)
    } else {
      const serializedData = localStorage.getItem(CHAT_DATA_KEY)
      return serializedData ? JSON.parse(serializedData) : null
    }
  } catch (err) {
    console.error('Error retrieving chat data:', err)
    throw new Error('Failed to retrieve stored chat data.')
  }
}

