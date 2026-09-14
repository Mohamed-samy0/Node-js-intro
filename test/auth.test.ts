import request from 'supertest'
import app from '../src/server.ts'
import env from '../env.ts'
import {
  cleanupDatabase,
  createTestHabit,
  createTestUser,
} from './setup/dbHelpers.ts'

describe('Authentication Enpoints', () => {
  afterEach(async () => {
    await cleanupDatabase()
  })
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      // const user = await createTestUser()
      const userData = {
        email: 'testemail@test.com',
        username: 'test user',
        password: 'admin123',
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const testUser = await createTestUser()
      const credentials = {
        email: testUser.user.email,
        password: testUser.rawPassword,
      }
      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
    })
  })
})
