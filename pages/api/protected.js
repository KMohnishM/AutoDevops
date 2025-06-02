import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({ req })
  
  if (!session) {
    res.status(401).json({ error: 'Unauthorized: You must be signed in to access this endpoint' })
    return
  }
  
  res.status(200).json({ 
    message: 'This is a protected API endpoint', 
    user: session.user 
  })
} 