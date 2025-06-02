import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/protected'
import { getSession } from 'next-auth/react'

jest.mock('next-auth/react')

describe('Protected API Endpoint', () => {
  it('returns 401 for unauthenticated request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })
    
    getSession.mockResolvedValueOnce(null)
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unauthorized: You must be signed in to access this endpoint'
    })
  })

  it('returns 200 and user data for authenticated request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })
    
    const mockSession = {
      user: {
        email: 'test@example.com',
        name: 'Test User'
      }
    }
    
    getSession.mockResolvedValueOnce(mockSession)
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'This is a protected API endpoint',
      user: mockSession.user
    })
  })
})
