import type { User } from '@prisma/client'

export type newLink = {
  id: number
  url: string
  description: string
  user: User
}
