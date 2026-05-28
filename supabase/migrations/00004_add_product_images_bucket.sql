-- Create product_images storage bucket (same name as code)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product_images
CREATE POLICY "Public read product_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product_images');

CREATE POLICY "Public upload product_images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product_images');
