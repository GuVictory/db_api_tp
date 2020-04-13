require('dotenv').config()

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  user: 'docker',
  password: 'docker',
  port: '5432',
  database: 'forum_api_tp',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}