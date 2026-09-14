import { sql } from 'drizzle-orm'
import db from '../../src/db/connection.ts'
import { entries, habits, users, tags, habitTags } from '../../src/db/schema.ts'
import { execSync } from 'child_process'
import env from '../../env.ts'

export default async function setup() {
  console.log('Setting up global test environment...')
  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)

    console.log('Database tables dropped successfully')
    execSync(
      `npx drizzle-kit push --url="${env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect=postgresql`,
      { stdio: 'inherit', cwd: process.cwd() },
    )

    console.log('Database schema pushed successfully')
  } catch (error) {
    console.error('Error setting up global test environment:', error)
    throw error
  }

  return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`)
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`)
      process.exit(0)
    } catch (error) {
      console.error('Error tearing down global test environment:', error)
      throw error
    }
  }
}
