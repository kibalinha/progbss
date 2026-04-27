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
      const sectors = await sql`SELECT name FROM sectors ORDER BY name`;
      res.json(sectors.map(s => s.name));
    } catch (error) {
      console.error('Error fetching sectors:', error);
      res.status(500).json({ error: 'Failed to fetch sectors' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name } = req.body;
      await sql`INSERT INTO sectors (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
      res.json({ success: true });
    } catch (error) {
      console.error('Error adding sector:', error);
      res.status(500).json({ error: 'Failed to add sector' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { name } = req.body;
      await sql`DELETE FROM sectors WHERE name = ${name}`;
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting sector:', error);
      res.status(500).json({ error: 'Failed to delete sector' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
