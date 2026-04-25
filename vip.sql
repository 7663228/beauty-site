-- =============================================
-- VIP会员系统数据库扩展
-- 包含VIP套餐、订单、用户VIP状态等
-- =============================================

-- =============================================
-- 1. VIP套餐表 (vip_packages)
-- =============================================
CREATE TABLE IF NOT EXISTS vip_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,                      -- 套餐名称：一个月VIP、三个月VIP、一年VIP、永久VIP
    level VARCHAR(20) NOT NULL,                     -- 等级：monthly、quarterly、yearly、permanent
    price DECIMAL(10, 2) NOT NULL,                 -- 价格
    original_price DECIMAL(10, 2),                 -- 原价（用于显示折扣）
    duration_days INTEGER,                          -- 有效期天数（NULL表示永久）
    description TEXT,                               -- 套餐描述
    features JSONB,                                 -- 功能特性列表
    sort_order INTEGER DEFAULT 0,                   -- 排序
    is_active BOOLEAN DEFAULT TRUE,                 -- 是否启用
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE vip_packages IS 'VIP套餐表 - 存储VIP会员套餐信息';

-- =============================================
-- 2. VIP订单表 (vip_orders)
-- =============================================
CREATE TABLE IF NOT EXISTS vip_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL UNIQUE,           -- 订单号
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- 关联用户
    package_id INTEGER REFERENCES vip_packages(id), -- 关联套餐
    
    amount DECIMAL(10, 2) NOT NULL,                 -- 支付金额
    payment_method VARCHAR(20),                    -- 支付方式：alipay、wechat、card
    payment_status VARCHAR(20) DEFAULT 'pending',  -- 支付状态：pending、paid、cancelled、refunded
    transaction_id VARCHAR(100),                   -- 第三方交易号
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,                              -- 支付时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE vip_orders IS 'VIP订单表 - 存储VIP购买订单';

-- =============================================
-- 3. 用户VIP状态表 (user_vip_status)
-- =============================================
CREATE TABLE IF NOT EXISTS user_vip_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    vip_level VARCHAR(20),                         -- VIP等级：monthly、quarterly、yearly、permanent、svip
    vip_start_date DATE,                           -- VIP开始日期
    vip_end_date DATE,                             -- VIP结束日期（NULL表示永久）
    is_permanent BOOLEAN DEFAULT FALSE,             -- 是否永久VIP
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE user_vip_status IS '用户VIP状态表 - 存储用户的VIP状态';

-- =============================================
-- 4. 单套购买记录表 (single_purchases)
-- 记录用户购买的单套图集
-- =============================================
CREATE TABLE IF NOT EXISTS single_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    
    amount DECIMAL(10, 2) NOT NULL,                 -- 购买金额
    payment_status VARCHAR(20) DEFAULT 'paid',    -- 支付状态
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, collection_id)                  -- 防止重复购买
);

COMMENT ON TABLE single_purchases IS '单套购买记录表 - 记录用户购买的单套图集';

-- =============================================
-- 5. VIP专属下载记录表 (vip_downloads)
-- 记录VIP用户的下载操作
-- =============================================
CREATE TABLE IF NOT EXISTS vip_downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    collection_id INTEGER REFERENCES photo_collections(id) ON DELETE CASCADE,
    resource_id INTEGER REFERENCES download_resources(id) ON DELETE CASCADE,
    
    ip_address VARCHAR(50),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE vip_downloads IS 'VIP专属下载记录表 - 记录VIP用户的下载操作';

-- =============================================
-- 索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_user ON vip_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON vip_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_vip_status_user ON user_vip_status(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_status_end ON user_vip_status(vip_end_date);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON single_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_collection ON single_purchases(collection_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON vip_downloads(user_id);

-- =============================================
-- 插入默认VIP套餐
-- =============================================
INSERT INTO vip_packages (name, level, price, original_price, duration_days, description, features, sort_order) VALUES
('一个月VIP', 'monthly', 19.90, 29.90, 30, '开通即享全站资源免费下载', '["全站资源免费下载", "优先客服支持", "专属下载通道"]', 1),
('三个月VIP', 'quarterly', 49.90, 79.90, 90, '三个月VIP，特惠打包', '["全站资源免费下载", "优先客服支持", "专属下载通道", "每月赠送10次极速下载"]', 2),
('一年VIP', 'yearly', 159.90, 299.90, 365, '一年VIP，性价比最高', '["全站资源免费下载", "优先客服支持", "专属下载通道", "无限极速下载", "优先获取新资源"]', 3),
('永久VIP', 'permanent', 298.00, 398.00, NULL, '永久VIP，尊享全站特权', '["全站资源免费下载", "7x24小时客服支持", "专属极速下载通道", "无限极速下载", "优先获取新资源", "专属会员群", "专属定制服务"]', 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- 更新用户表，添加VIP相关字段（可选，保留与vip_status表同步）
-- =============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expire_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_permanent_vip BOOLEAN DEFAULT FALSE;

-- =============================================
-- 创建函数：检查用户是否是有效VIP
-- =============================================
CREATE OR REPLACE FUNCTION fn_is_user_vip(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    vip_record RECORD;
BEGIN
    -- 检查是否是永久VIP
    SELECT * INTO vip_record
    FROM user_vip_status
    WHERE user_id = p_user_id AND is_permanent = TRUE;
    
    IF FOUND THEN
        RETURN TRUE;
    END IF;
    
    -- 检查VIP是否在有效期内
    SELECT * INTO vip_record
    FROM user_vip_status
    WHERE user_id = p_user_id 
    AND vip_end_date >= CURRENT_DATE;
    
    IF FOUND THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_is_user_vip IS '检查用户是否是有效VIP';
