import type { Link, User } from '@prisma/client'

export type NewVote = {
  id: number
  link: Link
  user: User
}
