import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM technicians ORDER BY name')
      return res.status(200).json(result.rows)
    }

    if (req.method === 'POST') {
      const { name, sector, shift } = req.body
      const result = await pool.query(
        'INSERT INTO technicians (name, sector, shift) VALUES ($1, $2, $3) RETURNING *',
        [name, sector, shift]
      )
      return res.status(200).json(result.rows[0])
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      await pool.query('DELETE FROM technicians WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
