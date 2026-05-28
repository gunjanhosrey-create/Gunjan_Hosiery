INSERT INTO categories (name, slug, description, image_url, display_order)
VALUES ('Women', 'women', 'Fashion for women', NULL, 2)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;
