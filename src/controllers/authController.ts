import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import db from '../db/connection.ts'
import { users, type NewUser } from '../db/schema.ts'
import { comparePassword, hashPassword } from '../utils/password.ts'
import { generateToken } from '../utils/jwt.ts'
import { eq } from 'drizzle-orm'

export const register = async (
  req: Request<any, any, NewUser>,
  res: Response,
) => {
  try {
    const hashedPassword = await hashPassword(req.body.password)

    const [user] = await db
      .insert(users)
      .values({
        ...req.body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    })

    return res
      .json({
        message: 'Create User',
        user,
        token,
      })
      .status(201)
  } catch (error) {
    console.error('ٌRegistration error', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = await generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    })

    return res.status(201).json({
      message: 'Login success',
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error('Login error', error)
    res.status(500).json({ error: 'Faild Login' })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        password: false,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ data: user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}
