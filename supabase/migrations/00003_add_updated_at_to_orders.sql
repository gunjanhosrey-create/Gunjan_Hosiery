-- Add updated_at to orders table
ALTER TABLE orders
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure updated_at is set automatically on updates (optional trigger)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_trigger ON orders;
CREATE TRIGGER set_updated_at_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
