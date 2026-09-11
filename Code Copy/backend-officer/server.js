/**
 * NLAMS: Field & Land Verification Spatial Express Gateway (PostGIS)
 */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/nlams_verify?schema=public'
});

// Spatial Mismatch Query Endpoint
app.get('/api/v1/officer/spatial-check/:appId', async (req, res) => {
  const { appId } = req.params;
  try {
    const query = `
      SELECT plot_id, khasra_number, claimed_area_ha, ror_registered_area_ha,
             (claimed_area_ha - ror_registered_area_ha) AS area_delta,
             ST_AsGeoJSON(plot_geometry) AS geojson
      FROM cadastral_verification_plots
      WHERE application_id = $1;
    `;
    const { rows } = await pool.query(query, [appId]);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Statutory Rejection Action Endpoint
app.post('/api/v1/officer/statutory-decision', async (req, res) => {
  const { application_id, action_type, official_statutory_grounds } = req.body;
  try {
    const insertQuery = `
      INSERT INTO statutory_rejection_logs (application_id, action_type, official_statutory_grounds)
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [application_id, action_type, official_statutory_grounds]);
    res.status(201).json({ success: true, message: "Statutory decision executed and broadcast to PIA.", record: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`NLAMS Officer Verification Spatial Gateway live on port ${port}`);
});