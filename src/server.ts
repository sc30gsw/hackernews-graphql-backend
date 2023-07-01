import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { join } from 'path'

import type { Link } from './types/Link'

const links: Link[] = []

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
})

// リゾルバー関数
const resolvers = {
  Query: {
    info: () => 'HackerNewsクローン',
    feed: () => links,
  },

  Mutation: {
    post: async (_: unknown, args: { description: string; url: string }) => {
      let idCount = links.length

      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      }

      links.push(link)

      return link
    },
  },
}

const schemaWithResolvers = addResolversToSchema({ schema, resolvers })
const server = new ApolloServer({
  schema: schemaWithResolvers,
})

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  })
  console.log(`🚀  Server ready at: ${url}`)
}

startServer()
