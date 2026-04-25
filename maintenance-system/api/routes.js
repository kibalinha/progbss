import express from 'express'
import cors from 'cors'
import pool from './db.js'

const router = express.Router()

// SECTORS
router.get('/sectors', async (req, res) => {
  try {
    const result = await pool.query('SELECT name FROM sectors ORDER BY name')
    res.json(result.rows.map(r => r.name))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/sectors', async (req, res) => {
  try {
    const { name } = req.body
    await pool.query('INSERT INTO sectors (name) VALUES ($1) ON CONFLICT DO NOTHING', [name])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/sectors/:name', async (req, res) => {
  try {
    await pool.query('DELETE FROM sectors WHERE name = $1', [req.params.name])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// TECHNICIANS
router.get('/technicians', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM technicians ORDER BY name')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/technicians', async (req, res) => {
  try {
    const { name, sector, shift } = req.body
    const result = await pool.query(
      'INSERT INTO technicians (name, sector, shift) VALUES ($1, $2, $3) RETURNING *',
      [name, sector, shift]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/technicians/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM technicians WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ACTIVITIES
router.get('/activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY id DESC')
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/activities', async (req, res) => {
  try {
    const { description, sector, technician, priority, status, date, shift, estimatedTime, isExtra, notes } = req.body
    const result = await pool.query(
      `INSERT INTO activities (description, sector, technician, priority, status, date, shift, estimated_time, is_extra, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [description, sector, technician, priority, status, date, shift, estimatedTime || 0, isExtra || false, notes || '']
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/activities/:id', async (req, res) => {
  try {
    const { status, notes } = req.body
    const result = await pool.query(
      'UPDATE activities SET status = $1, notes = $2 WHERE id = $1 RETURNING *',
      [status, notes || '']
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/activities/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
