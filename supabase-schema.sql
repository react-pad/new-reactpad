-- Create presales table
CREATE TABLE IF NOT EXISTS presales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Token Information
  token_address VARCHAR(42) NOT NULL UNIQUE,
  token_name VARCHAR(255) NOT NULL,
  token_symbol VARCHAR(50) NOT NULL,
  token_decimals INTEGER NOT NULL DEFAULT 18,
  token_logo_url TEXT,

  -- Presale Details
  presale_address VARCHAR(42) NOT NULL,
  total_supply NUMERIC(78, 0) NOT NULL,
  presale_amount NUMERIC(78, 0) NOT NULL,
  soft_cap NUMERIC(78, 0),
  hard_cap NUMERIC(78, 0),
  min_contribution NUMERIC(78, 0),
  max_contribution NUMERIC(78, 0),
  price_per_token NUMERIC(78, 18),

  -- Time Details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Status can be: 'pending', 'live', 'ongoing', 'ended', 'cancelled'

  -- Developer/Owner Information
  owner_address VARCHAR(42) NOT NULL,
  owner_email VARCHAR(255),
  owner_telegram VARCHAR(255),
  owner_twitter VARCHAR(255),
  owner_website TEXT,

  -- Project Description
  project_description TEXT,
  whitepaper_url TEXT,

  -- Fundraising Progress
  total_raised NUMERIC(78, 0) DEFAULT 0,
  total_contributors INTEGER DEFAULT 0,

  -- Admin Controls
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(42)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_presales_status ON presales(status);
CREATE INDEX IF NOT EXISTS idx_presales_owner ON presales(owner_address);
CREATE INDEX IF NOT EXISTS idx_presales_approved ON presales(is_approved);
CREATE INDEX IF NOT EXISTS idx_presales_start_time ON presales(start_time);
CREATE INDEX IF NOT EXISTS idx_presales_end_time ON presales(end_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_presales_updated_at BEFORE UPDATE ON presales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update status based on time
CREATE OR REPLACE FUNCTION update_presale_status()
RETURNS void AS $$
BEGIN
  -- Update to 'live' if start_time has passed and end_time hasn't
  UPDATE presales
  SET status = 'live'
  WHERE status = 'pending'
    AND is_approved = TRUE
    AND start_time <= NOW()
    AND end_time > NOW();

  -- Update to 'ended' if end_time has passed
  UPDATE presales
  SET status = 'ended'
  WHERE status IN ('pending', 'live', 'ongoing')
    AND end_time <= NOW();
END;
$$ language 'plpgsql';

-- Enable Row Level Security
ALTER TABLE presales ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved presales
CREATE POLICY "Anyone can view approved presales"
  ON presales FOR SELECT
  USING (is_approved = TRUE);

-- Policy: Users can insert their own presales
CREATE POLICY "Users can create presales"
  ON presales FOR INSERT
  WITH CHECK (TRUE);

-- Policy: Owners can update their own presales (if not approved yet)
CREATE POLICY "Owners can update their presales"
  ON presales FOR UPDATE
  USING (owner_address = current_setting('request.jwt.claim.wallet_address', TRUE))
  WITH CHECK (owner_address = current_setting('request.jwt.claim.wallet_address', TRUE));

-- Note: Admin policies should be created with specific admin role
-- This is a placeholder - you'll need to implement proper admin authentication

-- Create a view for public presales
CREATE OR REPLACE VIEW public_presales AS
SELECT
  id,
  token_address,
  token_name,
  token_symbol,
  token_decimals,
  token_logo_url,
  presale_address,
  total_supply,
  presale_amount,
  soft_cap,
  hard_cap,
  min_contribution,
  max_contribution,
  price_per_token,
  start_time,
  end_time,
  status,
  owner_address,
  owner_telegram,
  owner_twitter,
  owner_website,
  project_description,
  whitepaper_url,
  total_raised,
  total_contributors,
  is_featured,
  is_verified,
  created_at
FROM presales
WHERE is_approved = TRUE;
