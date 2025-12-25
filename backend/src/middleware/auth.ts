import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  email: string
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload

    req.user = {
      id: decoded.userId,
      email: decoded.email
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Недействительный токен' })
  }
}
