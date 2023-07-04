import type { Context } from '@/types/Context'

export const links = (
  parent: { id: number },
  __: unknown,
  context: Context
) => {
  return context.prisma.user
    .findUnique({
      where: { id: parent.id },
    })
    .links()
}
