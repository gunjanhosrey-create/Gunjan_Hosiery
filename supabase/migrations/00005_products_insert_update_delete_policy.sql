-- Products table: allow INSERT, UPDATE, DELETE (admin/create product flow)
-- RLS blocks these by default - add policies so product creation works

CREATE POLICY "Public insert products"
ON products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update products"
ON products FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public delete products"
ON products FOR DELETE
USING (true);
