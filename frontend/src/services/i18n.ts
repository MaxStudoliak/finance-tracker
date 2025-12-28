import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from '../locales/ru.json'
import en from '../locales/en.json'
import uk from '../locales/uk.json'

const resources = {
  ru: { translation: ru },
  en: { translation: en },
  uk: { translation: uk },
}

// Get the language from localStorage (zustand persisted state)
const getStoredLanguage = () => {
  try {
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.state?.language || 'uk'
    }
  } catch (e) {
    console.error('Error reading language from storage:', e)
  }
  return 'uk'
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
