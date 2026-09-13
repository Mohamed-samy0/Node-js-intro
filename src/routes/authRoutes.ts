import { Router } from 'express'
import { getMe, login, register } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { insertUserSchema } from '../db/schema.ts'
import z from 'zod'
import { authenticateToken } from '../middleware/auth.ts'

const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const router = Router()

router.post('/register', validateBody(insertUserSchema), register)

router.post('/login', validateBody(loginSchema), login)
router.get('/me', authenticateToken, getMe)

export default router
