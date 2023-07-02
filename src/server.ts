import 'dotenv/config'

import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { PrismaClient } from '@prisma/client'
import { join } from 'path'

import { user } from './resolvers/Link'
import { login, post, singUp } from './resolvers/Mutation'
import { feed } from './resolvers/Query'
import { links } from './resolvers/User'
import { getUserId } from './utils'

const prisma = new PrismaClient()

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
})

// リゾルバー関数
const resolvers = {
  Query: {
    feed: feed,
  },

  Mutation: {
    signUp: singUp,
    login: login,
    post: post,
  },

  Link: {
    user: user,
  },

  User: {
    links: links,
  },
}

const schemaWithResolvers = addResolversToSchema({ schema, resolvers })
const server = new ApolloServer({
  schema: schemaWithResolvers,
})

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({
      ...req,
      prisma,
      userId: req && req.headers.authorization ? getUserId(req) : null,
    }),
    listen: { port: 4000 },
  })
  console.log(`🚀  Server ready at: ${url}`)
}

startServer()
