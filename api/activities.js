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
      // Convert snake_case to camelCase for frontend compatibility
      const formattedActivities = activities.map(a => ({
        id: a.id,
        description: a.description,
        sector: a.sector,
        technician: a.technician,
        priority: a.priority,
        status: a.status,
        date: a.date,
        shift: a.shift,
        estimatedTime: a.estimated_time,
        isExtra: a.is_extra,
        notes: a.notes,
        createdAt: a.created_at
      }));
      res.json(formattedActivities);
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
      // Convert snake_case to camelCase for frontend compatibility
      const formattedResult = {
        id: result[0].id,
        description: result[0].description,
        sector: result[0].sector,
        technician: result[0].technician,
        priority: result[0].priority,
        status: result[0].status,
        date: result[0].date,
        shift: result[0].shift,
        estimatedTime: result[0].estimated_time,
        isExtra: result[0].is_extra,
        notes: result[0].notes,
        createdAt: result[0].created_at
      };
      res.json(formattedResult);
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
