require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

interface User {
  username: string
  email: string
  password: string
  is_admin: boolean
}

function checkForNullValues(data: User): void{
  for(let key in data) {
    if(data[key] == null || data[key] == undefined)
      throw new Error(key + " can't be null.")
  }
}

const filterProperties = (data: User): User => {
  const { username, email, password } = data
  return { username, email, password, is_admin: false }
}

const validEmail = /^.+@.+\..+$/
const saltOrRounds = 10
const expiresIn = '1h'
const expiredTokens = []

export const UserController = {

  async index(req, res, next) {
    const maxPerPage = 10

    try {
      const { page = 1 } = req.query
      const pagination = { skip: (page - 1) * maxPerPage, take: maxPerPage }
      const { id } = req.params

      if (id) {
        const user: User = await prisma.user.findFirst({ where: { id } })
        if(!user)
          throw new Error('User not found!')
        
        return res.json(user)
      }

      const users = await prisma.user.findMany({ ...pagination })
      return res.json(users)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const data: User = filterProperties(req.body)
      checkForNullValues(data)

      // Exception handling
      if (await prisma.user.findFirst({ where: { username: data.username } }))
        throw new Error('Username already registered.')

      if (await prisma.user.findFirst({ where: { email: data.email } }))
        throw new Error('E-mail already registered.')

      if (data.password.length < 6)
        throw new Error('Password needs to be at least 6 characters long.')

      if (!validEmail.test(data.email))
        throw new Error('Invalid e-mail.')

      data.password = await bcrypt.hash(data.password, saltOrRounds)

      await prisma.user.create({ data })
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const { username, password } = req.body
      const user = await knex('users').where('username', username)

      if (user.length == 0)
        throw new Error('Username not found.')

      const rightPassword = await bcrypt.compare(password, user[0].password)

      if (!rightPassword) {
        throw new Error('Wrong password.')
      } else {
        const token = jwt.sign(user[0], process.env.secret_key, { expiresIn })
        return res.json({ auth: true, token })
      }
    } catch (error) {
      next(error)
    }
  },

  async logout(req, res, next) {
    const token = req.headers['x-access-token']
    expiredTokens.push(token)

    return res.json({ auth: false, token: null })
  },

  async auth(req, res, next) {
    try {
      const token = req.headers['x-access-token']

      if (!token)
        throw new Error('No jwt provided.')

      if (expiredTokens.indexOf(token) >= 0)
        return res.status(403).send()

      jwt.verify(token, process.env.secret_key, (error, decoded) => {
        if (error)
          next(error)

        return res.status(200).send()
      })

    } catch (error) {
      next(error)
    }
  }

}