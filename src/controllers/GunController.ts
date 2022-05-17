require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')

import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type GunCategory = 'Pistol' | 'Shotgun' | 'Machine Gun' | 'SMG' | 'Assault Rifle' | 'Sniper Rifle'
type GunTeam = 'CT' | 'TR' | 'CTandTR'
type GunFireMode = 'Automatic' | 'Semi-automatic' | 'Pump-action' | 'Burst fire' | 'Bolt-action'

interface Gun {
  name: string
  category: string
  release_date?: Date | null
  price: number
  used_by: string
  damage: number
  fire_rate: number
  fire_mode: string
  magazine_capacity: number
  max_ammo: number
  reload_time: number
  running_speed: number

  img_path?: string
}

interface GunUpdate {
  name?: string
  category?: GunCategory
  release_date?: Date | null
  price?: number
  used_by?: GunTeam
  damage?: number
  fire_rate?: number
  fire_mode?: GunFireMode
  magazine_capacity?: number
  max_ammo?: number
  reload_time?: number
  running_speed?: number
  img_path?: string
  
  updated_at?: Date
}

function checkForNullValues(data: Gun | GunUpdate): void{
  const nullableProperties = ['release_date']

  for(let key in data) {
    if(nullableProperties.includes(key))
      continue

    if(data[key] == null || data[key] == undefined)
      throw new Error(key + " can't be null.")
  }
}

function convertNumericValues(data: Gun | GunUpdate): Gun | GunUpdate {
  const numericValuesKeys = [
    'price', 'damage', 'fire_rate', 'magazine_capacity', 'max_ammo', 
    'reload_time', 'running_speed'
  ]

  for(let key in data) {
    if(!numericValuesKeys.includes(key))
      continue

    data[key] = Number(data[key])

    if(data[key] == 0)
      throw new Error(key + " can't be zero.")

    if(!data[key])
      throw new Error(key + ' needs to be a numeric value.')
      
    if(data[key] <= 0)
      throw new Error(key + " can't be negative.")
  }

  return data;
}

function filterGunProperties(data: Gun | GunUpdate): Gun | GunUpdate {
  const {
    name, category, release_date, price, used_by, damage, fire_rate, fire_mode,
    magazine_capacity, max_ammo, reload_time, running_speed,
  } = data

  data = {
    name, category, release_date, price, used_by, damage, fire_rate, fire_mode,
    magazine_capacity, max_ammo, reload_time, running_speed,
  }
  
  return convertNumericValues(data)
}

export const GunController = {

  async index(req, res, next) {
    const maxPerPage = 10

    function getOrderBy(sortType: string): object {
      if(sortType == 'price_asc')
        return { price: 'asc' }

      if(sortType == 'price_desc')
        return { price: 'desc' }
        
      if(sortType == 'name_asc')
        return { name: 'asc' }

      if(sortType == 'name_desc')
        return { name: 'desc' }
      
      if(sortType == 'release_date_asc')
        return { release_date: 'asc' }

      if(sortType == 'release_date_desc')
        return { release_date: 'desc' }

      return {}
    }

    try {
      const { 
        sortType,
        maxPrice, 
        minPrice, 
        name, 
        category, 
        usedBy, 
        page = 1
      } = req.query
      
      let orderBy
      let where = { AND: [] }
      const pagination = { skip: (page - 1) * maxPerPage, take: maxPerPage }
      const { id } = req.params

      if(id) {
        where.AND.push({ id })
        const gun: Gun = await prisma.gun.findFirst({ where })

        if(!gun)
          throw new Error('Gun not found!')

        return res.json(gun)
      }

      if(maxPrice)
        where.AND.push({ price: { lte: Number(maxPrice) } })
      if(minPrice)
        where.AND.push({ price: { gte: Number(minPrice) } })
      if(name)
        where.AND.push({ name: { contains: name } })
      if(category)
        where.AND.push({ category })
      if(usedBy) {
        if(usedBy == 'CTandTR')
          where.AND.push({ OR: [ { used_by: { contains: 'CT' } }, { used_by: { contains: 'TR' } } ] })
        else
          where.AND.push({ used_by: { contains: usedBy } })
      }

      if(sortType)
        orderBy = getOrderBy(sortType)

      // FALTA ADICIONAR A MÉDIAS DAS REVIEWS EM CADA ARMA E A PAGINAÇÃO

      const totalOfGuns: number = await (await prisma.gun.findMany({ where, orderBy })).length
      const guns: Gun[] = await prisma.gun.findMany({ where, orderBy, ...pagination })
      res.header('X-Total-Count', totalOfGuns)
      
      return res.json(guns)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const data: Gun = filterGunProperties(req.body) as Gun
      checkForNullValues(data)
      if(data.release_date)
        data.release_date = new Date(data.release_date)

      // const token = req.headers['x-access-token']
      // const user = jwt.verify(token, process.env.secret_key)

      // if (!user.is_admin)
      //   throw new Error('Access denied.')
      
      if(await prisma.gun.findUnique({ where: { name: data.name } }))
        throw new Error('Gun name already registered')

      if(data.release_date && data.release_date > new Date())
        throw new Error("Release date can't be in the future.")

      if (req.file)
        data.img_path = req.file.filename

      await prisma.gun.create({ data })
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const data: GunUpdate = filterGunProperties(req.body) as GunUpdate
      const { id } = req.params
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)

      // Exception handling
      if (!user.is_admin)
        throw new Error('Access denied.')

      if (id == 0)
        throw new Error('No id provided.')

      const gun = await knex('guns').where({ id })

      // Exception handling
      if (gun.length == 0)
        throw new Error('Gun not found.')

      data.updated_at = new Date()
      await knex('guns').update(data).where({ id })
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  },

  async delete(req, res, next) {
    try {
      const { id = 0 } = req.query
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)

      if (!user.is_admin)
        throw new Error('Access denied.')

      if (id == 0)
        throw new Error('No id provided.')

      const gun = await knex('guns').where({ id })

      if (gun.length == 0)
        throw new Error('Gun not found.')

      await knex('guns').where({ id }).del()
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  }

}