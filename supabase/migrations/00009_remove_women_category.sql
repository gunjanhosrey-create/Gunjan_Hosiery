-- Remove Women category from initial data if present
DELETE FROM categories WHERE slug = 'women';
