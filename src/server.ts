import 'dotenv/config'

import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { PrismaClient } from '@prisma/client'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { PubSub } from 'graphql-subscriptions'
import { useServer } from 'graphql-ws/lib/use/ws'
import { createServer } from 'http'
import { join } from 'path'
import { WebSocketServer } from 'ws'

import { user } from './resolvers/Link'
import { login, post, singUp } from './resolvers/Mutation'
import { feed } from './resolvers/Query'
import { links } from './resolvers/User'
import type { Context } from './types/Context'
import type { publishLink } from './types/PublishLink'
import { getUserId } from './utils'

const PORT = 4000
const pubsub = new PubSub()

const prisma = new PrismaClient()

const app = express()

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

  Subscription: {
    newLink: {
      subscribe: () => pubsub.asyncIterator(['NEW_LINK']),
      resolve: async (payload: publishLink) => {
        return payload
      },
    },
  },

  Link: {
    user: user,
  },

  User: {
    links: links,
  },
}

const schemaWithResolvers = addResolversToSchema({ schema, resolvers })

const httpServer = createServer(app)

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer({ schema: schemaWithResolvers }, wsServer)

const server = new ApolloServer<Context>({
  schema: schemaWithResolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
})

;(async () => {
  try {
    await server.start()

    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          ...req,
          prisma,
          pubsub,
          userId: req && req.headers.authorization ? getUserId(req) : undefined,
        }),
      })
    )

    httpServer.listen(PORT, () => {
      console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`)
      console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
      )
    })
  } catch (error) {
    console.error('Error starting server: ', error)
  }
})()
