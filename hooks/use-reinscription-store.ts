import { create } from "zustand"
import { persist } from "zustand/middleware"
import { fileStorage } from "@/lib/indexeddb-storage"
import {
  Student,
  Tutor,
  TutorFormData,
  RegistrationFormData,
  PaymentFormData,
  DocumentFormData,
  Pricing,
} from "@/lib/interface"
import merge from 'lodash.merge';

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

interface DocumentFormDataWithFile {
  document_type_id: number
  student_id: number
  label: string
  path: FileOrStored
}

interface ReinscriptionStore {
  // Current step
  currentStep: number
  setCurrentStep: (step: number) => void

  // Selected student for re-registration
  selectedStudent: Student | null
  setSelectedStudent: (student: Student | null) => void

  // Student data modifications
  studentModifications: Partial<Student & { photo?: FileOrStored }> | null
  setStudentModifications: (data: Partial<Student & { photo?: FileOrStored }>) => void

  // Tutors data
  existingTutors: (Tutor & { is_tutor_legal: boolean; isModified?: boolean })[]
  newTutors: TutorFormData[]
  setExistingTutors: (tutors: (Tutor & { is_tutor_legal: boolean; isModified?: boolean })[]) => void
  setNewTutors: (tutors: TutorFormData[]) => void
  addNewTutor: (tutor: TutorFormData) => void
  removeNewTutor: (index: number) => void
  updateExistingTutor: (id: number, updates: Partial<Tutor & { is_tutor_legal: boolean }>) => void

  // Registration data
  registrationData: RegistrationFormData | null
  setRegistrationData: (data: RegistrationFormData) => void

  setDiscountAmount: (amount: string | null) => void
  setDiscountPercentage: (percentage: string | null) => void
  setPricingId: (id: number | null) => void
  setDiscounts: (amount?: string | null, percentage?: string | null, id?: number | null) => void

  // Pricing data
  availablePricing: Pricing[]
  setAvailablePricing: (pricing: Pricing[]) => void

  // Payment data
  payments: PaymentFormData[]
  setPayments: (payments: PaymentFormData[]) => void
  paidAmount: number
  setPaidAmount: (amount: number) => void

  // Documents data
  existingDocuments: any[]
  newDocuments: DocumentFormDataWithFile[]
  setExistingDocuments: (documents: any[]) => void
  setNewDocuments: (documents: DocumentFormDataWithFile[]) => void
  addNewDocument: (document: DocumentFormData) => void
  removeNewDocument: (index: number) => void

  // File handling utilities
  getFileFromPath: (path: FileOrStored) => Promise<File | null>
  getFileSize: (path: FileOrStored) => number
  storeFileInIndexedDB: (file: File) => Promise<string>
  restoreFilesFromIndexedDB: () => Promise<void>

  // Created entities for rollback
  createdEntities: {
    tutors: number[]
    payments: number[]
    documents: number[]
    registration: number | null
  }
  setCreatedEntities: (entities: any) => void

  // Reset store
  reset: () => void
}

export const useReinscriptionStore = create<ReinscriptionStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),

      selectedStudent: null,
      setSelectedStudent: (student) => set({ selectedStudent: student }),

      studentModifications: null,
      setStudentModifications: (data) => set({ studentModifications: data }),

      existingTutors: [],
      newTutors: [],
      setExistingTutors: (tutors) => set({ existingTutors: tutors }),
      setNewTutors: (tutors) => set({ newTutors: tutors }),
      addNewTutor: (tutor) => set((state) => ({ newTutors: [...state.newTutors, tutor] })),
      removeNewTutor: (index) =>
        set((state) => ({
          newTutors: state.newTutors.filter((_, i) => i !== index),
        })),
      updateExistingTutor: (id, updates) =>
        set((state) => ({
          existingTutors: state.existingTutors.map((tutor) =>
            tutor.id === id ? { ...tutor, ...updates, isModified: true } : tutor,
          ),
        })),

      registrationData: null,
      setRegistrationData: (data) => set({ registrationData: data }),

      setPricingId: (id: number | null) => {
        const currentData = get().registrationData;
        if (currentData) {
          set({ registrationData: { ...currentData, pricing_id: id } });
        }
      },

      setDiscountAmount: (amount: string | null) => {
        const currentData = get().registrationData;
        if (currentData) {
          set({
            registrationData: {
              ...currentData,
              discount_amount: amount
            }
          });
        }
      },

      setDiscountPercentage: (percentage: string | null) => {
        const currentData = get().registrationData;
        if (currentData) {
          set({
            registrationData: {
              ...currentData,
              discount_percentage: percentage
            }
          });
        }
      },

      setDiscounts: (amount?: string | null, percentage?: string | null, id?: number | null) => {
        const currentData = get().registrationData;
        if (currentData) {
          set({
            registrationData: {
              ...currentData,
              discount_amount: amount ?? null,
              discount_percentage: percentage ?? null,
              pricing_id: id ?? null
            }
          });
        }
      },

      availablePricing: [],
      setAvailablePricing: (pricing) => set({ availablePricing: pricing }),

      payments: [],
      setPayments: (payments) => set({ payments }),
      paidAmount: 0,
      setPaidAmount: (amount) => set({ paidAmount: amount }),

      existingDocuments: [],
      newDocuments: [],
      setExistingDocuments: (documents) => set({ existingDocuments: documents }),
      setNewDocuments: (documents) => set({ newDocuments: documents }),
      addNewDocument: async (document: DocumentFormData) => {
        try {
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

          set((state) => ({ newDocuments: [...state.newDocuments, newDocument] }))
          console.log("Document added and stored in IndexedDB:", fileId)
        } catch (error) {
          console.error("Error storing document in IndexedDB:", error)
          // Fallback: stocker comme fichier natif
          const newDocument: DocumentFormDataWithFile = {
            ...document,
            path: { file: document.path },
          }
          set((state) => ({ newDocuments: [...state.newDocuments, newDocument] }))
        }
      },
      removeNewDocument: async (index) => {
        const state = get()
        const docToRemove = state.newDocuments[index]

        // Supprimer le fichier d'IndexedDB si nécessaire
        if (docToRemove?.path.stored?.fileId) {
          try {
            if (!fileStorage) throw new Error("Stockage local non disponible sur ce navigateur ou en SSR");
            await fileStorage.removeFile(docToRemove.path.stored.fileId)
            console.log("File removed from IndexedDB:", docToRemove.path.stored.fileId)
          } catch (error) {
            console.error("Error removing file from IndexedDB:", error)
          }
        }

        set((state) => ({
          newDocuments: state.newDocuments.filter((_, i) => i !== index),
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
            if (!fileStorage) throw new Error("Stockage local non disponible sur ce navigateur ou en SSR");
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
          if (!fileStorage) throw new Error("Stockage local non disponible sur ce navigateur ou en SSR");
          const fileId = await fileStorage.storeFile(file)
          console.log("File stored in IndexedDB with ID:", fileId)
          return fileId
        } catch (error) {
          console.error("Error storing file in IndexedDB:", error)
          throw error
        }
      },

      // Dans la fonction restoreFilesFromIndexedDB, ajoutons plus de logs et une meilleure gestion des erreurs

      restoreFilesFromIndexedDB: async () => {
        try {
          console.log("Starting file restoration from IndexedDB...")
          const state = get()
          let hasChanges = false

          // Lister tous les fichiers dans IndexedDB pour le débogage
          if (!fileStorage) throw new Error("Stockage local non disponible sur ce navigateur ou en SSR");
          // await fileStorage.listAllFiles()

          // Restaurer la photo de l'élève si nécessaire
          if (state.studentModifications?.photo?.stored?.fileId) {
            console.log(`Attempting to restore student photo: ${state.studentModifications.photo.stored.fileId}`)
            try {
              const file = await fileStorage.getFile(state.studentModifications.photo.stored.fileId)
              if (file) {
                console.log("Student photo successfully restored")
                set((state) => {
                  // Créer un nouvel objet avec les modifications
                  const studentModifications = state.studentModifications as Partial<Student & { photo?: FileOrStored }> | null;
                  const updatedModifications = studentModifications
                    ? { ...studentModifications }
                    : {} as Partial<Student & { photo?: FileOrStored }>;

                  // Mettre à jour la photo avec le fichier restaur
                  return {
                    studentModifications: {
                      ...updatedModifications,
                      photo: {
                        ...(typeof updatedModifications.photo === "object" && updatedModifications.photo !== null ? updatedModifications.photo : {}),
                        file: file,
                        stored: {
                          ...(typeof updatedModifications.photo === "object" &&
                            updatedModifications.photo !== null &&
                            typeof updatedModifications.photo.stored === "object" &&
                            updatedModifications.photo.stored !== null
                            ? updatedModifications.photo.stored
                            : {}),
                          fileId: updatedModifications.photo && typeof updatedModifications.photo === "object" && updatedModifications.photo.stored?.fileId ? updatedModifications.photo.stored.fileId : '',
                          originalName: updatedModifications.photo && typeof updatedModifications.photo === "object" && updatedModifications.photo.stored?.originalName ? updatedModifications.photo.stored.originalName : file.name,
                          size: updatedModifications.photo && typeof updatedModifications.photo === "object" && updatedModifications.photo.stored?.size ? updatedModifications.photo.stored.size : file.size,
                          type: updatedModifications.photo && typeof updatedModifications.photo === "object" && updatedModifications.photo.stored?.type ? updatedModifications.photo.stored.type : file.type,
                          isRestored: true,
                        },
                      },
                    },
                  };
                })
                hasChanges = true
              } else {
                console.warn("Failed to restore student photo - file not found")
              }
            } catch (error) {
              console.error("Error restoring student photo:", error)
            }
          }

          // Restaurer les documents
          const updatedDocuments = [...state.newDocuments]
          for (let i = 0; i < updatedDocuments.length; i++) {
            const doc = updatedDocuments[i]
            if (doc.path.stored?.fileId) {
              console.log(`Attempting to restore document: ${doc.label}, ID: ${doc.path.stored.fileId}`)
              try {
                const file = await fileStorage.getFile(doc.path.stored.fileId)
                if (file) {
                  console.log(`Document successfully restored: ${doc.label}`)
                  updatedDocuments[i] = {
                    ...doc,
                    path: {
                      ...doc.path,
                      file: file,
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
            set({ newDocuments: updatedDocuments })
            console.log("Files restoration completed with changes")
          } else {
            console.log("Files restoration completed with no changes")
          }
        } catch (error) {
          console.error("Error in restoreFilesFromIndexedDB:", error)
        }
      },

      createdEntities: {
        tutors: [],
        payments: [],
        documents: [],
        registration: null,
      },
      setCreatedEntities: (entities) => set({ createdEntities: entities }),

      reset: async () => {
        const state = get()

        // Nettoyer les fichiers d'IndexedDB
        try {
          // Supprimer la photo de l'élève
          if (state.studentModifications?.photo?.stored?.fileId) {
            if (!fileStorage) throw new Error("Stockage local non disponible sur ce navigateur ou en SSR");
            await fileStorage.removeFile(state.studentModifications.photo.stored.fileId)
          }

          // Supprimer les documents
          for (const doc of state.newDocuments) {
            if (doc.path.stored?.fileId) {
              if (!fileStorage) throw new Error("Stockage local non disponible sur ce navigateur ou en SSR");
              await fileStorage.removeFile(doc.path.stored.fileId)
            }
          }

          console.log("IndexedDB files cleaned up")
        } catch (error) {
          console.error("Error cleaning up IndexedDB files:", error)
        }

        // Réinitialiser tous les champs, y compris les réductions et la tarification
        set({
          currentStep: 1,
          selectedStudent: null,
          studentModifications: null,
          existingTutors: [],
          newTutors: [],
          registrationData: null,
          availablePricing: [],
          payments: [],
          paidAmount: 0,
          existingDocuments: [],
          newDocuments: [],
          createdEntities: {
            tutors: [],
            payments: [],
            documents: [],
            registration: null,
          },
        })
      },
    }),
    {
      name: "reinscription-store",
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