import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import type { Context } from '@/types/Context'

const APP_SECRET = process.env.APP_SECRET as string

// ユーザー新規登録
export const singUp = async (
  _: unknown,
  args: { email: string; password: string; name: string },
  context: Context
) => {
  // パスワードの設定
  const password = await bcrypt.hash(args.password, 10)

  if (!args.email || !password || !args.name) {
    throw new Error('Email、Password or Name is required')
  }

  // ユーザー新規作成
  const user = await context.prisma.user.create({
    data: {
      ...args,
      password,
    },
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  if (!token) {
    throw new Error('Token is required')
  }

  return {
    token,
    user,
  }
}

// ユーザーログイン
export const login = async (
  _: unknown,
  args: { email: string; password: string },
  context: Context
) => {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  })
  if (!user) {
    throw new Error('User not exists')
  }

  // パスワードの比較
  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Password is invalid')
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

export const post = async (
  _: unknown,
  args: { description: string; url: string },
  context: Context
) => {
  const userId = context.userId as number

  const newLink = await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      user: { connect: { id: userId } },
    },
    include: {
      user: true,
    },
  })

  // サブスクリプション送信（第一引数：トリガー名 / 第二引数：渡したい値）
  context.pubsub.publish('NEW_LINK', newLink)

  return newLink
}

export const vote = async (
  _: unknown,
  args: { linkId: string },
  context: Context
) => {
  const userId = context.userId as number

  const vote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: Number(args.linkId),
        userId: userId,
      },
    },
  })

  if (vote) {
    throw new Error(`Link is already voted: ${args.linkId}`)
  }

  const newVote = await context.prisma.vote.create({
    data: {
      user: { connect: { id: userId } },
      link: { connect: { id: Number(args.linkId) } },
    },
    include: {
      link: true,
      user: true,
    },
  })

  context.pubsub.publish('NEW_VOTE', newVote)

  return newVote
}
