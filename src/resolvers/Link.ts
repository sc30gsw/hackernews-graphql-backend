import type { Context } from '@/types/Context'

export const user = (parent: { id: number }, __: unknown, context: Context) => {
  return context.prisma.link
    .findUnique({
      where: { id: parent.id },
    })
    .user()
}
