-- Migration: Add auth_id and email columns to users table
-- This column stores the Supabase Auth UUID for each user

-- Add auth_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id VARCHAR(255) UNIQUE;

-- Add email column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comment
COMMENT ON COLUMN users.auth_id IS 'Supabase Auth UUID，用于关联认证用户';
COMMENT ON COLUMN users.email IS '用户邮箱地址';
