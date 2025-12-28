import { Currency, useThemeStore } from '../store/themeStore'

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    UAH: '₴',
    USD: '$',
    EUR: '€',
    GBP: '£',
    RUB: '₽',
    PLN: 'zł',
  }
  return symbols[currency]
}

export const formatCurrency = (amount: number, currency: Currency): string => {
  const symbol = getCurrencySymbol(currency)

  // Format with space after symbol for UAH and RUB
  if (currency === 'UAH' || currency === 'RUB') {
    return `${symbol} ${amount.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format with space before symbol for PLN
  if (currency === 'PLN') {
    return `${amount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`
  }

  // Default format for USD, EUR, GBP (symbol before amount)
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const getCurrencyName = (currency: Currency): string => {
  const names: Record<Currency, string> = {
    UAH: 'Гривня',
    USD: 'Долар США',
    EUR: 'Євро',
    GBP: 'Фунт стерлінгів',
    RUB: 'Російський рубль',
    PLN: 'Польський злотий',
  }
  return names[currency]
}

// Hook для використання форматування валюти з поточною валютою користувача
export const useCurrency = () => {
  const currency = useThemeStore((state) => state.currency)

  return (amount: number) => formatCurrency(amount, currency)
}
