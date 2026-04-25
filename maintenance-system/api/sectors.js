const { Pool } = require('@neondatabase/serverless')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT name FROM sectors ORDER BY name')
      return res.status(200).json(result.rows.map(r => r.name))
    }

    if (req.method === 'POST') {
      const { name } = req.body
      await pool.query('INSERT INTO sectors (name) VALUES ($1) ON CONFLICT DO NOTHING', [name])
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      const { name } = req.query
      await pool.query('DELETE FROM sectors WHERE name = $1', [name])
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
