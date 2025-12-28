import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material'
import {
  AccountCircle,
  Email,
  CalendarToday,
  Palette,
  Language,
  AttachMoney
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'
import { useThemeStore, Currency } from '../store/themeStore'
import Header from '../components/Header'
import { useTranslation } from 'react-i18next'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { mode, language, currency, setLanguage, setCurrency, toggleTheme } = useThemeStore()
  const { t, i18n } = useTranslation()

  if (!user) {
    return null
  }

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uk' ? 'uk-UA' : 'en-US')
    : t('common.noData')

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
  }

  const currencies: Currency[] = ['UAH', 'USD', 'EUR', 'GBP', 'RUB', 'PLN']

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          {t('profile.title')}
        </Typography>

        {/* Personal Info */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 3,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            {t('profile.personalInfo')}
          </Typography>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                fontSize: '3rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              {user.name || t('profile.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper',
                  border: '2px solid',
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                    boxShadow: mode === 'dark'
                      ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                      : '0 4px 12px rgba(99, 102, 241, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountCircle sx={{ mr: 1, color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {t('register.name')}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                  {user.name || t('common.noData')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper',
                  border: '2px solid',
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                    boxShadow: mode === 'dark'
                      ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                      : '0 4px 12px rgba(99, 102, 241, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {t('register.email')}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                  {user.email}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: '100%',
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'background.paper',
                  border: '2px solid',
                  borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.4)',
                    transform: 'translateY(-2px)',
                    boxShadow: mode === 'dark'
                      ? '0 4px 12px rgba(99, 102, 241, 0.2)'
                      : '0 4px 12px rgba(99, 102, 241, 0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday sx={{ mr: 1, color: 'primary.main', fontSize: 24 }} />
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {t('dashboard.registrationDate')}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                  {createdDate}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Settings */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            {t('profile.preferences')}
          </Typography>

          <Grid container spacing={3}>
            {/* Language */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('profile.language')}</InputLabel>
                <Select
                  value={language}
                  label={t('profile.language')}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  startAdornment={<Language sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  <MenuItem value="ru">{t('languages.ru')}</MenuItem>
                  <MenuItem value="uk">{t('languages.uk')}</MenuItem>
                  <MenuItem value="en">{t('languages.en')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Currency */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('profile.currency')}</InputLabel>
                <Select
                  value={currency}
                  label={t('profile.currency')}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  startAdornment={<AttachMoney sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  {currencies.map((curr) => (
                    <MenuItem key={curr} value={curr}>
                      {t(`currencies.${curr}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Theme */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>{t('profile.theme')}</InputLabel>
                <Select
                  value={mode}
                  label={t('profile.theme')}
                  onChange={toggleTheme}
                  startAdornment={<Palette sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  <MenuItem value="light">{t('profile.lightMode')}</MenuItem>
                  <MenuItem value="dark">{t('profile.darkMode')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ p: 2, borderRadius: 2, bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {t('profile.settings')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
