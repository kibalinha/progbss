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
      const technicians = await sql`SELECT * FROM technicians ORDER BY name`;
      // Convert snake_case to camelCase for frontend compatibility
      const formattedTechnicians = technicians.map(t => ({
        id: t.id,
        name: t.name,
        sector: t.sector,
        shift: t.shift,
        createdAt: t.created_at
      }));
      res.json(formattedTechnicians);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      res.status(500).json({ error: 'Failed to fetch technicians' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, sector, shift } = req.body;
      const result = await sql`
        INSERT INTO technicians (name, sector, shift)
        VALUES (${name}, ${sector}, ${shift})
        RETURNING *
      `;
      // Convert snake_case to camelCase for frontend compatibility
      const formattedResult = {
        id: result[0].id,
        name: result[0].name,
        sector: result[0].sector,
        shift: result[0].shift,
        createdAt: result[0].created_at
      };
      res.json(formattedResult);
    } catch (error) {
      console.error('Error adding technician:', error);
      res.status(500).json({ error: 'Failed to add technician' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await sql`DELETE FROM technicians WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting technician:', error);
      res.status(500).json({ error: 'Failed to delete technician' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
