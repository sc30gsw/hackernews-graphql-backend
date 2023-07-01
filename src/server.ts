import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { PrismaClient } from '@prisma/client'
import { join } from 'path'

const prisma = new PrismaClient()

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
})

// リゾルバー関数
const resolvers = {
  Query: {
    info: () => 'HackerNewsクローン',
    feed: () => prisma.link.findMany(),
  },

  Mutation: {
    post: async (_: unknown, args: { description: string; url: string }) => {
      const newLink = prisma.link.create({
        data: {
          url: args.url,
          description: args.description,
        },
      })

      return newLink
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
