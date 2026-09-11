-- ============================================================================
-- NLAMS: Field & Land Verification Officer Spatial Engine (PostGIS)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Officer Role Registry
CREATE TABLE revenue_officers (
    officer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL, -- 'CADASTRAL_SURVEYOR', 'REVENUE_OFFICER', 'SLAO', 'STATE_NODAL'
    state_code VARCHAR(10) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    official_email VARCHAR(150) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PostGIS Cadastral Plots & Mismatch Tracking
CREATE TABLE cadastral_verification_plots (
    plot_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(100) NOT NULL,
    revenue_village VARCHAR(150) NOT NULL,
    khasra_number VARCHAR(50) NOT NULL,
    claimed_area_ha NUMERIC(10, 4) NOT NULL,
    ror_registered_area_ha NUMERIC(10, 4) NOT NULL,
    ror_titleholder_name VARCHAR(255) NOT NULL,
    plot_geometry GEOMETRY(Polygon, 4326),          -- Cadastral Spatial Polygon
    mismatch_detected BOOLEAN DEFAULT FALSE,
    mismatch_delta_ha NUMERIC(10, 4) DEFAULT 0.0000,
    verified_by_officer UUID REFERENCES revenue_officers(officer_id),
    verification_status VARCHAR(50) DEFAULT 'PENDING'
);

-- 3. On-Site Physical Inspection Logs
CREATE TABLE field_inspection_dossiers (
    dossier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(100) NOT NULL,
    inspecting_officer_id UUID REFERENCES revenue_officers(officer_id),
    rtk_gps_location GEOMETRY(Point, 4326) NOT NULL,
    observed_land_use VARCHAR(100) NOT NULL,
    structural_encumbrances TEXT,
    tree_count INT DEFAULT 0,
    officer_statutory_remarks TEXT NOT NULL,
    inspection_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Statutory Rejection & Action Audit Log
CREATE TABLE statutory_rejection_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(100) NOT NULL,
    officer_id UUID REFERENCES revenue_officers(officer_id),
    action_type VARCHAR(50) NOT NULL,              -- 'REJECTED_WITH_CAUSE', 'CORRECTION_REQUIRED', 'RECOMMENDED'
    official_statutory_grounds TEXT NOT NULL,
    transmitted_to_pia BOOLEAN DEFAULT TRUE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);