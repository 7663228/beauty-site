-- 余额记录表
CREATE TABLE IF NOT EXISTS balance_records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- recharge: 充值, spend: 消费, refund: 退款
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) DEFAULT 0,
  balance_after DECIMAL(10, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_balance_records_user_id ON balance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_records_created_at ON balance_records(created_at DESC);

-- 积分记录表
CREATE TABLE IF NOT EXISTS points_records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- bonus: 获得, spend: 消费, refund: 退回
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_records_user_id ON points_records(user_id);
CREATE INDEX IF NOT EXISTS idx_points_records_created_at ON points_records(created_at DESC);

-- 为 users 表添加 balance 和 points 字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'balance') THEN
    ALTER TABLE users ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points') THEN
    ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
  END IF;
END $$;
