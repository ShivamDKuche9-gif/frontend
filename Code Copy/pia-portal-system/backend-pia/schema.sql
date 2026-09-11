-- ============================================================================
-- NLAMS: Project Implementing Agency (PIA) Database Schema
-- Standardized under RFCTLARR Act, 2013 & MoRTH / DoLR Guidelines
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Implementing Agency Registry
CREATE TABLE pia_agencies (
    agency_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_code VARCHAR(50) UNIQUE NOT NULL,      -- e.g., 'NHAI_PIU_VNS'
    agency_name VARCHAR(255) NOT NULL,            -- e.g., 'National Highways Authority of India'
    agency_category VARCHAR(100) NOT NULL,        -- 'National Highway', 'Railways / DFC', 'Port'
    sponsoring_ministry VARCHAR(255) NOT NULL,    -- 'Ministry of Road Transport & Highways'
    nodal_officer_name VARCHAR(150) NOT NULL,
    nodal_officer_email VARCHAR(150) UNIQUE NOT NULL,
    nodal_officer_mobile VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Infrastructure Projects Registered by PIA
CREATE TABLE pia_projects (
    project_id VARCHAR(100) PRIMARY KEY,         -- e.g., 'NHAI-LA-2025-UP04-0982'
    agency_id UUID REFERENCES pia_agencies(agency_id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    infrastructure_type VARCHAR(100) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    primary_district VARCHAR(100) NOT NULL,
    corridor_chainage VARCHAR(150) NOT NULL,
    estimated_cost_cr NUMERIC(15, 2) NOT NULL,
    total_land_required_ha NUMERIC(12, 4) NOT NULL,
    execution_timeline_months INT NOT NULL,
    estimated_pafs INT NOT NULL,
    public_purpose_text TEXT NOT NULL,
    current_workflow_stage VARCHAR(100) DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cadastral Land Schedules
CREATE TABLE land_schedules (
    schedule_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(100) REFERENCES pia_projects(project_id) ON DELETE CASCADE,
    revenue_village VARCHAR(150) NOT NULL,
    khasra_survey_numbers TEXT NOT NULL,
    extent_hectares NUMERIC(10, 4) NOT NULL,
    tenure_classification VARCHAR(100) NOT NULL,  -- 'Private Agriculture', 'Government Revenue', 'Forest Land'
    gis_polygon_geometry JSONB,                   -- GeoJSON coordinates
    statutory_status VARCHAR(100) DEFAULT 'Requisition Filed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Compensation & R&R Fund Requisitions
CREATE TABLE fund_requisitions (
    fund_req_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(100) REFERENCES pia_projects(project_id) ON DELETE CASCADE,
    market_value_cr NUMERIC(15, 2) NOT NULL,
    solatium_100pct_cr NUMERIC(15, 2) NOT NULL,
    rr_grants_cr NUMERIC(15, 2) NOT NULL,
    admin_expenses_cr NUMERIC(15, 2) NOT NULL,
    total_requested_cr NUMERIC(15, 2) NOT NULL,
    pfms_sanction_status VARCHAR(100) DEFAULT 'Pending Ministry Sanction',
    escrow_account_number VARCHAR(50),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Document Management System (DMS)
CREATE TABLE project_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id VARCHAR(100) REFERENCES pia_projects(project_id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    version_code VARCHAR(20) DEFAULT 'v1.0',
    sha256_checksum VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA (NHAI PIU Varanasi Demonstration Data)
-- ============================================================================
INSERT INTO pia_agencies (agency_code, agency_name, agency_category, sponsoring_ministry, nodal_officer_name, nodal_officer_email, nodal_officer_mobile)
VALUES ('NHAI_PIU_VNS', 'National Highways Authority of India - PIU Varanasi', 'National Highway', 'Ministry of Road Transport & Highways', 'Chief General Manager (Technical)', 'piu.varanasi@nhai.org', '+915422284100');

INSERT INTO pia_projects (project_id, agency_id, project_name, infrastructure_type, state_name, primary_district, corridor_chainage, estimated_cost_cr, total_land_required_ha, execution_timeline_months, estimated_pafs, public_purpose_text, current_workflow_stage)
SELECT agency_id, 'NHAI-LA-2025-UP04-0982', '6-Lane Varanasi-Ranchi-Kolkata Economic Corridor (Package IV)', 'National Highway', 'Uttar Pradesh', 'Varanasi / Chandauli', 'KM 120+000 to KM 184+500', 3450.00, 385.500, 36, 620, 'Direct industrial freight artery connecting mineral hubs to eastern maritime ports.', 'District Verification'
FROM pia_agencies WHERE agency_code = 'NHAI_PIU_VNS';