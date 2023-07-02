import type { Context } from '@/types/Context'

export const user = (parent: { id: any }, __: unknown, context: Context) => {
  return context.prisma.link
    .findUnique({
      where: { id: parent.id },
    })
    .user()
}
