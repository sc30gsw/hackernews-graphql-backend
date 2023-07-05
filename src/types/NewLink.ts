import type { User } from '@prisma/client'

export type NewLink = {
  id: number
  url: string
  description: string
  user: User
}
