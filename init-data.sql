-- =============================================
-- 完整数据库初始化脚本
-- 包含所有表结构和测试数据
-- 用于 Supabase SQL Editor 中执行
-- =============================================

-- =============================================
-- 1. 用户表 (users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    avatar_url VARCHAR(500),
    user_level VARCHAR(20) DEFAULT '普通用户',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    comment_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    vip_expire_date DATE,
    is_permanent_vip BOOLEAN DEFAULT FALSE
);

-- =============================================
-- 2. 人物表 (celebrities)
-- =============================================
CREATE TABLE IF NOT EXISTS celebrities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    alias VARCHAR(200),
    category VARCHAR(100),
    avatar_url VARCHAR(500),
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    total_collections INTEGER DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. 图集表 (photo_collections)
-- =============================================
CREATE TABLE IF NOT EXISTS photo_collections (
    id SERIAL PRIMARY KEY,
    celebrity_id INTEGER NOT NULL REFERENCES celebrities(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500),
    type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'full')),
    preview_image_count INTEGER DEFAULT 3,
    source_no VARCHAR(50),
    thumbnail_url VARCHAR(500),
    image_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    file_size VARCHAR(50),
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    publish_date DATE,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. 图集预览图片表 (collection_images)
-- =============================================
CREATE TABLE IF NOT EXISTS collection_images (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    thumbnail_url VARCHAR(500),
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. 下载资源表 (download_resources)
-- =============================================
CREATE TABLE IF NOT EXISTS download_resources (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    resource_name VARCHAR(200),
    baidu_link VARCHAR(500) NOT NULL,
    extract_code VARCHAR(20) NOT NULL,
    password VARCHAR(50),
    file_type VARCHAR(20) DEFAULT 'image',
    file_size VARCHAR(50),
    downloads_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. 评论表 (comments)
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    root_id INTEGER,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. 观看记录表 (collection_views)
-- =============================================
CREATE TABLE IF NOT EXISTS collection_views (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. VIP套餐表 (vip_packages)
-- =============================================
CREATE TABLE IF NOT EXISTS vip_packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    duration_days INTEGER,
    description TEXT,
    features JSONB,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. VIP订单表 (vip_orders)
-- =============================================
CREATE TABLE IF NOT EXISTS vip_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    package_id INTEGER REFERENCES vip_packages(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 10. 用户VIP状态表 (user_vip_status)
-- =============================================
CREATE TABLE IF NOT EXISTS user_vip_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    vip_level VARCHAR(20),
    vip_start_date DATE,
    vip_end_date DATE,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 11. 单套购买记录表 (single_purchases)
-- =============================================
CREATE TABLE IF NOT EXISTS single_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, collection_id)
);

-- =============================================
-- 12. VIP下载记录表 (vip_downloads)
-- =============================================
CREATE TABLE IF NOT EXISTS vip_downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    collection_id INTEGER REFERENCES photo_collections(id) ON DELETE CASCADE,
    resource_id INTEGER REFERENCES download_resources(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 创建索引
-- =============================================
CREATE INDEX IF NOT EXISTS idx_celebrities_name ON celebrities(name);
CREATE INDEX IF NOT EXISTS idx_celebrities_category ON celebrities(category);
CREATE INDEX IF NOT EXISTS idx_celebrities_popularity ON celebrities(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_collections_celebrity ON photo_collections(celebrity_id);
CREATE INDEX IF NOT EXISTS idx_collections_type ON photo_collections(type);
CREATE INDEX IF NOT EXISTS idx_collections_views ON photo_collections(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_collections_publish_date ON photo_collections(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_images_collection ON collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_resources_collection ON download_resources(collection_id);
CREATE INDEX IF NOT EXISTS idx_comments_collection ON comments(collection_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON vip_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_status_user ON user_vip_status(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON single_purchases(user_id);

-- =============================================
-- 插入测试用户数据（覆盖所有用户等级）
-- =============================================
INSERT INTO users (username, avatar_url, user_level, comment_count, total_views, vip_expire_date, is_permanent_vip) VALUES
-- 普通用户
('normal_user1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=normal1', '普通用户', 5, 50, NULL, FALSE),
('normal_user2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=normal2', '普通用户', 12, 120, NULL, FALSE),
('normal_user3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=normal3', '普通用户', 3, 30, NULL, FALSE),
-- VIP用户（一个月）
('vip_monthly1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipmonth1', 'VIP', 25, 500, CURRENT_DATE + INTERVAL '15 days', FALSE),
('vip_monthly2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipmonth2', 'VIP', 45, 890, CURRENT_DATE + INTERVAL '20 days', FALSE),
-- VIP用户（三个月）
('vip_quarterly1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipquarter1', 'VIP', 68, 1200, CURRENT_DATE + INTERVAL '60 days', FALSE),
('vip_quarterly2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipquarter2', 'VIP', 92, 1500, CURRENT_DATE + INTERVAL '75 days', FALSE),
-- VIP用户（一年）
('vip_yearly1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipyear1', 'VIP', 156, 3200, CURRENT_DATE + INTERVAL '300 days', FALSE),
('vip_yearly2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipyear2', 'VIP', 234, 4500, CURRENT_DATE + INTERVAL '280 days', FALSE),
-- 永久VIP用户
('vip_permanent1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipperm1', 'VIP', 456, 12000, NULL, TRUE),
('vip_permanent2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vipperm2', 'VIP', 789, 25000, NULL, TRUE),
-- SVIP用户
('svip_user1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=svip1', 'SVIP', 1024, 50000, NULL, TRUE),
-- 管理员
('admin_master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1', '管理员', 2345, 100000, NULL, TRUE),
-- 版主
('moderator_01', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod1', '版主', 567, 15000, NULL, FALSE),
('moderator_02', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod2', '版主', 890, 22000, NULL, FALSE)
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 插入VIP套餐数据
-- =============================================
INSERT INTO vip_packages (name, level, price, original_price, duration_days, description, features, sort_order) VALUES
('一个月VIP', 'monthly', 19.90, 29.90, 30, '开通即享全站资源免费下载', '["全站资源免费下载", "优先客服支持", "专属下载通道"]', 1),
('三个月VIP', 'quarterly', 49.90, 79.90, 90, '三个月VIP，特惠打包', '["全站资源免费下载", "优先客服支持", "专属下载通道", "每月赠送10次极速下载"]', 2),
('一年VIP', 'yearly', 159.90, 299.90, 365, '一年VIP，性价比最高', '["全站资源免费下载", "优先客服支持", "专属下载通道", "无限极速下载", "优先获取新资源"]', 3),
('永久VIP', 'permanent', 298.00, 398.00, NULL, '永久VIP，尊享全站特权', '["全站资源免费下载", "7x24小时客服支持", "专属极速下载通道", "无限极速下载", "优先获取新资源", "专属会员群", "专属定制服务"]', 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- 插入人物数据（覆盖多个摄影机构分类）
-- =============================================
INSERT INTO celebrities (name, alias, category, avatar_url, description, is_verified, total_collections, total_views, popularity_score) VALUES
-- Xiuren秀人网
('金允希Yuki', '金允希|Yuki Kim', 'Xiuren秀人网', 'https://picsum.photos/200/200?random=1', '金允希Yuki最新写真作品，柔美的光线与精致的妆容完美结合', TRUE, 5, 123456, 9500),
('南乔', 'NanQiao', 'Xiuren秀人网', 'https://picsum.photos/200/200?random=2', '南乔的全新写真集，融合了现代时尚与传统美学的精华', TRUE, 4, 98765, 8900),
('陆萱萱', 'LuXuanXuan', 'Xiuren秀人网', 'https://picsum.photos/200/200?random=3', '陆萱萱最新写真作品，精致的画面构图与完美的光线运用', TRUE, 4, 87654, 8500),
('小肉肉咪', 'XiaoRouRouMi', 'Xiuren秀人网', 'https://picsum.photos/200/200?random=4', '小肉肉咪甜蜜风格写真，清新自然的妆容与可爱的造型', FALSE, 2, 65432, 7200),
('烧烧小桃', 'ShaoShaoXiaoTao', 'Xiuren秀人网', 'https://picsum.photos/200/200?random=5', '烧烧小桃全新力作，独特的个人风格贯穿整个写真集', FALSE, 3, 54321, 6800),
-- MiiTao蜜桃社
('白袜小甜', 'BaiWaXiaoTian', 'MiiTao蜜桃社', 'https://picsum.photos/200/200?random=10', 'MiiTao蜜桃社模特，甜美可爱风格', TRUE, 6, 156789, 9200),
('兔兔酱', 'TuTuJiang', 'MiiTao蜜桃社', 'https://picsum.photos/200/200?random=11', 'MiiTao蜜桃社新晋模特，清新自然', FALSE, 3, 87654, 7800),
('奶油兔兔', 'NaiYouTuTu', 'MiiTao蜜桃社', 'https://picsum.photos/200/200?random=12', 'MiiTao蜜桃社人气模特', TRUE, 5, 134567, 8600),
-- HUAYANG花漾
('糯叽叽', 'NuoJiJi', 'HUAYANG花漾', 'https://picsum.photos/200/200?random=20', 'HUAYANG花漾签约模特，清新甜美', TRUE, 7, 198765, 9800),
('元气少女小七', 'YuanQiShaoNvXiaoQi', 'HUAYANG花漾', 'https://picsum.photos/200/200?random=21', 'HUAYANG花漾当家花旦', TRUE, 8, 234567, 10500),
-- YOUMI尤蜜荟
('蜜桃少女', 'MiTaoShaoNv', 'YOUMI尤蜜荟', 'https://picsum.photos/200/200?random=30', 'YOUMI尤蜜荟精选模特', FALSE, 4, 76543, 7500),
('草莓甜心', 'CaoMeiTianXin', 'YOUMI尤蜜荟', 'https://picsum.photos/200/200?random=31', 'YOUMI尤蜜荟人气模特', TRUE, 5, 98765, 8200),
-- IMISS爱蜜社
('爱蜜小天使', 'AiMiXiaoTianShi', 'IMISS爱蜜社', 'https://picsum.photos/200/200?random=40', 'IMISS爱蜜社签约模特', FALSE, 4, 65432, 7200),
('甜蜜教主', 'TianMiJiaoZhu', 'IMISS爱蜜社', 'https://picsum.photos/200/200?random=41', 'IMISS爱蜜社人气模特', TRUE, 6, 87654, 8000),
-- Cosplay分类
('妲己_Toxic', 'Daji_Toxic', 'Cosplay', 'https://picsum.photos/200/200?random=50', '妲己_ToxicCosplay系列作品，完美还原了经典角色的魅力', FALSE, 3, 76543, 7800),
('蠢沫沫', 'ChongMoMo', 'Cosplay', 'https://picsum.photos/200/200?random=51', '蠢沫沫古风cosplay系列作品', TRUE, 8, 234567, 9500),
('云溪溪', 'YunXiXi', 'Cosplay', 'https://picsum.photos/200/200?random=52', '云溪溪cosplay作品精选', FALSE, 5, 123456, 8500),
-- 丝模摄影分类
('美腿女神Amy', 'MeiTuiNvShenAmy', 'BeautyLeg美腿', 'https://picsum.photos/200/200?random=60', 'BeautyLeg美腿人气模特', TRUE, 6, 187654, 9200),
('丝袜控萌萌', 'SiWaKongMengMeng', 'BoBoSocks袜啵啵', 'https://picsum.photos/200/200?random=61', 'BoBoSocks袜啵啵签约模特', FALSE, 4, 98765, 7800)
ON CONFLICT DO NOTHING;

-- =============================================
-- 插入图集数据
-- =============================================
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status) VALUES
-- 金允希Yuki的作品
(1, '金允希Yuki NO.001', '金允希Yuki & 陆萱萱 内购无水印 双人演绎 [100P1.1GB]', 'single', 3, '10762', 'https://picsum.photos/300/400?random=101', 100, 10, '1.1GB', 1234, 567, '2025-09-12', 'published'),
(1, '金允希Yuki NO.002', '护士主题系列', 'single', 3, '10761', 'https://picsum.photos/300/400?random=102', 23, 0, '107MB', 987, 234, '2025-09-10', 'published'),
(1, '金允希Yuki NO.003', '中华娘主题', 'single', 3, '10760', 'https://picsum.photos/300/400?random=103', 22, 0, '239MB', 876, 198, '2025-09-08', 'published'),
(1, '金允希Yuki 全套合集', '金允希Yuki 全部作品整合包 [500P+50V] 持续更新中', 'full', 10, 'F-001', 'https://picsum.photos/300/400?random=111', 500, 50, '5.2GB', 8765, 2345, '2025-09-01', 'published'),
-- 南乔的作品
(2, '南乔 NO.001', '户外泳装系列', 'single', 3, '10759', 'https://picsum.photos/300/400?random=201', 35, 0, '356MB', 2345, 456, '2025-09-12', 'published'),
(2, '南乔 NO.002', '室内写真集', 'single', 3, '10758', 'https://picsum.photos/300/400?random=202', 28, 0, '289MB', 1987, 345, '2025-09-10', 'published'),
(2, '南乔 全套合集', '南乔全部作品整合包 [450P+30V] 持续更新中', 'full', 10, 'F-002', 'https://picsum.photos/300/400?random=212', 450, 30, '4.8GB', 7654, 1987, '2025-09-01', 'published'),
-- 妲己_Toxic的Cosplay作品
(3, '妲己_Toxic NO.001', '古风cosplay系列', 'single', 3, '10757', 'https://picsum.photos/300/400?random=301', 45, 2, '512MB', 3456, 678, '2025-09-12', 'published'),
(3, '妲己_Toxic NO.002', '现代装系列', 'single', 3, '10756', 'https://picsum.photos/300/400?random=302', 38, 0, '423MB', 2345, 456, '2025-09-10', 'published'),
(3, '妲己_Toxic 全套合集', '妲己_Toxic全部Cosplay作品 [380P+20V]', 'full', 10, 'F-003', 'https://picsum.photos/300/400?random=313', 380, 20, '4.2GB', 6543, 1654, '2025-08-28', 'published'),
-- 小肉肉咪的作品
(4, '小肉肉咪 NO.001', '甜美可爱风', 'single', 3, '10755', 'https://picsum.photos/300/400?random=401', 42, 1, '478MB', 4567, 789, '2025-09-12', 'published'),
-- 陆萱萱的作品
(5, '陆萱萱 NO.001', '精致妆容系列', 'single', 3, '10753', 'https://picsum.photos/300/400?random=501', 55, 0, '623MB', 5678, 890, '2025-09-11', 'published'),
(5, '陆萱萱 全套合集', '陆萱萱全部作品整合包 [600P+40V]', 'full', 10, 'F-004', 'https://picsum.photos/300/400?random=511', 600, 40, '6.1GB', 9876, 2876, '2025-09-05', 'published'),
-- 白袜小甜的作品（MiiTao蜜桃社）
(6, '白袜小甜 NO.001', '甜美清新系列', 'single', 3, '20101', 'https://picsum.photos/300/400?random=601', 48, 0, '512MB', 4567, 678, '2025-09-15', 'published'),
(6, '白袜小甜 NO.002', '户外阳光系列', 'single', 3, '20102', 'https://picsum.photos/300/400?random=602', 52, 1, '578MB', 3456, 543, '2025-09-12', 'published'),
(6, '白袜小甜 全套合集', '白袜小甜全部作品整合包 [400P+25V]', 'full', 10, 'F-101', 'https://picsum.photos/300/400?random=611', 400, 25, '4.5GB', 8765, 1987, '2025-09-01', 'published'),
-- 糯叽叽的作品（HUAYANG花漾）
(9, '糯叽叽 NO.001', '清新甜美系列', 'single', 3, '30101', 'https://picsum.photos/300/400?random=901', 55, 0, '623MB', 5678, 890, '2025-09-14', 'published'),
(9, '糯叽叽 NO.002', '海边度假系列', 'single', 3, '30102', 'https://picsum.photos/300/400?random=902', 48, 2, '534MB', 4567, 765, '2025-09-10', 'published'),
(9, '糯叽叽 全套合集', '糯叽叽全部作品整合包 [550P+35V]', 'full', 10, 'F-301', 'https://picsum.photos/300/400?random=911', 550, 35, '5.8GB', 12345, 3456, '2025-09-01', 'published'),
-- 蠢沫沫的Cosplay作品
(15, '蠢沫沫 NO.001', '古风汉服系列', 'single', 3, '50101', 'https://picsum.photos/300/400?random=1501', 68, 0, '756MB', 8765, 1234, '2025-09-13', 'published'),
(15, '蠢沫沫 NO.002', 'Lolita洋装系列', 'single', 3, '50102', 'https://picsum.photos/300/400?random=1502', 72, 1, '823MB', 7654, 1098, '2025-09-11', 'published'),
(15, '蠢沫沫 NO.003', 'JK制服系列', 'single', 3, '50103', 'https://picsum.photos/300/400?random=1503', 65, 0, '712MB', 6543, 987, '2025-09-09', 'published'),
(15, '蠢沫沫 全套合集', '蠢沫沫全部Cosplay作品 [800P+50V]', 'full', 10, 'F-501', 'https://picsum.photos/300/400?random=1511', 800, 50, '8.5GB', 23456, 6789, '2025-09-01', 'published')
ON CONFLICT DO NOTHING;

-- =============================================
-- 插入预览图片
-- =============================================
INSERT INTO collection_images (collection_id, image_url, display_order)
SELECT 
    c.id,
    'https://picsum.photos/800/1200?random=preview' || c.id || '-' || gs,
    gs
FROM photo_collections c
CROSS JOIN generate_series(1, CASE WHEN c.type = 'single' THEN 3 ELSE 10 END) AS gs
ON CONFLICT DO NOTHING;

-- =============================================
-- 插入下载资源
-- =============================================
INSERT INTO download_resources (collection_id, resource_name, baidu_link, extract_code, password, file_type, file_size, downloads_count) VALUES
-- 金允希Yuki的下载资源
(1, '金允希Yuki NO.001 全套图集', 'https://pan.baidu.com/s/1abcdef1234567890', 'qwer', '解压密码: 2024', 'image', '1.1GB', 567),
(1, '金允希Yuki NO.001 视频花絮', 'https://pan.baidu.com/s/1ghijkl2345678901', 'asdf', NULL, 'video', '2.3GB', 234),
(2, '金允希Yuki NO.002 图集', 'https://pan.baidu.com/s/1mnopqr3456789012', 'zxcv', NULL, 'image', '107MB', 234),
(3, '金允希Yuki NO.003 图集', 'https://pan.baidu.com/s/1stuvwx4567890123', 'uiop', NULL, 'image', '239MB', 198),
(4, '金允希Yuki 全套合集', 'https://pan.baidu.com/s/1ABCDE1234567890ABC', '8888', '解压密码: yuki2024', 'image', '5.2GB', 2345),
-- 南乔的下载资源
(5, '南乔 NO.001 图集', 'https://pan.baidu.com/s/1yzhack5678901234', 'jkl;', NULL, 'image', '356MB', 456),
(6, '南乔 NO.002 图集', 'https://pan.baidu.com/s/1abcdeg6789012345', 'mnbv', NULL, 'image', '289MB', 345),
(7, '南乔 全套合集', 'https://pan.baidu.com/s/1FGHIJ2345678901FG', '6666', '解压密码: nanqiao', 'image', '4.8GB', 1987),
-- 妲己_Toxic的下载资源
(8, '妲己_Toxic NO.001 图集+视频', 'https://pan.baidu.com/s/1cdefgh7890123456', 'cxza', '2024', 'image', '512MB', 678),
(9, '妲己_Toxic NO.002 图集', 'https://pan.baidu.com/s/1ijklem8901234567', 'vbnm', NULL, 'image', '423MB', 456),
(10, '妲己_Toxic 全套合集', 'https://pan.baidu.com/s/1KLMNO3456789012KL', '7777', '解压密码: toxic', 'image', '4.2GB', 1654),
-- 陆萱萱的下载资源
(12, '陆萱萱 NO.001 图集', 'https://pan.baidu.com/s/1wxyzab2345678901', 'qaws', NULL, 'image', '623MB', 890),
(13, '陆萱萱 全套合集', 'https://pan.baidu.com/s/1PQRST4567890123PQ', '9999', '解压密码: luxuan', 'image', '6.1GB', 2876),
-- 白袜小甜的下载资源（MiiTao蜜桃社）
(14, '白袜小甜 NO.001 图集', 'https://pan.baidu.com/s/1XYZA12345678901', 'bait', NULL, 'image', '512MB', 678),
(15, '白袜小甜 NO.002 图集', 'https://pan.baidu.com/s/1BCDE23456789012', 'xiao', NULL, 'image', '578MB', 543),
(16, '白袜小甜 全套合集', 'https://pan.baidu.com/s/1FGHIJ34567890123', 'miitao', '解压密码: sweet123', 'image', '4.5GB', 1987),
-- 糯叽叽的下载资源（HUAYANG花漾）
(17, '糯叽叽 NO.001 图集', 'https://pan.baidu.com/s/1JKLM45678901234', 'huayang1', NULL, 'image', '623MB', 890),
(18, '糯叽叽 NO.002 图集', 'https://pan.baidu.com/s/1NOPQ56789012345', 'huayang2', NULL, 'image', '534MB', 765),
(19, '糯叽叽 全套合集', 'https://pan.baidu.com/s/1RSTU67890123456', 'huayang', '解压密码: nuo123', 'image', '5.8GB', 3456),
-- 蠢沫沫的下载资源
(20, '蠢沫沫 NO.001 图集', 'https://pan.baidu.com/s/1VWXY78901234567', 'chong001', NULL, 'image', '756MB', 1234),
(21, '蠢沫沫 NO.002 图集', 'https://pan.baidu.com/s/1ZABC89012345678', 'chong002', NULL, 'image', '823MB', 1098),
(22, '蠢沫沫 NO.003 图集', 'https://pan.baidu.com/s/1DEFG90123456789', 'chong003', NULL, 'image', '712MB', 987),
(23, '蠢沫沫 全套合集', 'https://pan.baidu.com/s/1HIJK01234567890', 'chongfull', '解压密码: cm2024', 'image', '8.5GB', 6789)
ON CONFLICT DO NOTHING;

-- =============================================
-- 插入VIP状态数据（关联测试用户）
-- =============================================
INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'monthly', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', FALSE
FROM users u WHERE u.username = 'vip_monthly1'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'monthly', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', FALSE
FROM users u WHERE u.username = 'vip_monthly2'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'quarterly', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', FALSE
FROM users u WHERE u.username = 'vip_quarterly1'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'quarterly', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days', FALSE
FROM users u WHERE u.username = 'vip_quarterly2'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'yearly', CURRENT_DATE - INTERVAL '65 days', CURRENT_DATE + INTERVAL '300 days', FALSE
FROM users u WHERE u.username = 'vip_yearly1'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'yearly', CURRENT_DATE - INTERVAL '85 days', CURRENT_DATE + INTERVAL '280 days', FALSE
FROM users u WHERE u.username = 'vip_yearly2'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'permanent', CURRENT_DATE - INTERVAL '365 days', NULL, TRUE
FROM users u WHERE u.username = 'vip_permanent1'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'permanent', CURRENT_DATE - INTERVAL '180 days', NULL, TRUE
FROM users u WHERE u.username = 'vip_permanent2'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_vip_status (user_id, vip_level, vip_start_date, vip_end_date, is_permanent)
SELECT u.id, 'svip', CURRENT_DATE - INTERVAL '100 days', NULL, TRUE
FROM users u WHERE u.username = 'svip_user1'
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 插入单套购买记录（测试用户购买了某些单套图集）
-- =============================================
-- 普通用户购买了单套图集（可以下载）
INSERT INTO single_purchases (user_id, collection_id, amount, payment_status)
SELECT u.id, 1, 9.90, 'paid'
FROM users u WHERE u.username = 'normal_user1'
ON CONFLICT (user_id, collection_id) DO NOTHING;

INSERT INTO single_purchases (user_id, collection_id, amount, payment_status)
SELECT u.id, 5, 12.90, 'paid'
FROM users u WHERE u.username = 'normal_user1'
ON CONFLICT (user_id, collection_id) DO NOTHING;

-- 另一个普通用户购买了单套
INSERT INTO single_purchases (user_id, collection_id, amount, payment_status)
SELECT u.id, 17, 15.90, 'paid'
FROM users u WHERE u.username = 'normal_user2'
ON CONFLICT (user_id, collection_id) DO NOTHING;

-- =============================================
-- 插入VIP订单记录
-- =============================================
INSERT INTO vip_orders (order_no, user_id, package_id, amount, payment_method, payment_status, paid_at)
SELECT 'VIP' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '001', u.id, 1, 19.90, 'alipay', 'paid', CURRENT_TIMESTAMP - INTERVAL '15 days'
FROM users u WHERE u.username = 'vip_monthly1'
ON CONFLICT DO NOTHING;

INSERT INTO vip_orders (order_no, user_id, package_id, amount, payment_method, payment_status, paid_at)
SELECT 'VIP' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '002', u.id, 2, 49.90, 'wechat', 'paid', CURRENT_TIMESTAMP - INTERVAL '30 days'
FROM users u WHERE u.username = 'vip_quarterly1'
ON CONFLICT DO NOTHING;

INSERT INTO vip_orders (order_no, user_id, package_id, amount, payment_method, payment_status, paid_at)
SELECT 'VIP' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '003', u.id, 3, 159.90, 'alipay', 'paid', CURRENT_TIMESTAMP - INTERVAL '65 days'
FROM users u WHERE u.username = 'vip_yearly1'
ON CONFLICT DO NOTHING;

INSERT INTO vip_orders (order_no, user_id, package_id, amount, payment_method, payment_status, paid_at)
SELECT 'VIP' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '004', u.id, 4, 298.00, 'card', 'paid', CURRENT_TIMESTAMP - INTERVAL '365 days'
FROM users u WHERE u.username = 'vip_permanent1'
ON CONFLICT DO NOTHING;

INSERT INTO vip_orders (order_no, user_id, package_id, amount, payment_method, payment_status, paid_at)
SELECT 'VIP' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '005', u.id, 4, 298.00, 'alipay', 'paid', CURRENT_TIMESTAMP - INTERVAL '180 days'
FROM users u WHERE u.username = 'vip_permanent2'
ON CONFLICT DO NOTHING;

-- =============================================
-- 插入评论数据
-- =============================================
INSERT INTO comments (collection_id, user_id, content, rating, like_count, created_at)
SELECT 1, u.id, '这套图集真的太棒了！模特的表现力非常强，每一张都像艺术品一样精美。强烈推荐！', 5, 156, CURRENT_TIMESTAMP - INTERVAL '10 days'
FROM users u WHERE u.username = 'vip_permanent1'
ON CONFLICT DO NOTHING;

INSERT INTO comments (collection_id, user_id, content, rating, like_count, created_at)
SELECT 1, u.id, '终于找到了！找了很久了，画质非常清晰，下载速度也很快，谢谢分享！', 5, 98, CURRENT_TIMESTAMP - INTERVAL '9 days'
FROM users u WHERE u.username = 'vip_yearly1'
ON CONFLICT DO NOTHING;

INSERT INTO comments (collection_id, user_id, content, rating, like_count, created_at)
SELECT 4, u.id, '全套合集太香了！收录了所有作品，而且还在持续更新，VIP用户强烈推荐！', 5, 456, CURRENT_TIMESTAMP - INTERVAL '20 days'
FROM users u WHERE u.username = 'vip_permanent1'
ON CONFLICT DO NOTHING;

INSERT INTO comments (collection_id, user_id, content, rating, like_count, created_at)
SELECT 17, u.id, '糯叽叽的清新风格太喜欢了，每套作品都很用心！', 5, 234, CURRENT_TIMESTAMP - INTERVAL '5 days'
FROM users u WHERE u.username = 'normal_user1'
ON CONFLICT DO NOTHING;

INSERT INTO comments (collection_id, user_id, content, rating, like_count, created_at)
SELECT 23, u.id, '蠢沫沫的Cosplay作品真的太赞了！每套都很用心，还原度超高！', 5, 567, CURRENT_TIMESTAMP - INTERVAL '3 days'
FROM users u WHERE u.username = 'vip_yearly1'
ON CONFLICT DO NOTHING;

-- =============================================
-- 打印测试数据统计
-- =============================================
DO $$
DECLARE
    v_users INTEGER;
    v_vip_users INTEGER;
    v_permanent_vip INTEGER;
    v_celebrities INTEGER;
    v_collections INTEGER;
    v_single_collections INTEGER;
    v_full_collections INTEGER;
    v_comments INTEGER;
    v_purchases INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_users FROM users;
    SELECT COUNT(*) INTO v_vip_users FROM user_vip_status WHERE vip_end_date >= CURRENT_DATE OR is_permanent = TRUE;
    SELECT COUNT(*) INTO v_permanent_vip FROM user_vip_status WHERE is_permanent = TRUE;
    SELECT COUNT(*) INTO v_celebrities FROM celebrities;
    SELECT COUNT(*) INTO v_collections FROM photo_collections;
    SELECT COUNT(*) INTO v_single_collections FROM photo_collections WHERE type = 'single';
    SELECT COUNT(*) INTO v_full_collections FROM photo_collections WHERE type = 'full';
    SELECT COUNT(*) INTO v_comments FROM comments;
    SELECT COUNT(*) INTO v_purchases FROM single_purchases;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE '数据库初始化完成！测试数据统计：';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '用户总数: %', v_users;
    RAISE NOTICE 'VIP用户数: %', v_vip_users;
    RAISE NOTICE '永久VIP用户数: %', v_permanent_vip;
    RAISE NOTICE '模特/人物数: %', v_celebrities;
    RAISE NOTICE '图集总数: %', v_collections;
    RAISE NOTICE '  - 单套图集: %', v_single_collections;
    RAISE NOTICE '  - 全套合集: %', v_full_collections;
    RAISE NOTICE '评论总数: %', v_comments;
    RAISE NOTICE '单套购买记录: %', v_purchases;
    RAISE NOTICE '=============================================';
    RAISE NOTICE '测试用户等级分布：';
    RAISE NOTICE '普通用户: normal_user1, normal_user2, normal_user3';
    RAISE NOTICE '一个月VIP: vip_monthly1, vip_monthly2 (有效期15-20天)';
    RAISE NOTICE '三个月VIP: vip_quarterly1, vip_quarterly2 (有效期60-75天)';
    RAISE NOTICE '一年VIP: vip_yearly1, vip_yearly2 (有效期280-300天)';
    RAISE NOTICE '永久VIP: vip_permanent1, vip_permanent2';
    RAISE NOTICE 'SVIP: svip_user1';
    RAISE NOTICE '管理员: admin_master';
    RAISE NOTICE '版主: moderator_01, moderator_02';
    RAISE NOTICE '=============================================';
END $$;
