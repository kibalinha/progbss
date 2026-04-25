import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sectors (
        name VARCHAR(100) PRIMARY KEY
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS technicians (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        sector VARCHAR(100) REFERENCES sectors(name),
        shift VARCHAR(10) CHECK (shift IN ('day', 'night'))
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        sector VARCHAR(100) REFERENCES sectors(name),
        technician VARCHAR(200),
        priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
        status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'not_done', 'extra')),
        date DATE,
        shift VARCHAR(10) CHECK (shift IN ('day', 'night')),
        estimated_time INTEGER DEFAULT 0,
        is_extra BOOLEAN DEFAULT false,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Insert default sectors if empty
    const sectorsResult = await pool.query('SELECT COUNT(*) FROM sectors')
    if (parseInt(sectorsResult.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO sectors (name) VALUES 
        ('Elétrica'), ('Mecânica'), ('Utilidades'), ('Instrumentação')
        ON CONFLICT DO NOTHING
      `)
    }

    return res.status(200).json({ success: true, message: 'Database initialized' })
  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
