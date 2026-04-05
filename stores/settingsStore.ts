import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  language: string;
  notificationsEnabled: boolean;
  pushRelayUrl: string;
}

interface SettingsActions {
  update: (partial: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      language: 'en',
      notificationsEnabled: false,
      pushRelayUrl: '',

      update: (partial) => set(partial),
    }),
    {
      name: 'seekr-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
