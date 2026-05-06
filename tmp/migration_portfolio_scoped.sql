-- Migration: Portfolio-Scoped Segmentation
-- Adds portfolioId to segments & journeys, autoSegmentOnUpload to tenants

-- 1. Add auto_segment_on_upload flag to tenants (default false = no auto-trigger)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS auto_segment_on_upload boolean DEFAULT false;

-- 2. Add portfolio_id to segments (nullable for backward compat with tenant-wide segments)
ALTER TABLE segments ADD COLUMN IF NOT EXISTS portfolio_id uuid REFERENCES portfolios(id);
CREATE INDEX IF NOT EXISTS segments_tenant_portfolio_idx ON segments(tenant_id, portfolio_id);

-- 3. Add portfolio_id to journeys (nullable for backward compat)
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS portfolio_id uuid REFERENCES portfolios(id);
CREATE INDEX IF NOT EXISTS journeys_tenant_portfolio_idx ON journeys(tenant_id, portfolio_id);
