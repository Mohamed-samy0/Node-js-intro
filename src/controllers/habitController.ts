import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import db from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { and, desc, eq, inArray } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user!.id,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await tx.insert(habitTags).values(habitTagValues)
      }
      return newHabit
    })
    res.status(201).json({
      message: 'Habit created',
      habit: result,
    })
  } catch (error) {
    console.error('Create habit error', error)
    res.status(500).json({
      message: 'Faild create habit',
    })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user!.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })
    const habitWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }))
    res.json({
      habits: habitWithTags,
    })
  } catch (error) {
    console.error('get habit error', error)
    res.status(500).json({
      message: 'Faild fetch habit',
    })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id
    const { tagIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({ ...updates, createdAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, req.user!.id)))
        .returning()

      if (!updatedHabit) {
        return res.status(401).end()
      }
      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))
        if (tagIds.length > 0) {
          const habitTagsValues = tagIds.map((tagId: any) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagsValues)
        }
      }
      return updatedHabit
    })
    res.json({
      message: 'Habit was updated',
      habit: result,
    })
  } catch (error) {
    console.error('Update habit error', error)
    res.status(500).json({
      message: 'Faild updates habit',
    })
  }
}
