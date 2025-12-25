import { IconButton, Box, Menu, MenuItem } from '@mui/material'
import { Brightness4, Brightness7, Language } from '@mui/icons-material'
import { useState } from 'react'
import { useThemeStore } from '../store/themeStore'
import { useTranslation } from 'react-i18next'

interface ThemeLanguageSwitcherProps {
  color?: string
}

export default function ThemeLanguageSwitcher({ color = 'inherit' }: ThemeLanguageSwitcherProps) {
  const { mode, language, toggleTheme, setLanguage } = useThemeStore()
  const { t, i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleLanguageClose = () => {
    setAnchorEl(null)
  }

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    handleLanguageClose()
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton onClick={toggleTheme} sx={{ color }}>
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      <IconButton onClick={handleLanguageClick} sx={{ color }}>
        <Language />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageClose}
      >
        <MenuItem
          onClick={() => handleLanguageSelect('ru')}
          selected={language === 'ru'}
        >
          {t('languages.ru')}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageSelect('en')}
          selected={language === 'en'}
        >
          {t('languages.en')}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageSelect('uk')}
          selected={language === 'uk'}
        >
          {t('languages.uk')}
        </MenuItem>
      </Menu>
    </Box>
  )
}
