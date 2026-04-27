import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

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
      const activities = await sql`SELECT * FROM activities ORDER BY created_at DESC`;
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  } else if (req.method === 'POST') {
    try {
      const { description, sector, technician, priority, status, date, shift, estimatedTime, isExtra, notes } = req.body;
      const result = await sql`
        INSERT INTO activities (description, sector, technician, priority, status, date, shift, estimated_time, is_extra, notes)
        VALUES (${description}, ${sector}, ${technician}, ${priority}, ${status}, ${date}, ${shift}, ${estimatedTime}, ${isExtra}, ${notes})
        RETURNING *
      `;
      res.json(result[0]);
    } catch (error) {
      console.error('Error adding activity:', error);
      res.status(500).json({ error: 'Failed to add activity' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await sql`DELETE FROM activities WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting activity:', error);
      res.status(500).json({ error: 'Failed to delete activity' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status, notes } = req.body;
      await sql`
        UPDATE activities 
        SET status = ${status}, notes = ${notes}
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({ error: 'Failed to update activity' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
