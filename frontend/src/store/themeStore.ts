import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Currency = 'UAH' | 'USD' | 'EUR' | 'GBP' | 'RUB' | 'PLN'

interface ThemeState {
  mode: 'light' | 'dark'
  language: string
  currency: Currency
  toggleTheme: () => void
  setLanguage: (lang: string) => void
  setCurrency: (currency: Currency) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark', // default to dark
      language: 'uk', // default to Ukrainian
      currency: 'UAH', // default to Hryvnia
      toggleTheme: () =>
        set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'theme-storage',
    }
  )
)
