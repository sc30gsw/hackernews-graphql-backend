import type { User } from '@prisma/client'

export type publishLink = {
  id: number
  url: string
  description: string
  user: User
}
