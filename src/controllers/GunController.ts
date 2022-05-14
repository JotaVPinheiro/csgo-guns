require('dotenv').config
const knex = require('../database')
const jwt = require('jsonwebtoken')

type GunCategory = 'Pistol' | 'Shotgun' | 'Machine Gun' | 'SMG' | 'Assault Rifle' | 'Sniper Rifle'
type GunTeam = 'CT' | 'TR' | 'CT and TR'
type GunFireMode = 'Automatic' | 'Semi-automatic' | 'Pump-action' | 'Burst fire' | 'Bolt-action'

interface Gun {
  name: string
  category: GunCategory
  release_date?: Date | string
  price: number
  used_by: GunTeam
  damage: number
  fire_rate: number
  fire_mode: GunFireMode
  magazine_capacity: number
  max_ammo: number
  reload_time: number
  running_speed: number

  img_path?: string
}

interface GunUpdate {
  name?: string
  category?: GunCategory
  release_date?: Date | string
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
  
  updated_at: Date
}

function filterProperties(data: Gun): Gun | GunUpdate {
  const { 
    name, category, release_date, price, used_by, damage, fire_rate, fire_mode,
    magazine_capacity, max_ammo, reload_time, running_speed 
  } = data
  return {
    name, category, release_date, price, used_by, damage, fire_rate, fire_mode,
    magazine_capacity, max_ammo, reload_time, running_speed 
  }
}

export const GunController = {
  async index(req, res, next) {
    try {
      const params = req.query
      const page = params.page || 1

      const query = knex('guns')

      // Filtering
      if (params.id) {
        query.where('id', params.id)
        const results = await query
        return res.json(results)
      }

      if (params.name)
        query.whereILike('name', `${params.name}%`)
      if (params.max_price)
        query.where('price', '<=', params.max_price)
      if (params.min_price)
        query.where('price', '>=', params.min_price)
      if (params.category)
        query.whereLike('category', params.category)
      if (params.used_by)
        query.whereLike('used_by', `%${params.used_by}%`)

      // Ordenation
      if (params.by_price)
        query.orderBy('price', params.desc ? 'desc' : '')
      else if (params.by_name)
        query.orderBy('name', params.desc ? 'desc' : '')
      else if (params.by_release)
        query.orderBy('release_date', params.desc ? 'desc' : '')

      query
        .limit(process.env.max_per_page)
        .offset((page - 1) * Number(process.env.max_per_page))

      const guns = await query

      for (const index in guns) {
        const reviews = await knex('reviews')
          .where('gun_id', guns[index].id)

        let rating = 0

        for (const review of reviews) {
          rating += review.rating
        }

        guns[index].rating = rating
          ? (rating / reviews.length).toFixed(1)
          : 'none'
      }

      return res.json(guns)
    } catch (error) {
      next(error)
    }
  },

  async create(req, res, next) {
    try {
      const data: Gun = req.body as Gun
      const token = req.headers['x-access-token']
      const user = jwt.verify(token, process.env.secret_key)

      // Exception handling
      if (!user.is_admin)
        throw new Error('Access denied.')

      if ((await knex('guns').where('name', data.name)).length > 0)
        throw new Error('Gun name already registered')

      if (Date.parse(data.release_date as string) > Date.now())
        throw new Error("Release date can't be in the future.")

      for (const element in data) {
        if (!data[element] || data[element] == 0)
          throw new Error(`${element} can't be null.`)

        if (data[element] < 0)
          throw new Error(`${element} can't be negative.`)
      }

      if (req.file)
        data.img_path = req.file.filename

      await knex('guns').insert(data)
      return res.status(201).send()
    } catch (error) {
      next(error)
    }
  },

  async update(req, res, next) {
    try {
      const data: GunUpdate = filterProperties(req.body) as GunUpdate
      const { id = 0 } = req.query
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