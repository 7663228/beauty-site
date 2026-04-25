-- =============================================
-- Supabase 数据库扩展函数
-- 这些函数需要在 Supabase SQL Editor 中运行
-- =============================================

-- 1. 增加图集观看次数函数
CREATE OR REPLACE FUNCTION increment_views(collection_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE photo_collections
  SET views_count = views_count + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 增加评论点赞数函数
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET like_count = like_count + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 增加下载次数函数
CREATE OR REPLACE FUNCTION increment_downloads(collection_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE photo_collections
  SET downloads_count = downloads_count + 1
  WHERE id = collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 增加用户评论数函数
CREATE OR REPLACE FUNCTION increment_user_comment_count(user_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET comment_count = comment_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 检查用户是否是有效VIP
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

-- 6. 检查用户是否可以下载某个图集
CREATE OR REPLACE FUNCTION fn_can_user_download(
    p_user_id INTEGER,
    p_collection_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    is_vip BOOLEAN;
    has_purchased BOOLEAN;
BEGIN
    -- 未登录用户不能下载
    IF p_user_id IS NULL THEN
        RETURN json_build_object('can_download', FALSE, 'reason', '请先登录');
    END IF;

    -- 检查是否是VIP
    SELECT fn_is_user_vip(p_user_id) INTO is_vip;
    IF is_vip THEN
        RETURN json_build_object('can_download', TRUE);
    END IF;

    -- 检查是否已购买单套
    SELECT EXISTS(
        SELECT 1 FROM single_purchases 
        WHERE user_id = p_user_id 
        AND collection_id = p_collection_id 
        AND payment_status = 'paid'
    ) INTO has_purchased;
    
    IF has_purchased THEN
        RETURN json_build_object('can_download', TRUE);
    END IF;

    RETURN json_build_object(
        'can_download', FALSE, 
        'reason', '此资源需要VIP会员或单独购买后下载'
    );
END;
$$ LANGUAGE plpgsql;

-- 7. 激活VIP会员
CREATE OR REPLACE FUNCTION fn_activate_vip(
    p_user_id INTEGER,
    p_package_id INTEGER
)
RETURNS JSON AS $$
DECLARE
    pkg RECORD;
    current_status RECORD;
    vip_start DATE;
    vip_end DATE;
    is_perm BOOLEAN := FALSE;
BEGIN
    -- 获取套餐信息
    SELECT * INTO pkg
    FROM vip_packages
    WHERE id = p_package_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'error', '套餐不存在或已下架');
    END IF;

    vip_start := CURRENT_DATE;

    -- 计算VIP结束日期
    IF pkg.level = 'permanent' THEN
        is_perm := TRUE;
        vip_end := NULL;
    ELSIF pkg.duration_days IS NOT NULL THEN
        vip_end := CURRENT_DATE + pkg.duration_days;
        
        -- 如果已有VIP且未过期，累加时间
        SELECT * INTO current_status
        FROM user_vip_status
        WHERE user_id = p_user_id;

        IF current_status IS NOT NULL AND NOT current_status.is_permanent AND current_status.vip_end_date >= CURRENT_DATE THEN
            vip_end := current_status.vip_end_date + pkg.duration_days;
        END IF;
    END IF;

    -- 更新或创建VIP状态
    INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
    VALUES (p_user_id, pkg.level, vip_start, vip_end, is_perm)
    ON CONFLICT (user_id) DO UPDATE SET
        vip_level = CASE 
            WHEN EXCLUDED.is_permanent = TRUE THEN 'permanent'
            WHEN pkg.level = 'permanent' THEN 'permanent'
            WHEN pkg.level = 'yearly' AND user_vip_status.vip_level IN ('monthly', 'quarterly') THEN 'yearly'
            WHEN pkg.level = 'quarterly' AND user_vip_status.vip_level = 'monthly' THEN 'quarterly'
            ELSE user_vip_status.vip_level
        END,
        vip_start_date = CASE 
            WHEN vip_start > user_vip_status.vip_start_date THEN vip_start
            ELSE user_vip_status.vip_start_date
        END,
        vip_end_date = CASE
            WHEN user_vip_status.is_permanent = TRUE THEN user_vip_status.vip_end_date
            ELSE vip_end
        END,
        is_permanent = user_vip_status.is_permanent OR EXCLUDED.is_permanent,
        updated_at = CURRENT_TIMESTAMP;

    -- 更新用户表
    UPDATE users SET
        user_level = CASE 
            WHEN is_perm THEN 'VIP'
            WHEN pkg.level IN ('yearly', 'quarterly') THEN 'VIP'
            ELSE user_level
        END,
        vip_expire_date = CASE 
            WHEN is_perm THEN NULL 
            ELSE vip_end 
        END,
        is_permanent_vip = is_perm OR is_permanent_vip
    WHERE id = p_user_id;

    RETURN json_build_object(
        'success', TRUE, 
        'vip_level', pkg.level,
        'start_date', vip_start,
        'end_date', vip_end,
        'is_permanent', is_perm
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Row Level Security (RLS) 策略
-- =============================================

-- 启用 RLS
-- ALTER TABLE celebrities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE photo_collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collection_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE download_resources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collection_views ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vip_packages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vip_orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_vip_status ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE single_purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vip_downloads ENABLE ROW LEVEL SECURITY;

-- 公开读取所有数据
-- CREATE POLICY "Allow public read" ON celebrities FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON photo_collections FOR SELECT USING (status = 'published');
-- CREATE POLICY "Allow public read" ON collection_images FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON download_resources FOR SELECT USING (is_active = true);
-- CREATE POLICY "Allow public read" ON comments FOR SELECT USING (is_deleted = false);
-- CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON collection_views FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON vip_packages FOR SELECT USING (is_active = true);
-- CREATE POLICY "Allow public read" ON vip_orders FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON user_vip_status FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON single_purchases FOR SELECT USING (true);

-- 允许认证用户插入评论
-- CREATE POLICY "Allow authenticated insert" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
