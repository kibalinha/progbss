import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toCamelModel(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sector: row.sector,
    shift: row.shift,
    priority: row.priority,
    estimatedTime: row.estimated_time,
    notes: row.notes,
    createdAt: row.created_at
  };
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const models = await sql`SELECT * FROM models ORDER BY created_at DESC`;
      const mapped = models.map(toCamelModel);
      res.json(mapped);
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, sector, shift, priority, estimatedTime, notes } = req.body;
      const result = await sql`
        INSERT INTO models (name, description, sector, shift, priority, estimated_time, notes)
        VALUES (${name}, ${description}, ${sector}, ${shift}, ${priority}, ${estimatedTime}, ${notes})
        RETURNING *
      `;
      const inserted = result[0];
      res.json(toCamelModel(inserted));
    } catch (error) {
      console.error('Error adding model:', error);
      res.status(500).json({ error: 'Failed to add model' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, name, description, sector, shift, priority, estimatedTime, notes } = req.body;
      const result = await sql`
        UPDATE models 
        SET name = ${name}, 
            description = ${description}, 
            sector = ${sector}, 
            shift = ${shift}, 
            priority = ${priority}, 
            estimated_time = ${estimatedTime}, 
            notes = ${notes}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.length === 0) {
        res.status(404).json({ error: 'Model not found' });
      } else {
        res.json(toCamelModel(result[0]));
      }
    } catch (error) {
      console.error('Error updating model:', error);
      res.status(500).json({ error: 'Failed to update model' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await sql`DELETE FROM models WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting model:', error);
      res.status(500).json({ error: 'Failed to delete model' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
