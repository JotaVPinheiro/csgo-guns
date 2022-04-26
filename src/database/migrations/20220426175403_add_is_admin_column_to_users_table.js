exports.up = async knex => knex.schema.alterTable('users', table => {
    table.boolean('is_admin')
        .notNullable()
})

exports.down = async knex => knex.schema.alterTable('users', table => {
    table.dropColumn('is_admin')
})
