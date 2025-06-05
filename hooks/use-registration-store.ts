import { create } from "zustand"
import { persist } from "zustand/middleware"
import { fileStorage } from "@/lib/indexeddb-storage"
import type {
  StudentFormData,
  TutorFormData,
  RegistrationFormData,
  PaymentFormData,
  DocumentFormData,
  Tutor,
  Pricing,
} from "@/lib/interface"

// Types pour la gestion des fichiers avec IndexedDB
interface StoredFileReference {
  fileId: string // ID du fichier dans IndexedDB
  originalName: string
  size: number
  type: string
  isRestored?: boolean // Flag pour indiquer si le fichier a été restauré
}

interface FileOrStored {
  file?: File // Fichier natif
  stored?: StoredFileReference // Référence vers IndexedDB
}

// Mise à jour des types pour supporter IndexedDB
interface StudentFormDataWithFile extends Omit<StudentFormData, "photo"> {
  photo?: FileOrStored | null
}

interface DocumentFormDataWithFile extends Omit<DocumentFormData, "path"> {
  path: FileOrStored
}

interface RegistrationStore {
  // Current step
  currentStep: number
  setCurrentStep: (step: number) => void

  // Student data
  studentData: StudentFormDataWithFile | null
  setStudentData: (data: StudentFormData) => void

  // Tutors data
  selectedTutors: (Tutor & { is_tutor_legal: boolean })[]
  newTutors: TutorFormData[]
  setSelectedTutors: (tutors: (Tutor & { is_tutor_legal: boolean })[]) => void
  setNewTutors: (tutors: TutorFormData[]) => void
  addNewTutor: (tutor: TutorFormData) => void
  removeNewTutor: (index: number) => void

  // Registration data
  registrationData: RegistrationFormData | null
  setRegistrationData: (data: RegistrationFormData) => void

  // Pricing data
  availablePricing: Pricing[]
  setAvailablePricing: (pricing: Pricing[]) => void

  // Payment data
  payments: PaymentFormData[]
  setPayments: (payments: PaymentFormData[]) => void
  paidAmount: number
  setPaidAmount: (amount: number) => void

  // Documents data
  documents: DocumentFormDataWithFile[]
  setDocuments: (documents: DocumentFormDataWithFile[]) => void
  addDocument: (document: DocumentFormData) => void
  removeDocument: (index: number) => void

  // File handling utilities
  getFileFromPath: (path: FileOrStored) => Promise<File | null>
  getFileSize: (path: FileOrStored) => number
  storeFileInIndexedDB: (file: File) => Promise<string>
  restoreFilesFromIndexedDB: () => Promise<void>

  // Reset store
  reset: () => void
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),

      studentData: null,
      setStudentData: async (data: StudentFormData) => {
        try {
          // Initialiser processedData avec le bon type
          const processedData: StudentFormDataWithFile = {
            ...data,
            photo: data.photo ? (data.photo instanceof File ? { file: data.photo } : data.photo) : null
          }

          // Si c'est un fichier, le stocker dans IndexedDB
          if (processedData.photo?.file) {
            const file = processedData.photo.file
            console.log("Storing student photo in IndexedDB:", file.name, file.size)
            const fileId = await get().storeFileInIndexedDB(file)

            // Mettre à jour la structure avec la référence stockée
            processedData.photo = {
              stored: {
                fileId,
                originalName: file.name,
                size: file.size,
                type: file.type,
                isRestored: false,
              }
            }
            console.log("Student photo stored with ID:", fileId)
          }
          set({ studentData: processedData })
        } catch (error) {
          console.error("Error storing student photo:", error)
          // Fallback: stocker comme fichier natif
          // Handle both File and StoredFileReference cases
          const photoData = data.photo ? 
            (data.photo instanceof File ? { file: data.photo } : data.photo) 
            : null;
          set({ studentData: { ...data, photo: photoData } })
        }
      },

      selectedTutors: [],
      newTutors: [],
      setSelectedTutors: (tutors) => set({ selectedTutors: tutors }),
      setNewTutors: (tutors) => set({ newTutors: tutors }),
      addNewTutor: (tutor) => set((state) => ({ newTutors: [...state.newTutors, tutor] })),
      removeNewTutor: (index) =>
        set((state) => ({
          newTutors: state.newTutors.filter((_, i) => i !== index),
        })),

      registrationData: null,
      setRegistrationData: (data) => set({ registrationData: data }),

      availablePricing: [],
      setAvailablePricing: (pricing) => set({ availablePricing: pricing }),

      payments: [],
      setPayments: (payments) => set({ payments }),
      paidAmount: 0,
      setPaidAmount: (amount) => set({ paidAmount: amount }),

      documents: [],
      setDocuments: (documents) => set({ documents }),
      addDocument: async (document: DocumentFormData) => {
        try {
          console.log("Storing document in IndexedDB:", document.path.name, document.path.size)
          // Stocker le fichier dans IndexedDB immédiatement
          const fileId = await get().storeFileInIndexedDB(document.path)

          const newDocument: DocumentFormDataWithFile = {
            ...document,
            path: {
              stored: {
                fileId,
                originalName: document.path.name,
                size: document.path.size,
                type: document.path.type,
                isRestored: false,
              },
            },
          }

          set((state) => ({ documents: [...state.documents, newDocument] }))
          console.log("Document added and stored in IndexedDB:", fileId)
        } catch (error) {
          console.error("Error storing document in IndexedDB:", error)
          // Fallback: stocker comme fichier natif
          const newDocument: DocumentFormDataWithFile = {
            ...document,
            path: { file: document.path },
          }
          set((state) => ({ documents: [...state.documents, newDocument] }))
        }
      },
      removeDocument: async (index) => {
        const state = get()
        const docToRemove = state.documents[index]

        // Supprimer le fichier d'IndexedDB si nécessaire
        if (docToRemove?.path.stored?.fileId) {
          try {
            await fileStorage.removeFile(docToRemove.path.stored.fileId)
            console.log("File removed from IndexedDB:", docToRemove.path.stored.fileId)
          } catch (error) {
            console.error("Error removing file from IndexedDB:", error)
          }
        }

        set((state) => ({
          documents: state.documents.filter((_, i) => i !== index),
        }))
      },

      // File handling utilities
      getFileFromPath: async (path: FileOrStored): Promise<File | null> => {
        console.log("getFileFromPath called with:", path)

        if (path.file) {
          console.log("Returning native file:", path.file.name, path.file.size)
          return path.file
        }

        if (path.stored?.fileId) {
          console.log("Retrieving file from IndexedDB:", path.stored.fileId)
          try {
            const file = await fileStorage.getFile(path.stored.fileId)
            if (file) {
              console.log("File retrieved from IndexedDB:", file.name, file.size)
              return file
            } else {
              console.warn("File not found in IndexedDB:", path.stored.fileId)
              return null
            }
          } catch (error) {
            console.error("Error retrieving file from IndexedDB:", error)
            return null
          }
        }

        console.warn("No file or stored reference found in path")
        return null
      },

      getFileSize: (path: FileOrStored): number => {
        if (path.file) {
          return path.file.size
        }
        if (path.stored) {
          return path.stored.size
        }
        return 0
      },

      storeFileInIndexedDB: async (file: File): Promise<string> => {
        try {
          const fileId = await fileStorage.storeFile(file)
          console.log("File stored in IndexedDB with ID:", fileId)
          return fileId
        } catch (error) {
          console.error("Error storing file in IndexedDB:", error)
          throw error
        }
      },

      restoreFilesFromIndexedDB: async () => {
        try {
          console.log("Starting file restoration from IndexedDB...")
          const state = get()
          let hasChanges = false

          // Lister tous les fichiers dans IndexedDB pour le débogage
          await fileStorage.listAllFiles()

          // Restaurer la photo de l'élève si nécessaire
          if (state.studentData?.photo?.stored?.fileId && !state.studentData.photo.file) {
            console.log(`Attempting to restore student photo: ${state.studentData.photo.stored.fileId}`)
            try {
              const file = await fileStorage.getFile(state.studentData.photo.stored.fileId)
              if (file) {
                console.log("Student photo successfully restored")
                set((state) => ({
                  studentData: {
                    ...state.studentData!,
                    photo: {
                      ...state.studentData!.photo,
                      file: file, // Stocker également le fichier natif
                      stored: {
                        ...state.studentData!.photo!.stored!,
                        isRestored: true,
                      },
                    },
                  },
                }))
                hasChanges = true
              } else {
                console.warn("Failed to restore student photo - file not found")
              }
            } catch (error) {
              console.error("Error restoring student photo:", error)
            }
          }

          // Restaurer les documents
          const updatedDocuments = [...state.documents]
          for (let i = 0; i < updatedDocuments.length; i++) {
            const doc = updatedDocuments[i]
            if (doc.path.stored?.fileId && !doc.path.file) {
              console.log(`Attempting to restore document: ${doc.label}, ID: ${doc.path.stored.fileId}`)
              try {
                const file = await fileStorage.getFile(doc.path.stored.fileId)
                if (file) {
                  console.log(`Document successfully restored: ${doc.label}`)
                  updatedDocuments[i] = {
                    ...doc,
                    path: {
                      ...doc.path,
                      file: file, // Stocker également le fichier natif
                      stored: {
                        ...doc.path.stored,
                        isRestored: true,
                      },
                    },
                  }
                  hasChanges = true
                } else {
                  console.warn(`Failed to restore document: ${doc.label} - file not found`)
                }
              } catch (error) {
                console.error(`Error restoring document ${doc.label}:`, error)
              }
            }
          }

          if (hasChanges) {
            set({ documents: updatedDocuments })
            console.log("Files restoration completed with changes")
          } else {
            console.log("Files restoration completed with no changes")
          }
        } catch (error) {
          console.error("Error in restoreFilesFromIndexedDB:", error)
        }
      },

      reset: async () => {
        const state = get()

        // Nettoyer les fichiers d'IndexedDB
        try {
          // Supprimer la photo de l'élève
          if (state.studentData?.photo?.stored?.fileId) {
            await fileStorage.removeFile(state.studentData.photo.stored.fileId)
          }

          // Supprimer les documents
          for (const doc of state.documents) {
            if (doc.path.stored?.fileId) {
              await fileStorage.removeFile(doc.path.stored.fileId)
            }
          }

          console.log("IndexedDB files cleaned up")
        } catch (error) {
          console.error("Error cleaning up IndexedDB files:", error)
        }

        set({
          currentStep: 1,
          studentData: null,
          selectedTutors: [],
          newTutors: [],
          registrationData: null,
          availablePricing: [],
          payments: [],
          paidAmount: 0,
          documents: [],
        })
      },
    }),
    {
      name: "registration-store",
      // Utiliser localStorage uniquement pour les données non-fichiers
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null

          try {
            const data = JSON.parse(str)
            return {
              state: data.state,
              version: data.version,
            }
          } catch {
            return null
          }
        },
        setItem: (name, value) => {
          try {
            // Les fichiers sont déjà stockés dans IndexedDB, on ne stocke que les références
            localStorage.setItem(
              name,
              JSON.stringify({
                state: value.state,
                version: value.version,
              }),
            )
          } catch (error) {
            console.error("Error saving to localStorage:", error)
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
      // Restaurer les fichiers après la restauration du state
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restaurer les fichiers depuis IndexedDB après un délai pour s'assurer que le store est prêt
          setTimeout(() => {
            state.restoreFilesFromIndexedDB()
          }, 100)
        }
      },
    },
  ),
)
