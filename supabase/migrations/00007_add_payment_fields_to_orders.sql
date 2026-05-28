-- Add payment_status and transaction_id columns to orders table
ALTER TABLE orders
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN transaction_id TEXT;