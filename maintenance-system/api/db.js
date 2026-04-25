import { Pool } from '@neondatabase/serverless'
import { config } from 'dotenv'

config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default pool
