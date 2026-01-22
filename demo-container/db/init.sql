-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  expanded BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id VARCHAR(255) PRIMARY KEY,
  category_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  open_mode VARCHAR(10) DEFAULT 'app' CHECK (open_mode IN ('app', 'tab')),
  iframe_compatible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create index for category_id
CREATE INDEX IF NOT EXISTS idx_category_id ON links(category_id);

-- Insert initial categories and links (using INSERT ... ON CONFLICT for PostgreSQL)
INSERT INTO categories (id, name, expanded, sort_order) VALUES
  ('1', 'Analytics', true, 1),
  ('2', 'Partner Tools', false, 2),
  ('3', 'Internal Apps', false, 3)
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO links (id, category_id, name, url, open_mode, iframe_compatible, sort_order) VALUES
  ('1a', '1', 'Dashboard', 'https://example.com/dashboard', 'app', true, 1),
  ('1b', '1', 'Reports', 'https://example.com/reports', 'app', true, 2),
  ('2a', '2', 'White Label Portal', 'https://partner.example.com', 'app', true, 1),
  ('3a', '3', 'CRM', 'https://crm.example.com', 'tab', false, 1),
  ('3b', '3', 'Inventory', 'https://inventory.example.com', 'app', true, 2)
ON CONFLICT (id) DO UPDATE SET 
  name=EXCLUDED.name, 
  url=EXCLUDED.url, 
  open_mode=EXCLUDED.open_mode, 
  iframe_compatible=EXCLUDED.iframe_compatible;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
