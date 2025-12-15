-- Create launchpad_presales table
CREATE TABLE IF NOT EXISTS launchpad_presales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Smart Contract Addresses
  presale_address VARCHAR(42) NOT NULL UNIQUE,
  sale_token_address VARCHAR(42) NOT NULL,
  payment_token_address VARCHAR(42),

  -- Token Information
  token_name VARCHAR(255) NOT NULL,
  token_symbol VARCHAR(50) NOT NULL,
  token_decimals INTEGER NOT NULL DEFAULT 18,
  token_logo_url TEXT,

  -- Presale Configuration
  rate NUMERIC(78, 0) NOT NULL, -- Tokens per payment token (scaled by 100)
  soft_cap NUMERIC(78, 0) NOT NULL,
  hard_cap NUMERIC(78, 0) NOT NULL,
  min_contribution NUMERIC(78, 0) NOT NULL,
  max_contribution NUMERIC(78, 0) NOT NULL,

  -- Time Details
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,

  -- Owner/Creator Information
  owner_address VARCHAR(42) NOT NULL,

  -- Fundraising Progress (updated periodically from blockchain)
  total_raised NUMERIC(78, 0) DEFAULT 0,
  tokens_sold NUMERIC(78, 0) DEFAULT 0,
  total_contributors INTEGER DEFAULT 0,

  -- Project Details (optional, can be added later by owner)
  project_name VARCHAR(255),
  project_description TEXT,
  project_website TEXT,
  project_twitter TEXT,
  project_telegram TEXT,
  project_discord TEXT,
  whitepaper_url TEXT,

  -- Status and Visibility
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- Status can be: 'pending' (waiting to start), 'live' (active), 'ended' (completed), 'cancelled'
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Blockchain Transaction Info
  creation_tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure addresses are lowercase
  CONSTRAINT lowercase_presale_address CHECK (presale_address = LOWER(presale_address)),
  CONSTRAINT lowercase_sale_token CHECK (sale_token_address = LOWER(sale_token_address)),
  CONSTRAINT lowercase_owner CHECK (owner_address = LOWER(owner_address))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_launchpad_presales_status ON launchpad_presales(status);
CREATE INDEX IF NOT EXISTS idx_launchpad_presales_owner ON launchpad_presales(owner_address);
CREATE INDEX IF NOT EXISTS idx_launchpad_presales_token ON launchpad_presales(sale_token_address);
CREATE INDEX IF NOT EXISTS idx_launchpad_presales_start_time ON launchpad_presales(start_time);
CREATE INDEX IF NOT EXISTS idx_launchpad_presales_end_time ON launchpad_presales(end_time);
CREATE INDEX IF NOT EXISTS idx_launchpad_presales_featured ON launchpad_presales(is_featured);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_launchpad_presales_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_launchpad_presales_updated_at
  BEFORE UPDATE ON launchpad_presales
  FOR EACH ROW
  EXECUTE FUNCTION update_launchpad_presales_timestamp();

-- Create function to automatically update status based on time
CREATE OR REPLACE FUNCTION update_launchpad_presale_status()
RETURNS void AS $$
BEGIN
  -- Update to 'live' if start_time has passed and end_time hasn't
  UPDATE launchpad_presales
  SET status = 'live'
  WHERE status = 'pending'
    AND start_time <= NOW()
    AND end_time > NOW();

  -- Update to 'ended' if end_time has passed
  UPDATE launchpad_presales
  SET status = 'ended'
  WHERE status IN ('pending', 'live')
    AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE launchpad_presales ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all presales (read-only for public)
CREATE POLICY "Anyone can view presales"
  ON launchpad_presales FOR SELECT
  USING (TRUE);

-- Policy: Anyone can insert presales (permissionless launchpad)
CREATE POLICY "Anyone can create presales"
  ON launchpad_presales FOR INSERT
  WITH CHECK (TRUE);

-- Policy: Owners can update their own presales (only certain fields)
CREATE POLICY "Owners can update their presales"
  ON launchpad_presales FOR UPDATE
  USING (owner_address = current_setting('request.jwt.claim.wallet_address', TRUE))
  WITH CHECK (owner_address = current_setting('request.jwt.claim.wallet_address', TRUE));

-- Create a view for active presales (live or upcoming)
CREATE OR REPLACE VIEW active_presales AS
SELECT
  id,
  presale_address,
  sale_token_address,
  payment_token_address,
  token_name,
  token_symbol,
  token_decimals,
  token_logo_url,
  rate,
  soft_cap,
  hard_cap,
  min_contribution,
  max_contribution,
  start_time,
  end_time,
  owner_address,
  total_raised,
  tokens_sold,
  total_contributors,
  project_name,
  project_description,
  project_website,
  project_twitter,
  project_telegram,
  project_discord,
  whitepaper_url,
  status,
  is_verified,
  is_featured,
  created_at
FROM launchpad_presales
WHERE status IN ('pending', 'live')
ORDER BY
  CASE
    WHEN status = 'live' THEN 1
    WHEN status = 'pending' THEN 2
  END,
  is_featured DESC,
  start_time ASC;

-- Comment on table and important columns
COMMENT ON TABLE launchpad_presales IS 'Stores all presale launches created through the launchpad platform';
COMMENT ON COLUMN launchpad_presales.rate IS 'Number of tokens per payment token, scaled by 100';
COMMENT ON COLUMN launchpad_presales.status IS 'Current status: pending, live, ended, or cancelled';
