import type { LinkPayload } from '@prisma/client'

import type { Context } from '@/types/Context'

const newLinkSubscribe = (
  _: unknown,
  args: { description: string; url: string },
  context: Context
) => {
  return context.pubsub.asyncIterator('NEW_LINK')
}

export const newLink = {
  subscribe: newLinkSubscribe,
  // resolve: (payload: LinkPayload) => {
  //   return payload
  // },
}
