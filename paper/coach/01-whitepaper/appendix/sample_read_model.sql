CREATE TABLE IF NOT EXISTS rm_subscription_funnel (
  tenant_id TEXT NOT NULL,
  funnel_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  source_channel TEXT NOT NULL,
  share_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  subscribe_count INTEGER NOT NULL DEFAULT 0,
  booking_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, funnel_id)
);

CREATE TABLE IF NOT EXISTS rm_support_team (
  tenant_id TEXT NOT NULL,
  team_member_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  location_scope JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, team_member_id)
);
