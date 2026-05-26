-- Migration 008: 初期ワールドデータ

-- 国家を5つ作成
INSERT INTO nations (id, name, military_power, economic_power, diplomatic_skill, tax_rate, security_level) VALUES
  ('11111111-1111-1111-1111-111111111111', 'アルディア王国',   60, 70, 65, 10, 70),
  ('22222222-2222-2222-2222-222222222222', 'ベルン共和国',     50, 80, 75, 8,  65),
  ('33333333-3333-3333-3333-333333333333', 'ドラゴニア帝国',   80, 60, 40, 15, 55),
  ('44444444-4444-4444-4444-444444444444', 'エルフの森',       40, 65, 85, 7,  80),
  ('55555555-5555-5555-5555-555555555555', 'ドワーフの山岳国', 70, 75, 50, 12, 75)
ON CONFLICT (id) DO NOTHING;

-- 各国に村を3つずつ作成
INSERT INTO villages (id, nation_id, name, development_level, population, food_stock, security_level, economy_level, terrain_type, coordinates) VALUES
  -- アルディア王国
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'グリーンヴェール', 5, 120, 200, 70, 65, 'PLAIN',    '{"x": 10, "y": 20}'),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'リバーサイド',     4, 80,  150, 65, 60, 'RIVER',    '{"x": 15, "y": 25}'),
  ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'ハイランド',       3, 60,  100, 60, 55, 'MOUNTAIN', '{"x": 20, "y": 15}'),
  -- ベルン共和国
  ('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'マーケットタウン', 6, 200, 300, 65, 80, 'PLAIN',    '{"x": 40, "y": 20}'),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'フィッシャーズベイ',3, 70,  120, 60, 65, 'RIVER',    '{"x": 45, "y": 30}'),
  ('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'フォレストエッジ', 4, 90,  160, 70, 60, 'FOREST',   '{"x": 35, "y": 25}'),
  -- ドラゴニア帝国
  ('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'ドラゴンズネスト', 7, 300, 400, 55, 70, 'MOUNTAIN', '{"x": 70, "y": 10}'),
  ('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'アッシュフィールド',4, 100, 180, 50, 60, 'PLAIN',    '{"x": 75, "y": 20}'),
  ('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'ボーダータウン',   3, 80,  130, 45, 55, 'PLAIN',    '{"x": 65, "y": 25}'),
  -- エルフの森
  ('d1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'シルバーリーフ',   5, 100, 250, 80, 65, 'FOREST',   '{"x": 20, "y": 60}'),
  ('d2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'ムーンクリア',     4, 70,  180, 85, 60, 'FOREST',   '{"x": 25, "y": 70}'),
  -- ドワーフの山岳国
  ('e1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'アイアンフォージ', 6, 150, 200, 75, 75, 'MOUNTAIN', '{"x": 60, "y": 60}'),
  ('e2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'ストーンゲート',   5, 120, 180, 70, 70, 'MOUNTAIN', '{"x": 65, "y": 70}')
ON CONFLICT (id) DO NOTHING;

-- 各村にNPCを配置
INSERT INTO npcs (village_id, name, role, personality_params) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'トーマス老人', 'ELDER',       '{"openness": 70}'),
  ('a1111111-1111-1111-1111-111111111111', 'マリア',       'MERCHANT',    '{"openness": 60}'),
  ('a1111111-1111-1111-1111-111111111111', 'ガレス',       'BLACKSMITH',  '{"openness": 50}'),
  ('a1111111-1111-1111-1111-111111111111', 'エレナ',       'DOCTOR',      '{"openness": 80}'),
  ('a1111111-1111-1111-1111-111111111111', '神父ルーカス', 'PRIEST',      '{"openness": 75}'),
  ('b1111111-1111-1111-1111-111111111111', 'ヴィクター',   'MERCHANT',    '{"openness": 65}'),
  ('b1111111-1111-1111-1111-111111111111', 'ソフィア',     'MAGE',        '{"openness": 55}'),
  ('c1111111-1111-1111-1111-111111111111', '将軍ブラック', 'KNIGHT',      '{"openness": 40}'),
  ('d1111111-1111-1111-1111-111111111111', 'エルダーリン', 'MAGE',        '{"openness": 85}'),
  ('e1111111-1111-1111-1111-111111111111', 'ドゥリン',     'BLACKSMITH',  '{"openness": 60}')
ON CONFLICT DO NOTHING;

-- 各村に市場データを設定
INSERT INTO market_listings (village_id, item_template_id, stock_quantity, current_price, base_price)
SELECT v.id, it.id, 20, it.base_price, it.base_price
FROM villages v
CROSS JOIN item_templates it
WHERE it.name IN ('POTATO', 'WHEAT', 'BREAD', 'MEAT', 'HERB', 'WATER', 'IRON_ORE', 'WOOD', 'SWORD', 'ARMOR', 'FUR_COAT')
ON CONFLICT (village_id, item_template_id) DO NOTHING;

-- 各村に農地を設定
INSERT INTO lands (village_id, land_type, purchase_price, rent_price_per_day, status)
SELECT v.id, 'FARM', 100, 5, 'UNOWNED'
FROM villages v
CROSS JOIN generate_series(1, 5)
ON CONFLICT DO NOTHING;

-- 各村に住居用地を設定
INSERT INTO lands (village_id, land_type, purchase_price, rent_price_per_day, status)
SELECT v.id, 'RESIDENTIAL', 200, 10, 'UNOWNED'
FROM villages v
CROSS JOIN generate_series(1, 3)
ON CONFLICT DO NOTHING;

-- 外交状態の初期化（全国家間をNEUTRALに）
INSERT INTO diplomacy_states (nation_a_id, nation_b_id, state)
SELECT a.id, b.id, 'NEUTRAL'
FROM nations a CROSS JOIN nations b
WHERE a.id < b.id
ON CONFLICT (nation_a_id, nation_b_id) DO NOTHING;
