import type { Context } from '@/types/Context'

export const link = (parent: { id: number }, __: unknown, context: Context) =>
  context.prisma.vote.findUnique({ where: { id: parent.id } }).link()

export const voteUser = (
  parent: { id: number },
  __: unknown,
  context: Context
) => context.prisma.vote.findUnique({ where: { id: parent.id } }).user()
