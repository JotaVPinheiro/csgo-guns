exports.up = async knex => knex.schema.alterTable('users', table => {
  table.renameColumn('hash_password', 'password')
})

exports.down = async knex => knex.schema.alterTable('users', table => {
  table.dropColumn('password')
})
