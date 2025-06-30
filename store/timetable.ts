import { create } from "zustand";

// Version stricte, identique à celle du composant
export interface TimetableFormData {
  id?: number;
  academic_year_id: string;
  class_id: string;
  professor_id: string;
  matter_id: string;
  period_id: string;
  day: string;
  start_date: string;
  end_date: string;
  room: string;
  start_time: string;
  end_time: string;
}

interface TimetableStore {
  toCreate: TimetableFormData[];
  toUpdate: TimetableFormData[];
  toDelete: number[];
  setToCreate: (data: TimetableFormData[]) => void;
  setToUpdate: (data: TimetableFormData[]) => void;
  setToDelete: (ids: number[]) => void;
  addToCreate: (data: TimetableFormData) => void;
  addToUpdate: (data: TimetableFormData) => void;
  addToDelete: (id: number) => void;
  removeFromCreate: (id: number) => void;
  removeFromUpdate: (id: number) => void;
  removeFromDelete: (id: number) => void;
  reset: () => void;
}

export const useTimetableStore = create<TimetableStore>((set, get) => ({
  toCreate: [],
  toUpdate: [],
  toDelete: [],
  setToCreate: (data) => set({ toCreate: data }),
  setToUpdate: (data) => set({ toUpdate: data }),
  setToDelete: (ids) => set({ toDelete: ids }),
  addToCreate: (data) =>
    set((state) => ({ toCreate: [...state.toCreate, data] })),
  addToUpdate: (data) =>
    set((state) => {
      // Remplace si déjà présent (par id), sinon ajoute
      const idx = state.toUpdate.findIndex((t) => t.id === data.id);
      if (idx !== -1) {
        const updated = [...state.toUpdate];
        updated[idx] = data;
        return { toUpdate: updated };
      }
      return { toUpdate: [...state.toUpdate, data] };
    }),
  addToDelete: (id) =>
    set((state) => ({ toDelete: [...state.toDelete, id] })),
  removeFromCreate: (id) =>
    set((state) => ({
      toCreate: state.toCreate.filter((t) => t.id !== id),
    })),
  removeFromUpdate: (id) =>
    set((state) => ({
      toUpdate: state.toUpdate.filter((t) => t.id !== id),
    })),
  removeFromDelete: (id) =>
    set((state) => ({
      toDelete: state.toDelete.filter((d) => d !== id),
    })),
  reset: () => set({ toCreate: [], toUpdate: [], toDelete: [] }),
}));
