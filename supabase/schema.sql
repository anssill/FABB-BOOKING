-- ============================================================
-- fabb.booking — Supabase Database Schema
-- Run this ENTIRE file in Supabase SQL Editor
-- Project: Ansil Dress House | ansilav78@gmail.com
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS / STAFF ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner','manager','counter','wash')),
  whatsapp    TEXT,
  avatar_url  TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN NEW.email = 'ansilav78@gmail.com' THEN 'owner' ELSE 'staff' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── SETTINGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biz_name        TEXT DEFAULT 'Ansil Dress House',
  phone           TEXT DEFAULT '+91 99999 00000',
  whatsapp        TEXT DEFAULT '+919999900000',
  email           TEXT DEFAULT 'ansilav78@gmail.com',
  address         TEXT DEFAULT 'Main Bazaar, Palakkad',
  city            TEXT DEFAULT 'Palakkad',
  state           TEXT DEFAULT 'Kerala',
  pincode         TEXT DEFAULT '678001',
  gst             TEXT DEFAULT '',
  currency        TEXT DEFAULT 'INR',
  penalty_rate    INTEGER DEFAULT 50,
  deposit_pct     INTEGER DEFAULT 20,
  tax_rate        NUMERIC(5,2) DEFAULT 0,
  invoice_prefix  TEXT DEFAULT 'INV',
  quote_prefix    TEXT DEFAULT 'QUO',
  contract_text   TEXT DEFAULT '1. Items must be returned in clean condition.
2. Damage to items will be charged separately.
3. Security deposit refunded on return of items in good condition.
4. Late returns attract a penalty of ₹50 per day per item.
5. Any alterations must be approved in writing.',
  staff_names     TEXT[] DEFAULT ARRAY['Seema','Ravi','Mohan'],
  upi_id          TEXT DEFAULT '',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings DEFAULT VALUES ON CONFLICT DO NOTHING;

-- ─── INVENTORY ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Sherwani',
  sku         TEXT,
  qty         INTEGER NOT NULL DEFAULT 1,
  available   INTEGER NOT NULL DEFAULT 1,
  daily_rate  NUMERIC(10,2) NOT NULL DEFAULT 0,
  deposit     NUMERIC(10,2) DEFAULT 0,
  description TEXT,
  sizes       TEXT,
  alt_notes   TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','archived')),
  photos      TEXT[] DEFAULT '{}',
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sample inventory data
INSERT INTO items (name, category, sku, qty, available, daily_rate, deposit, description, sizes, alt_notes) VALUES
  ('Sherwani - Royal Blue',   'Sherwani',    'SH-001', 5, 4, 500,  2000, 'Embroidered royal blue sherwani',        'S,M,L,XL,XXL', ''),
  ('Achkan - Cream White',    'Achkan',      'AK-002', 4, 3, 450,  1500, 'Ivory cream achkan with churidar',       'S,M,L,XL',     ''),
  ('3-Piece Suit - Black',    'Suit',        'SU-003', 8, 6, 400,  1200, 'Classic black 3-piece formal suit',      '36,38,40,42,44',''),
  ('Designer Kurtha Set',     'Kurtha',      'KU-004',10, 8, 200,   600, 'Cotton designer kurtha pyjama set',      'S,M,L,XL,XXL', ''),
  ('Loafer Shoes - Brown',    'Loafer',      'LF-005', 6, 5, 150,   400, 'Formal brown loafer shoes',              '7,8,9,10,11',  ''),
  ('Indo-Western Jacket',     'Indo-Western','IW-006', 4, 3, 350,  1000, 'Fusion indo-western jacket set',         'S,M,L,XL',     ''),
  ('Bridal Lehenga - Red',    'Bridal',      'BR-007', 3, 2, 800,  3000, 'Heavy bridal lehenga choli dupatta',     'S,M,L',        'Delicate embroidery - handle with care'),
  ('Kids Sherwa Set',         'Kids Wear',   'KD-008', 6, 5, 150,   400, 'Kids festive sherwa pyjama 3-12 yrs',   '3Y,5Y,7Y,9Y',  '')
ON CONFLICT DO NOTHING;

-- ─── CUSTOMERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  phone2       TEXT,
  phone2_type  TEXT DEFAULT 'WhatsApp',
  phone3       TEXT,
  phone3_type  TEXT DEFAULT 'Email',
  email        TEXT,
  company      TEXT,
  address      TEXT,
  city         TEXT DEFAULT 'Palakkad',
  state        TEXT DEFAULT 'Kerala',
  pincode      TEXT,
  id_type      TEXT,
  id_number    TEXT,
  id_expiry    DATE,
  id_photo_url TEXT,
  notes        TEXT,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO customers (name, phone, phone2, phone2_type, email, city, id_type, id_number) VALUES
  ('Rahul Sharma', '+91 98200 11111', '+91 91234 22222', 'WhatsApp', 'rahul@example.com', 'Palakkad', 'Aadhaar Card', '4321 8765 1234'),
  ('Arun Kumar',   '+91 99887 33333', '',               'Email',     'arun@gmail.com',   'Palakkad', 'Voter ID',     'KL/09/345/678'),
  ('Priya Nair',   '+91 97600 44444', '+91 97600 44445', 'WhatsApp', 'priya@nair.com',   'Thrissur', 'Passport',     'J1234567'),
  ('Suresh Pillai','+91 96500 55555', '',               'WhatsApp',  '',                 'Palakkad', 'Driver License','KL0120210045')
ON CONFLICT DO NOTHING;

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT UNIQUE NOT NULL,
  type            TEXT NOT NULL DEFAULT 'order' CHECK (type IN ('order','quote','reservation')),
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('concept','reserved','active','returned','cancelled')),
  subtotal        NUMERIC(10,2) DEFAULT 0,
  discount        NUMERIC(10,2) DEFAULT 0,
  discount_type   TEXT DEFAULT 'flat' CHECK (discount_type IN ('flat','pct')),
  penalty         NUMERIC(10,2) DEFAULT 0,
  penalty_paid    BOOLEAN DEFAULT false,
  tax_amount      NUMERIC(10,2) DEFAULT 0,
  total           NUMERIC(10,2) DEFAULT 0,
  paid_amount     NUMERIC(10,2) DEFAULT 0,
  deposit         NUMERIC(10,2) DEFAULT 0,
  deposit_method  TEXT,
  deposit_paid    BOOLEAN DEFAULT false,
  deposit_ref     TEXT,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Order line items
CREATE TABLE IF NOT EXISTS order_lines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id     UUID REFERENCES items(id) ON DELETE SET NULL,
  item_name   TEXT NOT NULL,
  qty         INTEGER NOT NULL DEFAULT 1,
  days        INTEGER NOT NULL DEFAULT 1,
  daily_rate  NUMERIC(10,2) NOT NULL,
  subtotal    NUMERIC(10,2) NOT NULL,
  alt_note    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WASHING TRACKER ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wash_entries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID REFERENCES orders(id) ON DELETE SET NULL,
  item_id       UUID REFERENCES items(id) ON DELETE SET NULL,
  item_name     TEXT NOT NULL,
  customer_name TEXT,
  returned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  stage         TEXT NOT NULL DEFAULT 'Pending Wash'
                CHECK (stage IN ('Pending Wash','Washing','Drying','Ironing','Ready','In Stock')),
  staff         TEXT,
  notes         TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WHATSAPP MESSAGE LOG ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id   UUID REFERENCES customers(id),
  order_id      UUID REFERENCES orders(id),
  phone         TEXT NOT NULL,
  message_type  TEXT NOT NULL,
  message_text  TEXT NOT NULL,
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  sent_by       UUID REFERENCES profiles(id)
);

-- ─── AUTO-UPDATE TIMESTAMPS ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_items_updated_at    BEFORE UPDATE ON items    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_wash_updated_at     BEFORE UPDATE ON wash_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE wash_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read everything
CREATE POLICY "auth_read_all" ON items        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON customers    FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON orders       FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON order_lines  FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON wash_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON settings     FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all" ON whatsapp_log FOR SELECT TO authenticated USING (true);

-- Profiles: users can read all, update own
CREATE POLICY "read_profiles"   ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Owner/Manager can write everything
CREATE POLICY "owner_write_items"    ON items        FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager'))
);
CREATE POLICY "owner_write_customers" ON customers   FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','counter'))
);
CREATE POLICY "owner_write_orders"   ON orders       FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','counter'))
);
CREATE POLICY "owner_write_lines"    ON order_lines  FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','counter'))
);
CREATE POLICY "wash_write"           ON wash_entries FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','wash'))
);
CREATE POLICY "owner_write_settings" ON settings     FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "owner_write_log"      ON whatsapp_log FOR INSERT TO authenticated WITH CHECK (true);

-- ─── INDEXES FOR PERFORMANCE ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_customer    ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_start       ON orders(start_date);
CREATE INDEX IF NOT EXISTS idx_order_lines_order  ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_wash_stage         ON wash_entries(stage);
CREATE INDEX IF NOT EXISTS idx_customers_phone    ON customers(phone);

-- ─── VIEWS ───────────────────────────────────────────────────
CREATE OR REPLACE VIEW orders_with_customer AS
SELECT
  o.*,
  c.name        AS customer_name,
  c.phone       AS customer_phone,
  c.phone2      AS customer_phone2,
  c.phone2_type AS customer_phone2_type,
  c.company     AS customer_company,
  c.city        AS customer_city,
  c.id_type     AS customer_id_type,
  c.id_number   AS customer_id_number,
  c.id_photo_url AS customer_id_photo
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- Done! Schema created successfully.
SELECT 'fabb.booking schema installed ✓' AS status;
