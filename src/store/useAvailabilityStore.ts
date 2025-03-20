import {create} from 'zustand';
import axios from 'axios';

const API_BASE_URL = 'https://fantastic-bassoon-gkbt.onrender.com/calender_api';
const PRODUCT_ID = '1';

interface AvailabilityState {
  dates: Date[];
  isLoading: boolean;
  error: string | null;
  fetchUnavailableDates: () => Promise<void>;
  saveUnavailableDates: (datesToSave: Date[], reason?: string) => Promise<void>;
  setDates: (dates: Date[]) => void;
}

const useAvailabilityStore = create<AvailabilityState>((set) => ({
  dates: [],
  isLoading: false,
  error: null,

  fetchUnavailableDates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${PRODUCT_ID}/unavailable-dates/`);
      const fetchedDates: Date[] = response.data.map((entry: any) => new Date(entry.unavailable_date));
      set({ dates: fetchedDates });
    } catch (error) {
      set({ error: 'Failed to load dates.' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveUnavailableDates: async (datesToSave: Date[], reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(
        `${API_BASE_URL}/products/${PRODUCT_ID}/unavailable-dates/`,
        {
          dates: datesToSave.map(date => date.toISOString().split('T')[0]),
          reason: reason || undefined,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      set({ dates: datesToSave });
    } catch (error) {
      set({ error: 'Failed to save dates.' });
    } finally {
      set({ isLoading: false });
    }
  },

  setDates: (dates: Date[]) => set({ dates }),
}));

export default useAvailabilityStore;
