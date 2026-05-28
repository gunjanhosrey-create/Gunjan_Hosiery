-- Insert initial categories (with images)
INSERT INTO categories (name, slug, description, image_url, display_order) VALUES
('Men', 'men', 'Fashion for men', '/images/categories/men.jpg', 1),
('Kids', 'kids', 'Fashion for kids', '/images/categories/kids.jpg', 2),
('Boys', 'boys', 'Fashion for boys', '/images/categories/boys.jpg', 3),
('Girls', 'girls', 'Fashion for girls', '/images/categories/girls.jpg', 4),
('Thermal', 'thermal', 'Thermal wear', '/images/categories/thermal.jpg', 5)
ON CONFLICT (slug) DO NOTHING;