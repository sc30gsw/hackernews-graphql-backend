import type { Context } from '@/types/Context'

export const links = (parent: { id: any }, __: unknown, context: Context) => {
  return context.prisma.user
    .findUnique({
      where: { id: parent.id },
    })
    .links()
}
