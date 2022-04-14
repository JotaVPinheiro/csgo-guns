require('dotenv').config()

e.exports = {

  development: {
    client: 'pg',
    connection: {
      database: process.env.database,
      user:     process.env.user,
      password: process.env.password
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: `${__dirname}/src/database/migrations`
    },
    seeds: {
      directory: `${__dirname}/src/database/seeds`
    }
  }

};
