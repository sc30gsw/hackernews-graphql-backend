import type { IncomingMessage } from 'http'
import jwt from 'jsonwebtoken'

const APP_SECRET = process.env.APP_SECRET as string

interface TokenPayload {
  userId: string
}

// トークンを復号する
const getTokenPayload = (token: string): TokenPayload => {
  return jwt.verify(token, APP_SECRET) as TokenPayload
}

// ユーザーIDを取得
export const getUserId = (req?: IncomingMessage, authToken?: string) => {
  if (req) {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const token = authHeader.replace('Bearer', '')

      if (!token) {
        throw new Error('Token is undefined')
      }

      // トークンの復号
      const { userId } = getTokenPayload(token)

      return userId
    }
  } else if (authToken) {
    const { userId } = getTokenPayload(authToken)
    return userId
  }

  throw new Error('Not Authentication')
}
