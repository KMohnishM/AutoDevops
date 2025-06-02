import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting setup (simplified example)
const RATE_LIMIT_DURATION = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100
const ipRequestCounts = new Map()
const ipFirstRequestTime = new Map()

export async function middleware(request) {
  // Rate limiting implementation
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  if (!ipFirstRequestTime.has(ip)) {
    ipFirstRequestTime.set(ip, now)
    ipRequestCounts.set(ip, 1)
  } else {
    const firstRequestTime = ipFirstRequestTime.get(ip)
    if (now - firstRequestTime > RATE_LIMIT_DURATION) {
      // Reset if the duration has passed
      ipFirstRequestTime.set(ip, now)
      ipRequestCounts.set(ip, 1)
    } else {
      // Increment the count
      const count = ipRequestCounts.get(ip) + 1
      ipRequestCounts.set(ip, count)
      
      // Check if rate limit exceeded
      if (count > MAX_REQUESTS) {
        return new NextResponse('Rate limit exceeded', { status: 429 })
      }
    }
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers })
  }

  // For protected routes, check authentication
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401, headers })
    }
  }

  // Continue with the request
  return NextResponse.next({ headers })
}

export const config = {
  matcher: '/api/:path*',
} 