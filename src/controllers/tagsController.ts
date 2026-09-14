import { eq } from 'drizzle-orm'
import db from '../db/connection.ts'
import { tags } from '../db/schema.ts'
import type { Request, Response } from 'express'

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body

    const result = await db
      .insert(tags)
      .values({
        name,
        color,
      })
      .returning()

    res.status(201).json({
      message: 'Create Tags',
      tags: result,
    })
  } catch (error) {
    console.error('Error create tags', error)
    res.status(401).json('Failed create tags')
  }
}

export const getTags = async (req: Request, res: Response) => {
  try {
    const result = await db.query.tags.findMany()

    res.status(200).json({ getAllTags: result })
  } catch (error) {
    console.error('Error get tags', error)
    res.status(401).json('Failed get tags')
  }
}

export const updateTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    const { name, color } = req.body
    console.log('ID from URL:', id)

    console.log('Body Data:', req.body)
    const result = await db
      .update(tags)
      .set({ name, color })
      .where(eq(tags.id, id))
      .returning()
    console.log('DB Result:', result)
    res.status(200).json({
      message: 'Update tag succ',
      tags: result,
    })
  } catch (error) {
    console.error('Error update tags', error)
    res.status(401).json('Failed update tags')
  }
}

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const id = req.params.id
    console.log('ID from URL:', id)
    console.log('Body Data:', req.body)

    const result = await db.delete(tags).where(eq(tags.id, id)).returning()
    console.log('DB Result:', result)
    res.status(200).json({
      message: 'Delete tag succ',
      tags: result,
    })
  } catch (error) {
    console.error('Error delete tags', error)
    res.status(401).json('Failed delete tags')
  }
}
