// Utilitaires pour gérer le stockage des fichiers dans IndexedDB

interface StoredFileData {
  id: string
  file: File
  timestamp: number
  metadata: {
    originalName: string
    size: number
    type: string
  }
}

class IndexedDBFileStorage {
  private dbName = "student-registration-files-db"
  private dbVersion = 1
  private storeName = "files-store"
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  async init(): Promise<void> {
    // Si l'initialisation est déjà en cours, retourner la promesse existante
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      console.log(`Opening IndexedDB: ${this.dbName}, version ${this.dbVersion}`)
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", request.error)
        console.error("IndexedDB error event:", event)
        reject(request.error)
        this.initPromise = null
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log(`IndexedDB initialized successfully: ${this.dbName}, store: ${this.storeName}`)

        // Vérifier si le store existe
        if (!this.db.objectStoreNames.contains(this.storeName)) {
          console.error(`Store ${this.storeName} does not exist in database ${this.dbName}`)
          this.db.close()
          this.db = null
          indexedDB.deleteDatabase(this.dbName)
          this.initPromise = null
          reject(new Error(`Store ${this.storeName} not found`))
          return
        }

        resolve()
      }

      request.onupgradeneeded = (event) => {
        console.log(`Upgrading IndexedDB: ${this.dbName} to version ${this.dbVersion}`)
        const db = (event.target as IDBOpenDBRequest).result

        // Supprimer l'ancien store s'il existe
        if (db.objectStoreNames.contains(this.storeName)) {
          console.log(`Deleting existing store: ${this.storeName}`)
          db.deleteObjectStore(this.storeName)
        }

        // Créer le nouveau store
        const store = db.createObjectStore(this.storeName, { keyPath: "id" })
        store.createIndex("timestamp", "timestamp", { unique: false })
        console.log(`IndexedDB store created: ${this.storeName}`)
      }
    })

    return this.initPromise
  }

  async storeFile(file: File, customId?: string): Promise<string> {
    try {
      console.log("Starting file storage process:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      if (!this.db) {
        console.log("IndexedDB not initialized, attempting to initialize...")
        await this.init()
      }

      if (!this.db) {
        console.error("Failed to initialize IndexedDB")
        throw new Error("IndexedDB not initialized")
      }

      const id = customId || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("Generated file ID:", id)

      const fileData: StoredFileData = {
        id,
        file,
        timestamp: Date.now(),
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      }

      console.log("File data to store:", {
        id: fileData.id,
        name: fileData.metadata.originalName,
        size: fileData.metadata.size,
        type: fileData.metadata.type
      })

      return new Promise((resolve, reject) => {
        try {
          console.log("Starting IndexedDB transaction...")
          const transaction = this.db!.transaction([this.storeName], "readwrite")

          transaction.oncomplete = () => {
            console.log("Transaction completed successfully")
          }

          transaction.onerror = (event) => {
            console.error("Transaction error:", {
              error: transaction.error,
              event: event,
              errorName: transaction.error?.name,
              errorCode: transaction.error?.code
            })
            reject(transaction.error)
          }

          const store = transaction.objectStore(this.storeName)
          const request = store.put(fileData)

          request.onsuccess = () => {
            console.log(`File stored in IndexedDB: ${id}, ${file.name}, ${file.size}`)
            console.log("File storage successful, verifying file...")
            
            // Vérifier si le fichier existe bien
            this.getFile(id).then(storedFile => {
              if (storedFile) {
                console.log("File verification successful")
              } else {
                console.error("File verification failed: file not found after storage")
              }
            }).catch(error => {
              console.error("Error during file verification:", error)
            })

            resolve(id)
          }

          request.onerror = () => {
            console.error("Error storing file in IndexedDB:", {
              error: request.error,
              errorName: request.error?.name,
              errorCode: request.error?.code,
              errorMessage: request.error?.message
            })
            reject(request.error)
          }
        } catch (error) {
          console.error("Exception in storeFile transaction:", {
            error: error,
            errorName: error instanceof Error ? error.name : 'UnknownError',
            errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
          })
          reject(error)
        }
      })
    } catch (error: any) {
      console.error("Error in storeFile:", {
        error: error,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      throw error
    }
  }

  async getFile(id: string): Promise<File | null> {
    try {
      if (!this.db) {
        await this.init()
      }

      if (!this.db) {
        throw new Error("IndexedDB not initialized")
      }

      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db!.transaction([this.storeName], "readonly")

          transaction.onerror = (event) => {
            console.error("Transaction error:", transaction.error)
            console.error("Transaction error event:", event)
            reject(transaction.error)
          }

          const store = transaction.objectStore(this.storeName)
          console.log(`Retrieving file from IndexedDB: ${id}`)
          const request = store.get(id)

          request.onsuccess = () => {
            const result = request.result as StoredFileData | undefined
            if (result) {
              console.log(
                `File retrieved from IndexedDB: ${id}, ${result.metadata.originalName}, ${result.metadata.size}`,
              )
              resolve(result.file)
            } else {
              console.warn(`File not found in IndexedDB: ${id}`)

              // Liste tous les fichiers pour le débogage
              this.listAllFiles().catch(console.error)

              resolve(null)
            }
          }

          request.onerror = () => {
            console.error("Error retrieving file from IndexedDB:", request.error)
            reject(request.error)
          }
        } catch (error) {
          console.error("Exception in getFile transaction:", error)
          reject(error)
        }
      })
    } catch (error) {
      console.error("Error in getFile:", error)
      return null
    }
  }

  async removeFile(id: string): Promise<void> {
    try {
      if (!this.db) {
        await this.init()
      }

      if (!this.db) {
        throw new Error("IndexedDB not initialized")
      }

      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db!.transaction([this.storeName], "readwrite")

          transaction.onerror = (event) => {
            console.error("Transaction error:", transaction.error)
            console.error("Transaction error event:", event)
            reject(transaction.error)
          }

          const store = transaction.objectStore(this.storeName)
          const request = store.delete(id)

          request.onsuccess = () => {
            console.log(`File removed from IndexedDB: ${id}`)
            resolve()
          }

          request.onerror = () => {
            console.error("Error removing file from IndexedDB:", request.error)
            reject(request.error)
          }
        } catch (error) {
          console.error("Exception in removeFile transaction:", error)
          reject(error)
        }
      })
    } catch (error) {
      console.error("Error in removeFile:", error)
      throw error
    }
  }

  async getAllFiles(): Promise<StoredFileData[]> {
    try {
      if (!this.db) {
        await this.init()
      }

      if (!this.db) {
        throw new Error("IndexedDB not initialized")
      }

      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db!.transaction([this.storeName], "readonly")

          transaction.onerror = (event) => {
            console.error("Transaction error:", transaction.error)
            console.error("Transaction error event:", event)
            reject(transaction.error)
          }

          const store = transaction.objectStore(this.storeName)
          const request = store.getAll()

          request.onsuccess = () => {
            console.log(`Retrieved ${request.result.length} files from IndexedDB`)
            resolve(request.result)
          }

          request.onerror = () => {
            console.error("Error getting all files from IndexedDB:", request.error)
            reject(request.error)
          }
        } catch (error) {
          console.error("Exception in getAllFiles transaction:", error)
          reject(error)
        }
      })
    } catch (error) {
      console.error("Error in getAllFiles:", error)
      return []
    }
  }

  async listAllFiles(): Promise<void> {
    try {
      const files = await this.getAllFiles()
      console.log("All files in IndexedDB:")
      files.forEach((file) => {
        console.log(
          `- ID: ${file.id}, Name: ${file.metadata.originalName}, Size: ${file.metadata.size}, Type: ${file.metadata.type}, Timestamp: ${new Date(file.timestamp).toISOString()}`,
        )
      })
    } catch (error) {
      console.error("Error listing files:", error)
    }
  }

  async clearOldFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      if (!this.db) {
        await this.init()
      }

      if (!this.db) {
        throw new Error("IndexedDB not initialized")
      }

      const cutoffTime = Date.now() - maxAge

      return new Promise((resolve, reject) => {
        try {
          const transaction = this.db!.transaction([this.storeName], "readwrite")

          transaction.onerror = (event) => {
            console.error("Transaction error:", transaction.error)
            console.error("Transaction error event:", event)
            reject(transaction.error)
          }

          const store = transaction.objectStore(this.storeName)
          const index = store.index("timestamp")
          const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime))

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result
            if (cursor) {
              console.log(`Removing old file: ${cursor.value.id}`)
              cursor.delete()
              cursor.continue()
            } else {
              console.log("Finished cleaning old files")
              resolve()
            }
          }

          request.onerror = () => {
            console.error("Error cleaning old files:", request.error)
            reject(request.error)
          }
        } catch (error) {
          console.error("Exception in clearOldFiles transaction:", error)
          reject(error)
        }
      })
    } catch (error) {
      console.error("Error in clearOldFiles:", error)
      throw error
    }
  }
}

// Instance singleton
export const fileStorage = new IndexedDBFileStorage()

// Initialiser automatiquement
fileStorage.init().catch((error) => {
  console.error("Failed to initialize IndexedDB storage:", error)
})
