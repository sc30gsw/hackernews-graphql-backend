import type { Context } from '@/types/Context'

export const feed = async (_: unknown, __: unknown, context: Context) => {
  return context.prisma.link.findMany()
}
