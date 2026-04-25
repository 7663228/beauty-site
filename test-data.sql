-- =============================================
-- 快速测试数据初始化脚本
-- 用于验证摄影机构页面功能
-- =============================================

-- 1. 插入人物数据（按摄影机构分类）
-- Xiuren秀人网
INSERT INTO celebrities (name, alias, category, avatar_url, description, is_verified, total_collections, total_views, popularity_score)
VALUES 
('BoLoLi波萝社_M1', 'BoLoLi_M1', 'BoLoLi波萝社', 'https://picsum.photos/200/200?random=b1', 'BoLoLi波萝社精选模特M1', TRUE, 5, 12345, 8500),
('BoLoLi波萝社_M2', 'BoLoLi_M2', 'BoLoLi波萝社', 'https://picsum.photos/200/200?random=b2', 'BoLoLi波萝社精选模特M2', TRUE, 4, 9876, 7800),
('BoLoLi波萝社_M3', 'BoLoLi_M3', 'BoLoLi波萝社', 'https://picsum.photos/200/200?random=b3', 'BoLoLi波萝社精选模特M3', FALSE, 3, 7654, 7200)
ON CONFLICT DO NOTHING;

-- CANDY糖果画报
INSERT INTO celebrities (name, alias, category, avatar_url, description, is_verified, total_collections, total_views, popularity_score)
VALUES 
('CANDY_S1', 'CANDY_Sugar', 'CANDY糖果画报', 'https://picsum.photos/200/200?random=c1', 'CANDY糖果画报模特S1', TRUE, 6, 15678, 9200),
('CANDY_S2', 'CANDY_Candy', 'CANDY糖果画报', 'https://picsum.photos/200/200?random=c2', 'CANDY糖果画报模特S2', FALSE, 4, 12345, 8600)
ON CONFLICT DO NOTHING;

-- HUAYANG花漾
INSERT INTO celebrities (name, alias, category, avatar_url, description, is_verified, total_collections, total_views, popularity_score)
VALUES 
('花漾_糯叽叽', 'NuoJiJi', 'HUAYANG花漾', 'https://picsum.photos/200/200?random=h1', 'HUAYANG花漾签约模特，清新甜美', TRUE, 7, 19876, 9800),
('花漾_小七', 'XiaoQi', 'HUAYANG花漾', 'https://picsum.photos/200/200?random=h2', 'HUAYANG花漾当家花旦', TRUE, 8, 23456, 10500),
('花漾_甜甜', 'TianTian', 'HUAYANG花漾', 'https://picsum.photos/200/200?random=h3', 'HUAYANG花漾人气模特', FALSE, 5, 16789, 8900)
ON CONFLICT DO NOTHING;

-- MiiTao蜜桃社
INSERT INTO celebrities (name, alias, category, avatar_url, description, is_verified, total_collections, total_views, popularity_score)
VALUES 
('蜜桃_白袜小甜', 'BaiWaXiaoTian', 'MiiTao蜜桃社', 'https://picsum.photos/200/200?random=m1', 'MiiTao蜜桃社模特，甜美可爱风格', TRUE, 6, 18765, 9200),
('蜜桃_兔兔酱', 'TuTuJiang', 'MiiTao蜜桃社', 'https://picsum.photos/200/200?random=m2', 'MiiTao蜜桃社新晋模特，清新自然', FALSE, 3, 9876, 7800)
ON CONFLICT DO NOTHING;

-- 2. 插入图集数据（关联不同摄影机构）
-- BoLoLi波萝社的图集
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status)
VALUES 
((SELECT id FROM celebrities WHERE alias = 'BoLoLi_M1'), 'BoLoLi波萝社 M1 NO.001', 'BoLoLi波萝社 甜美清新系列 [80P1V]', 'single', 3, 'BOLO001', 'https://picsum.photos/300/400?random=bolo1', 80, 1, '856MB', 4567, 234, '2025-09-15', 'published'),
((SELECT id FROM celebrities WHERE alias = 'BoLoLi_M1'), 'BoLoLi波萝社 M1 NO.002', 'BoLoLi波萝社 户外阳光系列 [75P]', 'single', 3, 'BOLO002', 'https://picsum.photos/300/400?random=bolo2', 75, 0, '723MB', 3456, 198, '2025-09-10', 'published'),
((SELECT id FROM celebrities WHERE alias = 'BoLoLi_M2'), 'BoLoLi波萝社 M2 NO.001', 'BoLoLi波萝社 精致妆容系列 [90P2V]', 'single', 3, 'BOLO003', 'https://picsum.photos/300/400?random=bolo3', 90, 2, '1.2GB', 5678, 345, '2025-09-12', 'published'),
((SELECT id FROM celebrities WHERE alias = 'BoLoLi_M3'), 'BoLoLi波萝社 M3 NO.001', 'BoLoLi波萝社 可爱风格 [65P]', 'single', 3, 'BOLO004', 'https://picsum.photos/300/400?random=bolo4', 65, 0, '567MB', 2345, 123, '2025-09-08', 'published')
ON CONFLICT DO NOTHING;

-- CANDY糖果画报的图集
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status)
VALUES 
((SELECT id FROM celebrities WHERE alias = 'CANDY_Sugar'), 'CANDY糖果 S1 NO.001', 'CANDY糖果画报 甜美风格 [85P1V]', 'single', 3, 'CANDY001', 'https://picsum.photos/300/400?random=candy1', 85, 1, '934MB', 6789, 456, '2025-09-14', 'published'),
((SELECT id FROM celebrities WHERE alias = 'CANDY_Sugar'), 'CANDY糖果 S1 NO.002', 'CANDY糖果画报 清新系列 [70P]', 'single', 3, 'CANDY002', 'https://picsum.photos/300/400?random=candy2', 70, 0, '645MB', 4567, 289, '2025-09-11', 'published'),
((SELECT id FROM celebrities WHERE alias = 'CANDY_Candy'), 'CANDY糖果 S2 NO.001', 'CANDY糖果画报 萝莉风格 [60P2V]', 'single', 3, 'CANDY003', 'https://picsum.photos/300/400?random=candy3', 60, 2, '789MB', 5678, 378, '2025-09-13', 'published')
ON CONFLICT DO NOTHING;

-- HUAYANG花漾的图集
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status)
VALUES 
((SELECT id FROM celebrities WHERE alias = 'NuoJiJi'), '糯叽叽 NO.001', 'HUAYANG花漾 清新甜美系列 [95P1V]', 'single', 3, 'HUAY001', 'https://picsum.photos/300/400?random=huay1', 95, 1, '1.1GB', 8765, 567, '2025-09-15', 'published'),
((SELECT id FROM celebrities WHERE alias = 'NuoJiJi'), '糯叽叽 NO.002', 'HUAYANG花漾 海边度假系列 [88P2V]', 'single', 3, 'HUAY002', 'https://picsum.photos/300/400?random=huay2', 88, 2, '1.3GB', 7654, 489, '2025-09-10', 'published'),
((SELECT id FROM celebrities WHERE alias = 'NuoJiJi'), '糯叽叽 全套合集', 'HUAYANG花漾 糯叽叽全部作品 [550P+35V]', 'full', 10, 'HUAY-F001', 'https://picsum.photos/300/400?random=huay3', 550, 35, '5.8GB', 12345, 3456, '2025-09-01', 'published'),
((SELECT id FROM celebrities WHERE alias = 'XiaoQi'), '小七 NO.001', 'HUAYANG花漾 元气少女系列 [100P2V]', 'single', 3, 'HUAY003', 'https://picsum.photos/300/400?random=huay4', 100, 2, '1.5GB', 9876, 678, '2025-09-14', 'published'),
((SELECT id FROM celebrities WHERE alias = 'TianTian'), '甜甜 NO.001', 'HUAYANG花漾 甜美风格 [78P]', 'single', 3, 'HUAY004', 'https://picsum.photos/300/400?random=huay5', 78, 0, '723MB', 6543, 423, '2025-09-12', 'published')
ON CONFLICT DO NOTHING;

-- MiiTao蜜桃社的图集
INSERT INTO photo_collections (celebrity_id, title, subtitle, type, preview_image_count, source_no, thumbnail_url, image_count, video_count, file_size, views_count, downloads_count, publish_date, status)
VALUES 
((SELECT id FROM celebrities WHERE alias = 'BaiWaXiaoTian'), '白袜小甜 NO.001', 'MiiTao蜜桃社 甜美清新系列 [82P]', 'single', 3, 'MII001', 'https://picsum.photos/300/400?random=mi1', 82, 0, '876MB', 5678, 345, '2025-09-15', 'published'),
((SELECT id FROM celebrities WHERE alias = 'BaiWaXiaoTian'), '白袜小甜 NO.002', 'MiiTao蜜桃社 户外阳光系列 [90P1V]', 'single', 3, 'MII002', 'https://picsum.photos/300/400?random=mi2', 90, 1, '1.1GB', 4567, 289, '2025-09-11', 'published'),
((SELECT id FROM celebrities WHERE alias = 'TuTuJiang'), '兔兔酱 NO.001', 'MiiTao蜜桃社 可爱萌系 [68P]', 'single', 3, 'MII003', 'https://picsum.photos/300/400?random=mi3', 68, 0, '567MB', 3456, 234, '2025-09-13', 'published')
ON CONFLICT DO NOTHING;

-- 3. 插入预览图片
INSERT INTO collection_images (collection_id, image_url, display_order)
SELECT c.id, c.thumbnail_url || '-preview-' || gs.n, gs.n
FROM photo_collections c
CROSS JOIN (SELECT generate_series(1, 3) as n) gs
WHERE c.type = 'single'
ON CONFLICT DO NOTHING;

INSERT INTO collection_images (collection_id, image_url, display_order)
SELECT c.id, c.thumbnail_url || '-preview-' || gs.n, gs.n
FROM photo_collections c
CROSS JOIN (SELECT generate_series(1, 10) as n) gs
WHERE c.type = 'full'
ON CONFLICT DO NOTHING;

-- 4. 插入下载资源
INSERT INTO download_resources (collection_id, resource_name, baidu_link, extract_code, password, file_type, file_size, downloads_count)
SELECT 
    c.id,
    c.title || ' 下载资源',
    'https://pan.baidu.com/s/test' || c.id,
    'test',
    '解压密码: beauty',
    'image',
    c.file_size,
    c.downloads_count
FROM photo_collections c
ON CONFLICT DO NOTHING;

-- 5. 打印验证信息
DO $$
DECLARE
    v_bolo_count INTEGER;
    v_candy_count INTEGER;
    v_huayang_count INTEGER;
    v_miitao_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_bolo_count FROM celebrities WHERE category = 'BoLoLi波萝社';
    SELECT COUNT(*) INTO v_candy_count FROM celebrities WHERE category = 'CANDY糖果画报';
    SELECT COUNT(*) INTO v_huayang_count FROM celebrities WHERE category = 'HUAYANG花漾';
    SELECT COUNT(*) INTO v_miitao_count FROM celebrities WHERE category = 'MiiTao蜜桃社';
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================';
    RAISE NOTICE '测试数据初始化完成！';
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'BoLoLi波萝社: % 位模特', v_bolo_count;
    RAISE NOTICE 'CANDY糖果画报: % 位模特', v_candy_count;
    RAISE NOTICE 'HUAYANG花漾: % 位模特', v_huayang_count;
    RAISE NOTICE 'MiiTao蜜桃社: % 位模特', v_miitao_count;
    RAISE NOTICE '';
    RAISE NOTICE '测试URL：';
    RAISE NOTICE '  /xiuren/bololi  - BoLoLi波萝社';
    RAISE NOTICE '  /xiuren/candy   - CANDY糖果画报';
    RAISE NOTICE '  /xiuren/huayang - HUAYANG花漾';
    RAISE NOTICE '  /xiuren/miitao  - MiiTao蜜桃社';
    RAISE NOTICE '=============================================';
END $$;
