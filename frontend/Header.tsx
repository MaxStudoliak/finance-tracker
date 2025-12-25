import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
  Translate,
  Logout,
  Dashboard as DashboardIcon,
  Receipt,
  Flag,
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { mode, toggleTheme, language, setLanguage } = useThemeStore()
  const { t, i18n } = useTranslation()
  const isDark = mode === 'dark'

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget)
  }

  const handleLangMenuClose = () => {
    setLangAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleProfileMenuClose()
    navigate('/login')
  }

  const handleProfile = () => {
    handleProfileMenuClose()
    navigate('/profile')
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    handleLangMenuClose()
  }

  const navItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: <DashboardIcon /> },
    { label: t('nav.transactions'), path: '/transactions', icon: <Receipt /> },
    { label: t('nav.goals'), path: '/goals', icon: <Flag /> },
  ]

  const languages = [
    { code: 'ru', label: t('languages.ru') },
    { code: 'uk', label: t('languages.uk') },
    { code: 'en', label: t('languages.en') },
  ]

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 700 }}>
        Finance Tracker
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} to={item.path} sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: isDark
            ? 'rgba(18, 18, 18, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Finance Tracker
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: isDark ? 'white' : 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Language Selector */}
              <IconButton
                onClick={handleLangMenuOpen}
                sx={{
                  color: isDark ? 'white' : 'text.primary',
                  '&:hover': {
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <Translate />
              </IconButton>
              <Menu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={handleLangMenuClose}
              >
                {languages.map((lang) => (
                  <MenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    selected={language === lang.code}
                  >
                    {lang.label}
                  </MenuItem>
                ))}
              </Menu>

              {/* Theme Toggle */}
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: isDark ? 'white' : 'text.primary',
                  '&:hover': {
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>

              {/* User Menu */}
              <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={handleProfile}>
                  <AccountCircle sx={{ mr: 1 }} /> {t('nav.profile')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> {t('common.logout')}
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: isDark ? 'white' : 'text.primary',
                  '&:hover': {
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                {isDark ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  color: isDark ? 'white' : 'text.primary',
                  '&:hover': {
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
