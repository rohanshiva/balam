import { create } from 'zustand';

interface CurrentEntryState {
  name: string;
  protein: string;
  timestamp: number;
  photoUri: string | null;
  setName: (name: string) => void;
  setProtein: (protein: string) => void;
  setTimestamp: (timestamp: number) => void;
  setPhotoUri: (uri: string | null) => void;
  setFromSavedItem: (name: string, protein: number) => void;
  reset: () => void;
}

const DEFAULT_NAME = "Custom Entry";
const DEFAULT_PROTEIN = "0";

export const useCurrentEntryStore = create<CurrentEntryState>((set) => ({
  name: DEFAULT_NAME,
  protein: DEFAULT_PROTEIN,
  timestamp: Date.now(),
  photoUri: null,

  setName: (name: string) => {
    set({ name });
  },

  setProtein: (protein: string) => {
    set({ protein });
  },

  setTimestamp: (timestamp: number) => {
    set({ timestamp });
  },

  setPhotoUri: (uri: string | null) => {
    set({ photoUri: uri });
  },

  setFromSavedItem: (name: string, protein: number) => {
    set({ 
      name, 
      protein: protein.toString() 
    });
  },

  reset: () => {
    set({ 
      name: DEFAULT_NAME, 
      protein: DEFAULT_PROTEIN,
      timestamp: Date.now(),
      photoUri: null
    });
  }
}));

