import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
      const { date, shift } = req.query;
      
      if (!date || !shift) {
        return res.status(400).json({ error: 'Date and shift are required' });
      }

      // Get activities for the specified date and shift
      const activities = await sql`
        SELECT * FROM activities 
        WHERE date = ${date} AND shift = ${shift}
        ORDER BY sector, technician
      `;

      // Get all sectors
      const sectors = await sql`SELECT name FROM sectors ORDER BY name`;

      // Calculate stats per sector
      const sectorStats = sectors.map(sector => {
        const sectorActivities = activities.filter(a => a.sector === sector.name);
        return {
          sector: sector.name,
          total: sectorActivities.length,
          completed: sectorActivities.filter(a => a.status === 'completed').length,
          pending: sectorActivities.filter(a => a.status === 'pending').length,
          inProgress: sectorActivities.filter(a => a.status === 'in_progress').length,
          notDone: sectorActivities.filter(a => a.status === 'not_done').length,
          extras: sectorActivities.filter(a => a.is_extra).length
        };
      }).filter(s => s.total > 0); // Only include sectors with activities

      // Get critical activities (not done and pending)
      const criticalActivities = activities
        .filter(a => a.status === 'not_done' || a.status === 'pending')
        .map(a => ({
          id: a.id,
          description: a.description,
          sector: a.sector,
          technician: a.technician,
          status: a.status,
          priority: a.priority,
          estimatedTime: a.estimated_time
        }));

      // Calculate totals
      const totals = {
        total: activities.length,
        completed: activities.filter(a => a.status === 'completed').length,
        pending: activities.filter(a => a.status === 'pending').length,
        inProgress: activities.filter(a => a.status === 'in_progress').length,
        notDone: activities.filter(a => a.status === 'not_done').length,
        extras: activities.filter(a => a.is_extra).length
      };

      res.json({
        date,
        shift,
        sectorStats,
        criticalActivities,
        totals
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
