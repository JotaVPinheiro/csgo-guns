exports.up = async knex => knex.schema.alterTable('guns', table => {
    table.string('img_path')
});

exports.down = async knex => knex.schema.alterTable('guns', table => {
    table.dropColumn('img_path')
});
