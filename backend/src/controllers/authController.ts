import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' })
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' })
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Ошибка при регистрации' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' })
    }

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' })
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка при входе' })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json({ user })
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ error: 'Ошибка при получении данных' })
  }
}

export const googleCallback = async (req: Request, res: Response) => {
  try {
    // Пользователь уже аутентифицирован через passport
    const user = req.user as any

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Редирект на frontend с токеном
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
  } catch (error) {
    console.error('Google callback error:', error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
  }
}
