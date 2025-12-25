import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeLanguageSwitcher from '../components/ThemeLanguageSwitcher'
import { useTranslation } from 'react-i18next'

type RegisterFormData = {
  name?: string
  email: string
  password: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { mode } = useThemeStore()
  const { t } = useTranslation()
  const isDark = mode === 'dark'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registerSchema = z.object({
    name: z.string().min(2, t('register.errors.nameTooShort')).optional(),
    email: z.string().email(t('register.errors.invalidEmail')),
    password: z.string().min(6, t('register.errors.passwordTooShort')),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/register', data)
      const { user, token } = response.data

      setAuth(user, token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || t('register.errors.registerFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: isDark
          ? 'linear-gradient(135deg, #2d1b3d 0%, #1a1226 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        position: 'relative',
        overflow: 'hidden',
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
        <ThemeLanguageSwitcher color="#fff" />
      </Box>

      {/* Декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: -150,
          left: -100,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: -100,
          right: -80,
        }}
      />

      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 5,
            width: '100%',
            borderRadius: 4,
            background: isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            transition: 'background 0.3s ease',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('register.title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' }}
            >
              {t('register.subtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('name')}
              label={t('register.name')}
              fullWidth
              margin="normal"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              {...register('email')}
              label={t('register.email')}
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              {...register('password')}
              label={t('register.password')}
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                },
              }}
            >
              {loading ? t('register.registering') : t('register.registerButton')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary' }}
              >
                {t('register.hasAccount')}{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#f5576c',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {t('register.loginLink')}
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}
