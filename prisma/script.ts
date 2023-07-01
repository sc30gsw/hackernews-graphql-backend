import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  await prisma.link.create({
    data: {
      description: 'GraphQLチュートリアルをUdemyで学ぶ',
      url: 'www.udemy-graphql-tutorial.com',
    },
  })

  const allLinks = await prisma.link.findMany()
  console.log(allLinks)
}

main()
  .catch((err) => {
    throw err
  })
  .finally(async () => {
    // DB接続を遮断する
    prisma.$disconnect
  })
