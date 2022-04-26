const bcrypt = require('bcrypt')

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {
      username: 'jotav',
      email: 'jotav@jotav.com',
      hash_password: await bcrypt.hash(process.env.password, 10),
      is_admin: true
    }
  ]);
};
