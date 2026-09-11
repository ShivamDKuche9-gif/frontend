/**
 * NLAMS: Project Implementing Agency (PIA) Express REST API Engine
 */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// PostgreSQL Pool Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/nlams_pia?schema=public'
});

// API Routes
// 1. Get Agency Projects
app.get('/api/v1/pia/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pia_projects ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create Project Proposal
app.post('/api/v1/pia/projects', async (req, res) => {
  const { project_id, project_name, infrastructure_type, state_name, primary_district, corridor_chainage, estimated_cost_cr, total_land_required_ha, execution_timeline_months, estimated_pafs, public_purpose_text } = req.body;
  try {
    const query = `
      INSERT INTO pia_projects (project_id, project_name, infrastructure_type, state_name, primary_district, corridor_chainage, estimated_cost_cr, total_land_required_ha, execution_timeline_months, estimated_pafs, public_purpose_text)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;
    `;
    const values = [project_id, project_name, infrastructure_type, state_name, primary_district, corridor_chainage, estimated_cost_cr, total_land_required_ha, execution_timeline_months, estimated_pafs, public_purpose_text];
    const { rows } = await pool.query(query, values);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Post Land Schedule
app.post('/api/v1/pia/land-schedules', async (req, res) => {
  const { project_id, revenue_village, khasra_survey_numbers, extent_hectares, tenure_classification, gis_polygon_geometry } = req.body;
  try {
    const query = `
      INSERT INTO land_schedules (project_id, revenue_village, khasra_survey_numbers, extent_hectares, tenure_classification, gis_polygon_geometry)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [project_id, revenue_village, khasra_survey_numbers, extent_hectares, tenure_classification, JSON.stringify(gis_polygon_geometry)];
    const { rows } = await pool.query(query, values);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Submit Fund Request
app.post('/api/v1/pia/fund-requests', async (req, res) => {
  const { project_id, market_value_cr, solatium_100pct_cr, rr_grants_cr, admin_expenses_cr, total_requested_cr } = req.body;
  try {
    const query = `
      INSERT INTO fund_requisitions (project_id, market_value_cr, solatium_100pct_cr, rr_grants_cr, admin_expenses_cr, total_requested_cr)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [project_id, market_value_cr, solatium_100pct_cr, rr_grants_cr, admin_expenses_cr, total_requested_cr];
    const { rows } = await pool.query(query, values);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`NLAMS PIA Express Gateway operating on port ${port}`);
});