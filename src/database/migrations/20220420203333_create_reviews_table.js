exports.up = knex => knex.schema.createTable('reviews', table => {
    table.increments('id')
    table.float('rating')
        .notNullable()
    table.text('message')
    table.integer('user_id')
        .notNullable()
    table.integer('gun_id')
        .notNullable()

    table.foreign('gun_id')
        .references('guns.id')
    table.foreign('user_id')
        .references('users.id')

    table.timestamps(true, true)
})

exports.down = knex => knex.schema.dropTable('reviews')
