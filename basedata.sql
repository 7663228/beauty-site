-- =============================================
-- 人物图集网站 PostgreSQL 数据库设计
-- 设计说明：
-- 1. 单套图集(single)展示3张预览图，全套图集(full)展示10张预览图
-- 2. 用户评论包含用户名、评论时间、评论内容、用户等级
-- 3. 相关推荐基于同一人物的其他图集
-- 4. 支持百度网盘链接和提取码
-- =============================================

-- 删除已存在的表（按依赖顺序）
DROP TABLE IF EXISTS collection_views CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS download_resources CASCADE;
DROP TABLE IF EXISTS collection_images CASCADE;
DROP TABLE IF EXISTS photo_collections CASCADE;
DROP TABLE IF EXISTS celebrities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- 1. 用户表 (users)
-- 存储评论用户的基本信息
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,           -- 用户名
    avatar_url VARCHAR(500),                         -- 用户头像URL
    user_level VARCHAR(20) DEFAULT '普通用户',       -- 用户等级：普通用户、VIP、SVIP、管理员等
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 注册时间
    last_login_at TIMESTAMP,                         -- 最后登录时间
    comment_count INTEGER DEFAULT 0,                 -- 评论数量
    total_views INTEGER DEFAULT 0                    -- 总观看次数
);

COMMENT ON TABLE users IS '用户表 - 存储评论用户信息';
COMMENT ON COLUMN users.user_level IS '用户等级：普通用户、VIP、SVIP、管理员、版主';

-- =============================================
-- 2. 人物表 (celebrities)
-- 存储人物的基本信息，一个人物可以有多套图集
-- =============================================
CREATE TABLE celebrities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                      -- 人物名称
    alias VARCHAR(200),                              -- 别名/英文名
    category VARCHAR(100),                           -- 来源分类：Xiuren秀人网、MissMuse等
    avatar_url VARCHAR(500),                         -- 人物头像
    description TEXT,                                -- 人物简介
    is_verified BOOLEAN DEFAULT FALSE,                -- 是否认证
    total_collections INTEGER DEFAULT 0,              -- 总图集数量
    total_views BIGINT DEFAULT 0,                    -- 总观看次数
    popularity_score INTEGER DEFAULT 0,               -- 人气指数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE celebrities IS '人物表 - 存储人物基本信息，一人可有多个图集';
COMMENT ON COLUMN celebrities.popularity_score IS '人气指数，用于排序推荐';

-- =============================================
-- 3. 图集表 (photo_collections)
-- 存储单套图集和全套图集
-- type: single(单套) / full(全套)
-- =============================================
CREATE TABLE photo_collections (
    id SERIAL PRIMARY KEY,
    celebrity_id INTEGER NOT NULL REFERENCES celebrities(id) ON DELETE CASCADE,  -- 关联人物
    
    title VARCHAR(200) NOT NULL,                     -- 图集标题
    subtitle VARCHAR(500),                           -- 图集副标题/描述
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'full')),  -- single:单套, full:全套
    preview_image_count INTEGER DEFAULT 3,           -- 预览图数量：单套3张，全套10张
    
    source_no VARCHAR(50),                          -- 来源编号(如：10762)
    thumbnail_url VARCHAR(500),                      -- 缩略图URL
    
    image_count INTEGER DEFAULT 0,                   -- 图片总数
    video_count INTEGER DEFAULT 0,                  -- 视频数量
    file_size VARCHAR(50),                           -- 文件大小(如：889.31MB)
    
    views_count INTEGER DEFAULT 0,                   -- 观看次数
    downloads_count INTEGER DEFAULT 0,               -- 下载次数
    
    publish_date DATE,                               -- 发布日期
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),  -- 状态
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE photo_collections IS '图集表 - 存储单套图集(single)和全套图集(full)';
COMMENT ON COLUMN photo_collections.preview_image_count IS '预览图数量：单套图集默认3张，全套图集默认10张';
COMMENT ON COLUMN photo_collections.thumbnail_url IS '列表页显示的缩略图';

-- =============================================
-- 4. 图集预览图片表 (collection_images)
-- 存储图集的预览图片，用于详情页展示
-- =============================================
CREATE TABLE collection_images (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    
    image_url VARCHAR(500) NOT NULL,                -- 图片URL
    display_order INTEGER DEFAULT 0,                 -- 显示顺序
    thumbnail_url VARCHAR(500),                      -- 缩略图URL(可选)
    width INTEGER,                                   -- 图片宽度
    height INTEGER,                                  -- 图片高度
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE collection_images IS '图集预览图片表 - 存储图集预览图片，单套3张/全套10张';
COMMENT ON COLUMN collection_images.display_order IS '图片显示顺序';

-- =============================================
-- 5. 下载资源表 (download_resources)
-- 存储百度网盘链接和提取码
-- =============================================
CREATE TABLE download_resources (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    
    resource_name VARCHAR(200),                      -- 资源名称
    baidu_link VARCHAR(500) NOT NULL,                -- 百度网盘链接
    extract_code VARCHAR(20) NOT NULL,               -- 提取码
    password VARCHAR(50),                            -- 解压密码(可选)
    
    file_type VARCHAR(20) DEFAULT 'image',           -- 资源类型：image/video/zip
    file_size VARCHAR(50),                           -- 文件大小
    
    downloads_count INTEGER DEFAULT 0,                -- 该链接下载次数
    
    is_active BOOLEAN DEFAULT TRUE,                  -- 是否有效
    expire_date DATE,                                 -- 过期日期(可选)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE download_resources IS '下载资源表 - 存储百度网盘链接和提取码';
COMMENT ON COLUMN download_resources.baidu_link IS '百度网盘分享链接';
COMMENT ON COLUMN download_resources.extract_code IS '百度网盘提取码';

-- =============================================
-- 6. 评论表 (comments)
-- 存储用户对图集的评论
-- =============================================
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,                           -- 评论内容
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 评分(1-5星，可选)
    
    like_count INTEGER DEFAULT 0,                    -- 点赞数
    reply_count INTEGER DEFAULT 0,                   -- 回复数
    
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,  -- 回复的父评论ID
    root_id INTEGER,                                 -- 根评论ID(用于楼层展示)
    
    is_pinned BOOLEAN DEFAULT FALSE,                 -- 是否置顶
    is_deleted BOOLEAN DEFAULT FALSE,                -- 软删除标记
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE comments IS '评论表 - 存储用户评论，包含用户名、评论时间、内容、用户等级';
COMMENT ON COLUMN comments.parent_id IS '回复的父评论ID，NULL表示一级评论';
COMMENT ON COLUMN comments.root_id IS '根评论ID，用于楼层展示';

-- =============================================
-- 7. 观看记录表 (collection_views)
-- 记录每次观看，用于统计和防止重复计数
-- =============================================
CREATE TABLE collection_views (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES photo_collections(id) ON DELETE CASCADE,
    
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- 可选的登录用户
    ip_address VARCHAR(50),                          -- IP地址
    user_agent VARCHAR(500),                         -- 浏览器信息
    
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE collection_views IS '观看记录表 - 记录每次观看行为';
COMMENT ON COLUMN collection_views.ip_address IS '用于统计去重';

-- =============================================
-- 索引设计
-- =============================================

-- 人物表索引
CREATE INDEX idx_celebrities_name ON celebrities(name);
CREATE INDEX idx_celebrities_category ON celebrities(category);
CREATE INDEX idx_celebrities_popularity ON celebrities(popularity_score DESC);

-- 图集表索引
CREATE INDEX idx_collections_celebrity ON photo_collections(celebrity_id);
CREATE INDEX idx_collections_type ON photo_collections(type);
CREATE INDEX idx_collections_views ON photo_collections(views_count DESC);
CREATE INDEX idx_collections_publish_date ON photo_collections(publish_date DESC);

-- 预览图片索引
CREATE INDEX idx_images_collection ON collection_images(collection_id);
CREATE INDEX idx_images_order ON collection_images(collection_id, display_order);

-- 下载资源索引
CREATE INDEX idx_resources_collection ON download_resources(collection_id);
CREATE INDEX idx_resources_active ON download_resources(collection_id, is_active) WHERE is_active = TRUE;

-- 评论表索引
CREATE INDEX idx_comments_collection ON comments(collection_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
CREATE INDEX idx_comments_root ON comments(root_id);

-- 观看记录索引
CREATE INDEX idx_views_collection ON collection_views(collection_id);
CREATE INDEX idx_views_date ON collection_views(viewed_at DESC);

-- =============================================
-- 模拟数据
-- =============================================

-- 插入用户数据
INSERT INTO users (username, avatar_url, user_level, comment_count, total_views) VALUES
('beauty_lover', 'https://api.dicebear.com/7.x/avataaars/svg?seed=beauty1', 'VIP', 156, 2345),
('photo_fan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=photo2', 'SVIP', 89, 5678),
('model_collector', 'https://api.dicebear.com/7.x/avataaars/svg?seed=model3', '普通用户', 234, 1234),
('xiaoming123', 'https://api.dicebear.com/7.x/avataaars/svg?seed=xm4', '普通用户', 45, 890),
('vip_user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vip5', 'VIP', 567, 8901),
('admin_master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin6', '管理员', 1234, 23456),
('cute_girl_watch', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cute7', '普通用户', 78, 456),
('newbie2024', 'https://api.dicebear.com/7.x/avataaars/svg?seed=new8', '普通用户', 12, 234),
('senior_member', 'https://api.dicebear.com/7.x/avataaars/svg?seed=senior9', '版主', 345, 6789),
('photo_expert', 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert10', 'VIP', 234, 4567);

-- 插入人物数据
INSERT INTO celebrities (name, alias, category, avatar_url, description, is_verified, total_collections, total_views, popularity_score) VALUES
('金允希Yuki', '金允希|Yuki Kim', 'Xiuren秀人网', 'http://tdtzfuafz.hn-bkt.clouddn.com/0001-tic.webp', '金允希Yuki最新写真作品，柔美的光线与精致的妆容完美结合，展现出东方女性独特的魅力与气质。', TRUE, 5, 123456, 9500),
('南乔', 'NanQiao', 'Xiuren秀人网', '/placeholder.jpg', '南乔的全新写真集，融合了现代时尚与传统美学的精华。', TRUE, 4, 98765, 8900),
('妲己_Toxic', '妲己|Toxic', 'Cosplay', '/placeholder.jpg', '妲己_ToxicCosplay系列作品，完美还原了经典角色的魅力。', FALSE, 3, 76543, 7800),
('小肉肉咪', 'XiaoRouRouMi', 'Xiuren秀人网', '/placeholder.jpg', '小肉肉咪甜蜜风格写真，清新自然的妆容与可爱的造型相得益彰。', FALSE, 2, 65432, 7200),
('烧烧小桃', 'ShaoShaoXiaoTao', 'Xiuren秀人网', '/placeholder.jpg', '烧烧小桃全新力作，独特的个人风格贯穿整个写真集。', FALSE, 3, 54321, 6800),
('陆萱萱', 'LuXuanXuan', 'Xiuren秀人网', '/placeholder.jpg', '陆萱萱最新写真作品，精致的画面构图与完美的光线运用。', TRUE, 4, 87654, 8500),
('尹甜甜', 'YinTianTian', 'Xiuren秀人网', '/placeholder.jpg', '尹甜甜写真合集，展现了多变的造型与风格。', FALSE, 3, 45678, 6500),
('汐汐爱吃草莓', 'XiXiLoveStrawberry', 'Xiuren秀人网', '/placeholder.jpg', '汐汐爱吃草莓主题写真，以草莓为灵感创作的一系列精美作品。', FALSE, 2, 34567, 5800);

-- 插入图集数据（单套图集 - preview_image_count = 3）
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status) VALUES
(1, '金允希Yuki NO.001', '金允希Yuki & 陆萱萱 内购无水印 双人演绎 [100P1.1GB]', 'single', 3, '10762', 'http://tdtzfuafz.hn-bkt.clouddn.com/0001-tic.webp', 100, 10, '1.1GB', 1234, 567, '2025-09-12', 'published'),
(1, '金允希Yuki NO.002', '护士主题系列', 'single', 3, '10761', 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.002-0001-tic.webp', 23, 0, '107MB', 987, 234, '2025-09-10', 'published'),
(1, '金允希Yuki NO.003', '中华娘主题', 'single', 3, '10760', 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.003-0011-tic.webp', 22, 0, '239MB', 876, 198, '2025-09-08', 'published'),
(2, '南乔 NO.001', '户外泳装系列', 'single', 3, '10759', '/placeholder.jpg', 35, 0, '356MB', 2345, 456, '2025-09-12', 'published'),
(2, '南乔 NO.002', '室内写真集', 'single', 3, '10758', '/placeholder.jpg', 28, 0, '289MB', 1987, 345, '2025-09-10', 'published'),
(3, '妲己_Toxic NO.001', '古风cosplay系列', 'single', 3, '10757', '/placeholder.jpg', 45, 2, '512MB', 3456, 678, '2025-09-12', 'published'),
(3, '妲己_Toxic NO.002', '现代装系列', 'single', 3, '10756', '/placeholder.jpg', 38, 0, '423MB', 2345, 456, '2025-09-10', 'published'),
(4, '小肉肉咪 NO.001', '甜美可爱风', 'single', 3, '10755', '/placeholder.jpg', 42, 1, '478MB', 4567, 789, '2025-09-12', 'published'),
(5, '烧烧小桃 NO.001', '妩媚风格', 'single', 3, '10754', '/placeholder.jpg', 36, 0, '389MB', 3456, 567, '2025-09-11', 'published'),
(6, '陆萱萱 NO.001', '精致妆容系列', 'single', 3, '10753', '/placeholder.jpg', 55, 0, '623MB', 5678, 890, '2025-09-11', 'published');

-- 插入图集数据（全套图集 - preview_image_count = 10）
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status) VALUES
(1, '金允希Yuki 全套合集', '金允希Yuki 全部作品整合包 [500P+50V] 持续更新中', 'full', 10, 'F-001', 'http://tdtzfuafz.hn-bkt.clouddn.com/0001-tic.webp', 500, 50, '5.2GB', 8765, 2345, '2025-09-01', 'published'),
(2, '南乔 全套合集', '南乔全部作品整合包 [450P+30V] 持续更新中', 'full', 10, 'F-002', '/placeholder.jpg', 450, 30, '4.8GB', 7654, 1987, '2025-09-01', 'published'),
(3, '妲己_Toxic 全套合集', '妲己_Toxic全部Cosplay作品 [380P+20V]', 'full', 10, 'F-003', '/placeholder.jpg', 380, 20, '4.2GB', 6543, 1654, '2025-08-28', 'published'),
(6, '陆萱萱 全套合集', '陆萱萱全部作品整合包 [600P+40V]', 'full', 10, 'F-004', '/placeholder.jpg', 600, 40, '6.1GB', 9876, 2876, '2025-09-05', 'published'),
(7, '尹甜甜 全套合集', '尹甜甜全部作品 [320P+25V]', 'full', 10, 'F-005', '/placeholder.jpg', 320, 25, '3.6GB', 5432, 1321, '2025-08-20', 'published');

-- 插入预览图片（单套图集3张预览图）
INSERT INTO collection_images (collection_id, image_url, display_order) VALUES
-- 金允希 NO.001 的3张预览图
(1, 'http://tdtzfuafz.hn-bkt.clouddn.com/0001-tic.webp', 1),
(1, 'http://tdtzfuafz.hn-bkt.clouddn.com/0002-tic.webp', 2),
(1, 'http://tdtzfuafz.hn-bkt.clouddn.com/0003-tic.webp', 3),
-- 金允希 NO.002 的3张预览图
(2, 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.002-0001-tic.webp', 1),
(2, 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.002-0002-tic.webp', 2),
(2, 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.002-0003-tic.webp', 3),
-- 金允希 NO.003 的3张预览图
(3, 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.003-0011-tic.webp', 1),
(3, 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.003-0012-tic.webp', 2),
(3, 'http://tdtzfuafz.hn-bkt.clouddn.com/%E5%AE%89%E7%84%B6anran%20NO.003-0013-tic.webp', 3);

-- 插入更多单套图集的预览图（使用picsum占位图）
INSERT INTO collection_images (collection_id, image_url, display_order)
SELECT 
    c.id,
    'https://picsum.photos/800/1200?random=collection' || c.id || '-img' || gs,
    gs
FROM photo_collections c
CROSS JOIN generate_series(1, 3) AS gs
WHERE c.type = 'single' 
AND c.id > 3
AND NOT EXISTS (
    SELECT 1 FROM collection_images ci WHERE ci.collection_id = c.id
);

-- 插入全套图集的10张预览图
INSERT INTO collection_images (collection_id, image_url, display_order)
SELECT 
    c.id,
    'https://picsum.photos/800/1200?random=full' || c.id || '-preview' || gs,
    gs
FROM photo_collections c
CROSS JOIN generate_series(1, 10) AS gs
WHERE c.type = 'full';

-- 插入下载资源（百度网盘链接和提取码）
INSERT INTO download_resources (collection_id, resource_name, baidu_link, extract_code, password, file_type, file_size, downloads_count) VALUES
(1, '金允希Yuki NO.001 全套图集', 'https://pan.baidu.com/s/1abcdef1234567890', 'qwer', '解压密码: 2024', 'image', '1.1GB', 567),
(1, '金允希Yuki NO.001 视频花絮', 'https://pan.baidu.com/s/1ghijkl2345678901', 'asdf', NULL, 'video', '2.3GB', 234),
(2, '金允希Yuki NO.002 图集', 'https://pan.baidu.com/s/1mnopqr3456789012', 'zxcv', NULL, 'image', '107MB', 234),
(3, '金允希Yuki NO.003 图集', 'https://pan.baidu.com/s/1stuvwx4567890123', 'uiop', NULL, 'image', '239MB', 198),
(4, '南乔 NO.001 图集', 'https://pan.baidu.com/s/1yzhack5678901234', 'jkl;', NULL, 'image', '356MB', 456),
(5, '南乔 NO.002 图集', 'https://pan.baidu.com/s/1abcdeg6789012345', 'mnbv', NULL, 'image', '289MB', 345),
(6, '妲己_Toxic NO.001 图集+视频', 'https://pan.baidu.com/s/1cdefgh7890123456', 'cxza', '2024', 'image', '512MB', 678),
(7, '妲己_Toxic NO.002 图集', 'https://pan.baidu.com/s/1ijklem8901234567', 'vbnm', NULL, 'image', '423MB', 456),
(8, '小肉肉咪 NO.001 图集', 'https://pan.baidu.com/s/1lmnopq9012345678', 'plok', NULL, 'image', '478MB', 789),
(9, '烧烧小桃 NO.001 图集', 'https://pan.baidu.com/s/1qrstuv1234567890', 'mijn', NULL, 'image', '389MB', 567),
(10, '陆萱萱 NO.001 图集', 'https://pan.baidu.com/s/1wxyzab2345678901', 'qaws', NULL, 'image', '623MB', 890),
-- 全套图集下载资源
(11, '金允希Yuki 全套合集', 'https://pan.baidu.com/s/1ABCDE1234567890ABC', '8888', '解压密码: yuki2024', 'image', '5.2GB', 2345),
(12, '南乔 全套合集', 'https://pan.baidu.com/s/1FGHIJ2345678901FG', '6666', '解压密码: nanqiao', 'image', '4.8GB', 1987),
(13, '妲己_Toxic 全套合集', 'https://pan.baidu.com/s/1KLMNO3456789012KL', '7777', '解压密码: toxic', 'image', '4.2GB', 1654),
(14, '陆萱萱 全套合集', 'https://pan.baidu.com/s/1PQRST4567890123PQ', '9999', '解压密码: luxuan', 'image', '6.1GB', 2876),
(15, '尹甜甜 全套合集', 'https://pan.baidu.com/s/1UVWXY5678901234UV', '5555', '解压密码: tiantian', 'image', '3.6GB', 1321);

-- 插入评论数据
INSERT INTO comments (collection_id, user_id, content, rating, like_count, created_at) VALUES
-- 图集1的评论
(1, 1, '这套图集真的太棒了！模特的表现力非常强，每一张都像艺术品一样精美。强烈推荐！', 5, 156, '2025-09-13 10:30:00'),
(1, 2, '终于找到了！找了很久了，画质非常清晰，下载速度也很快，谢谢分享！', 5, 98, '2025-09-13 14:22:00'),
(1, 3, '金允希Yuki是我最喜欢的模特，这套作品质量很高，期待更多更新！', 5, 87, '2025-09-13 16:45:00'),
(1, 4, '百度网盘链接有效，提取码正确，资源完整没有缺失，好评！', 4, 45, '2025-09-14 09:15:00'),
(1, 5, '图集内容很丰富，涵盖了多种风格，性价比超高！', 5, 67, '2025-09-14 11:30:00'),
-- 图集2的评论
(2, 6, '护士主题拍得很有创意，模特演绎得很到位，满分好评！', 5, 123, '2025-09-11 08:20:00'),
(2, 1, '这套也很不错，和上一套风格不太一样，各有特色', 4, 56, '2025-09-11 12:40:00'),
(2, 7, '图片很清晰，摄影技术专业，给摄影师点赞！', 5, 78, '2025-09-11 15:00:00'),
-- 图集4的评论（南乔）
(4, 8, '户外泳装主题拍得很自然，光线运用得很好看！', 5, 234, '2025-09-12 18:30:00'),
(4, 9, '南乔的颜值太能打了，随便一拍都是大片感', 5, 189, '2025-09-12 20:15:00'),
(4, 10, '资源已下载，画质完美，感谢分享这么优质的图集！', 5, 145, '2025-09-13 08:45:00'),
-- 图集6的评论（妲己_Toxic）
(6, 1, '古风cosplay太惊艳了！服装道具都很用心，还原度极高！', 5, 267, '2025-09-12 22:00:00'),
(6, 3, '妲己_Toxic的Cosplay作品一直都很有水准，这次也不例外', 5, 198, '2025-09-13 06:30:00'),
(6, 4, '有视频花絮太好了！可以看到更多幕后内容，物超所值', 5, 156, '2025-09-13 10:00:00'),
-- 全套图集11的评论（金允希全套）
(11, 2, '全套合集太香了！收录了所有作品，而且还在持续更新，VIP用户强烈推荐！', 5, 456, '2025-09-02 14:00:00'),
(11, 5, '终于等到全套了！之前单套购买花了不少钱，这次直接买全套划算多了', 5, 378, '2025-09-02 16:30:00'),
(11, 6, '管理员认证过的资源就是不一样，质量有保证，速度也快！', 5, 289, '2025-09-03 09:20:00'),
(11, 9, '全套图集真的很方便，不用一个个找了，一网打尽！', 5, 234, '2025-09-03 12:45:00'),
(11, 10, '持续更新这个很赞！买了一个会员，后面更新还能继续看', 5, 198, '2025-09-04 15:00:00'),
-- 全套图集14的评论（陆萱萱全套）
(14, 1, '陆萱萱的全套太全了！600多张图片，够看很久了', 5, 345, '2025-09-06 10:30:00'),
(14, 8, '画质非常好，每一张都是精心挑选的，没有凑数的', 5, 267, '2025-09-06 14:15:00'),
(14, 7, '推荐给所有喜欢陆萱萱的朋友，这个全套绝对值得入手', 5, 234, '2025-09-07 08:00:00');

-- 插入观看记录
INSERT INTO collection_views (collection_id, user_id, ip_address, viewed_at) VALUES
(1, 1, '192.168.1.100', '2025-09-13 10:00:00'),
(1, 2, '192.168.1.101', '2025-09-13 14:00:00'),
(1, NULL, '192.168.1.102', '2025-09-13 15:00:00'),
(1, 3, '192.168.1.103', '2025-09-13 16:30:00'),
(1, NULL, '192.168.1.104', '2025-09-14 09:00:00'),
(4, 8, '192.168.1.105', '2025-09-12 18:00:00'),
(4, 9, '192.168.1.106', '2025-09-12 20:00:00'),
(6, 1, '192.168.1.107', '2025-09-12 21:30:00'),
(11, 2, '192.168.1.108', '2025-09-02 13:30:00'),
(11, 5, '192.168.1.109', '2025-09-02 16:00:00'),
(11, 6, '192.168.1.110', '2025-09-03 09:00:00'),
(14, 1, '192.168.1.111', '2025-09-06 10:00:00'),
(14, 8, '192.168.1.112', '2025-09-06 14:00:00');

-- =============================================
-- 创建视图：方便查询
-- =============================================

-- 图集详情视图（包含人物信息和预览图）
CREATE OR REPLACE VIEW v_collection_details AS
SELECT 
    pc.id AS collection_id,
    pc.title,
    pc.subtitle,
    pc.type,
    pc.preview_image_count,
    pc.source_no,
    pc.thumbnail_url,
    pc.image_count,
    pc.video_count,
    pc.file_size,
    pc.views_count,
    pc.downloads_count,
    pc.publish_date,
    pc.status,
    c.id AS celebrity_id,
    c.name AS celebrity_name,
    c.alias AS celebrity_alias,
    c.category AS celebrity_category,
    c.avatar_url AS celebrity_avatar,
    (SELECT json_agg(json_build_object(
        'image_url', ci.image_url,
        'display_order', ci.display_order
    ) ORDER BY ci.display_order)
     FROM collection_images ci 
     WHERE ci.collection_id = pc.id) AS preview_images,
    (SELECT json_agg(json_build_object(
        'resource_name', dr.resource_name,
        'baidu_link', dr.baidu_link,
        'extract_code', dr.extract_code,
        'password', dr.password,
        'file_size', dr.file_size,
        'downloads_count', dr.downloads_count
    ))
     FROM download_resources dr 
     WHERE dr.collection_id = pc.id AND dr.is_active = TRUE) AS download_resources
FROM photo_collections pc
JOIN celebrities c ON pc.celebrity_id = c.id;

-- 评论详情视图（包含用户信息）
CREATE OR REPLACE VIEW v_comment_details AS
SELECT 
    cm.id AS comment_id,
    cm.collection_id,
    cm.content,
    cm.rating,
    cm.like_count,
    cm.created_at,
    u.id AS user_id,
    u.username,
    u.avatar_url,
    u.user_level
FROM comments cm
JOIN users u ON cm.user_id = u.id
WHERE cm.is_deleted = FALSE;

-- 相关推荐视图（同一人物的其他图集）
CREATE OR REPLACE VIEW v_related_collections AS
SELECT 
    pc.id AS collection_id,
    pc.title,
    pc.type,
    pc.thumbnail_url,
    pc.image_count,
    pc.views_count,
    pc.downloads_count,
    pc.celebrity_id,
    c.name AS celebrity_name
FROM photo_collections pc
JOIN celebrities c ON pc.celebrity_id = c.id
WHERE pc.status = 'published';

-- =============================================
-- 常用查询示例
-- =============================================

-- 1. 获取图集详情（包含所有需要的信息）
-- SELECT * FROM v_collection_details WHERE collection_id = 1;

-- 2. 获取图集评论列表
-- SELECT * FROM v_comment_details WHERE collection_id = 1 ORDER BY created_at DESC;

-- 3. 获取相关推荐（同人物的其他3个图集，排除当前）
-- SELECT * FROM v_related_collections 
-- WHERE celebrity_id = 1 AND collection_id != 1 
-- ORDER BY views_count DESC LIMIT 3;

-- 4. 获取某人物的所有图集
-- SELECT * FROM photo_collections WHERE celebrity_id = 1 ORDER BY publish_date DESC;

-- 5. 统计某人物的图集数量和总观看次数
-- SELECT c.name, COUNT(pc.id) as total_collections, SUM(pc.views_count) as total_views
-- FROM celebrities c
-- LEFT JOIN photo_collections pc ON c.id = pc.celebrity_id
-- GROUP BY c.id;
