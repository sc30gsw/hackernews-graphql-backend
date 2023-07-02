import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const APP_SECRET = process.env.APP_SECRET as string

// ユーザー新規登録
export const singUp = async (
  _: unknown,
  args: { email: string; password: string; name: string }
) => {
  // パスワードの設定
  const password = await bcrypt.hash(args.password, 10)

  if (!args.email || !password || !args.name) {
    throw new Error('Email、Password or Name is required')
  }

  // ユーザー新規作成
  const user = await prisma.user.create({
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
  args: { email: string; password: string }
) => {
  const user = await prisma.user.findUnique({
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

// ニュース投稿
export const post = async (
  _: unknown,
  args: { description: string; url: string }
) => {
  const newLink = await prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
    },
  })

  return newLink
}
