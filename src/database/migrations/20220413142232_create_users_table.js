exports.up = async knex => knex.schema.createTable('users', table => {
    table.increments('id')
    table.string('username')
        .notNullable()
        .unique()
    table.string('email')
        .notNullable()
        .unique()
    table.string('hash_password')
        .notNullable()

    table.timestamps(true, true)
})

exports.down = async knex => knex.schema.dropTable('users')
