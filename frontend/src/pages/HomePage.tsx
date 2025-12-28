import { Container, Typography, Box, Button, Card, CardContent } from '@mui/material'
import { Link } from 'react-router-dom'
import {
  AttachMoney,
  TrendingUp,
  Psychology,
  Flag,
  AccountBalanceWallet,
  Loop
} from '@mui/icons-material'
import { useThemeStore } from '../store/themeStore'
import ThemeLanguageSwitcher from '../components/ThemeLanguageSwitcher'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { mode } = useThemeStore()
  const { t } = useTranslation()
  const isDark = mode === 'dark'

  const features = [
    {
      icon: <AttachMoney sx={{ fontSize: 56 }} />,
      title: t('home.features.transactions.title'),
      description: t('home.features.transactions.description'),
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 56 }} />,
      title: t('home.features.budgets.title'),
      description: t('home.features.budgets.description'),
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      icon: <Loop sx={{ fontSize: 56 }} />,
      title: t('home.features.recurring.title'),
      description: t('home.features.recurring.description'),
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 56 }} />,
      title: t('home.features.analytics.title'),
      description: t('home.features.analytics.description'),
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <Psychology sx={{ fontSize: 56 }} />,
      title: t('home.features.ai.title'),
      description: t('home.features.ai.description'),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <Flag sx={{ fontSize: 56 }} />,
      title: t('home.features.goals.title'),
      description: t('home.features.goals.description'),
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #e0e7ff 100%)',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Theme & Language Switchers */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <ThemeLanguageSwitcher color={isDark ? '#fff' : 'inherit'} />
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 4, sm: 6, md: 10 }, px: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            {t('home.title')}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              fontWeight: 400,
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            }}
          >
            {t('home.subtitle')}
          </Typography>

          <Box sx={{
            mt: { xs: 4, md: 5 },
            mb: { xs: 4, md: 8 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
            px: { xs: 2, sm: 0 }
          }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/login"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: { xs: '1rem', md: '1.1rem' },
                minHeight: 48,
              }}
              fullWidth={{ xs: true, sm: false }}
            >
              {t('home.loginButton')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/register"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: { xs: '1rem', md: '1.1rem' },
                minHeight: 48,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
              fullWidth={{ xs: true, sm: false }}
            >
              {t('home.registerButton')}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
              mt: 6,
              maxWidth: 1200,
              mx: 'auto',
              px: 2,
            }}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  height: { xs: 'auto', md: 340 },
                  minHeight: { xs: 280, md: 340 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'grey.100',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDark ? '0 12px 24px rgba(0, 0, 0, 0.4)' : 6,
                  },
                }}
              >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      p: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: feature.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isDark ? '#fff' : 'text.primary',
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.7,
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
