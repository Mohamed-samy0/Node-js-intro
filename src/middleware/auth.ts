import type { Request, Response, NextFunction } from 'express'
import { verifyToken, type JwtPayload } from '../utils/jwt.ts'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeaders = req.headers['authorization']
    const token = authHeaders && authHeaders.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Bad Request' })
    }

    const payload = await verifyToken(token)
    req.user = payload
    next()
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
    })
  }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user.role
  if (role === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Forbidden: Admins only' })
  }
}
