import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM activities ORDER BY id DESC')
      return res.status(200).json(result.rows)
    }

    if (req.method === 'POST') {
      const { description, sector, technician, priority, status, date, shift, estimatedTime, isExtra, notes } = req.body
      const result = await pool.query(
        `INSERT INTO activities (description, sector, technician, priority, status, date, shift, estimated_time, is_extra, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [description, sector, technician, priority, status, date, shift, estimatedTime || 0, isExtra || false, notes || '']
      )
      return res.status(200).json(result.rows[0])
    }

    if (req.method === 'PUT') {
      const { id } = req.query
      const { status, notes } = req.body
      await pool.query(
        'UPDATE activities SET status = $1, notes = $2 WHERE id = $3',
        [status, notes || '', id]
      )
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      await pool.query('DELETE FROM activities WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
