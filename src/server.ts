import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

// スキーマの定義
const typeDefs = `#graphql
  type Query {
    info: String!
  }
`

// リゾルバー関数
const resolvers = {
  Query: {
    info: () => 'HackerNewsクローン',
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  })

  console.log(`🚀  Server ready at: ${url}`)
}

startServer()
