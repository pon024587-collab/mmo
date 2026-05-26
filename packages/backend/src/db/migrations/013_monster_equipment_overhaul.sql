-- Migration 013: 全魔物の素材と装備一式

-- スライム のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'スライムの皮', 'MATERIAL', 'スライムから剥ぎ取った一般的な皮。', 10, 1),
  (gen_random_uuid(), 'スライムの骨', 'MATERIAL', 'スライムから剥ぎ取った一般的な骨。', 10, 1),
  (gen_random_uuid(), 'スライムの鋭牙', 'MATERIAL', 'スライムの稀少な部位。', 100, 1),
  (gen_random_uuid(), 'スライムの魔核', 'MATERIAL', 'スライムの体内にある幻の魔核。', 1000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'スライムの武器', 'WEAPON', 'WEAPON_SWORD', 'スライムの素材で作られた強力な武器。', 250, 5, '{"attack": 7, "elementalAttack": "WATER", "elementalAttackValue": 2}'::jsonb),
  (gen_random_uuid(), 'スライムの防具', 'ARMOR', NULL, 'スライムの素材で作られた堅牢な防具。', 250, 8, '{"defense": 6, "elementalResistance": "ICE", "elementalResistanceValue": 2}'::jsonb),
  (gen_random_uuid(), 'スライムの装飾', 'ACCESSORY', NULL, 'スライムの魔核を用いた装飾品。', 400, 1, '{"attack": 2, "defense": 2, "elementalAttack": "WATER", "elementalAttackValue": 1, "elementalResistance": "ICE", "elementalResistanceValue": 1}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'スライムの武器', id, '[{"name":"スライムの皮","quantity":5},{"name":"スライムの骨","quantity":3},{"name":"スライムの鋭牙","quantity":1}]'::jsonb, 0, 'スライムの武器のレシピ' FROM item_templates WHERE name = 'スライムの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'スライムの防具', id, '[{"name":"スライムの皮","quantity":8},{"name":"スライムの鋭牙","quantity":1}]'::jsonb, 0, 'スライムの防具のレシピ' FROM item_templates WHERE name = 'スライムの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'スライムの装飾', id, '[{"name":"スライムの骨","quantity":3},{"name":"スライムの鋭牙","quantity":2},{"name":"スライムの魔核","quantity":1}]'::jsonb, 0, 'スライムの装飾のレシピ' FROM item_templates WHERE name = 'スライムの装飾' LIMIT 1;

-- コウモリ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'コウモリの皮', 'MATERIAL', 'コウモリから剥ぎ取った一般的な皮。', 16, 1),
  (gen_random_uuid(), 'コウモリの骨', 'MATERIAL', 'コウモリから剥ぎ取った一般的な骨。', 16, 1),
  (gen_random_uuid(), 'コウモリの鋭牙', 'MATERIAL', 'コウモリの稀少な部位。', 160, 1),
  (gen_random_uuid(), 'コウモリの魔核', 'MATERIAL', 'コウモリの体内にある幻の魔核。', 1600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'コウモリの武器', 'WEAPON', 'WEAPON_SWORD', 'コウモリの素材で作られた強力な武器。', 400, 5, '{"attack": 12, "elementalAttack": "WIND", "elementalAttackValue": 4}'::jsonb),
  (gen_random_uuid(), 'コウモリの防具', 'ARMOR', NULL, 'コウモリの素材で作られた堅牢な防具。', 400, 8, '{"defense": 9, "elementalResistance": "DARK", "elementalResistanceValue": 4}'::jsonb),
  (gen_random_uuid(), 'コウモリの装飾', 'ACCESSORY', NULL, 'コウモリの魔核を用いた装飾品。', 640, 1, '{"attack": 4, "defense": 3, "elementalAttack": "WIND", "elementalAttackValue": 1, "elementalResistance": "DARK", "elementalResistanceValue": 1}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コウモリの武器', id, '[{"name":"コウモリの皮","quantity":5},{"name":"コウモリの骨","quantity":3},{"name":"コウモリの鋭牙","quantity":1}]'::jsonb, 0, 'コウモリの武器のレシピ' FROM item_templates WHERE name = 'コウモリの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コウモリの防具', id, '[{"name":"コウモリの皮","quantity":8},{"name":"コウモリの鋭牙","quantity":1}]'::jsonb, 0, 'コウモリの防具のレシピ' FROM item_templates WHERE name = 'コウモリの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コウモリの装飾', id, '[{"name":"コウモリの骨","quantity":3},{"name":"コウモリの鋭牙","quantity":2},{"name":"コウモリの魔核","quantity":1}]'::jsonb, 0, 'コウモリの装飾のレシピ' FROM item_templates WHERE name = 'コウモリの装飾' LIMIT 1;

-- 大ネズミ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '大ネズミの皮', 'MATERIAL', '大ネズミから剥ぎ取った一般的な皮。', 16, 1),
  (gen_random_uuid(), '大ネズミの骨', 'MATERIAL', '大ネズミから剥ぎ取った一般的な骨。', 16, 1),
  (gen_random_uuid(), '大ネズミの鋭牙', 'MATERIAL', '大ネズミの稀少な部位。', 160, 1),
  (gen_random_uuid(), '大ネズミの魔核', 'MATERIAL', '大ネズミの体内にある幻の魔核。', 1600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '大ネズミの武器', 'WEAPON', 'WEAPON_SWORD', '大ネズミの素材で作られた強力な武器。', 400, 5, '{"attack": 12, "elementalAttack": "EARTH", "elementalAttackValue": 4}'::jsonb),
  (gen_random_uuid(), '大ネズミの防具', 'ARMOR', NULL, '大ネズミの素材で作られた堅牢な防具。', 400, 8, '{"defense": 9, "elementalResistance": "DARK", "elementalResistanceValue": 4}'::jsonb),
  (gen_random_uuid(), '大ネズミの装飾', 'ACCESSORY', NULL, '大ネズミの魔核を用いた装飾品。', 640, 1, '{"attack": 4, "defense": 3, "elementalAttack": "EARTH", "elementalAttackValue": 1, "elementalResistance": "DARK", "elementalResistanceValue": 1}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '大ネズミの武器', id, '[{"name":"大ネズミの皮","quantity":5},{"name":"大ネズミの骨","quantity":3},{"name":"大ネズミの鋭牙","quantity":1}]'::jsonb, 0, '大ネズミの武器のレシピ' FROM item_templates WHERE name = '大ネズミの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '大ネズミの防具', id, '[{"name":"大ネズミの皮","quantity":8},{"name":"大ネズミの鋭牙","quantity":1}]'::jsonb, 0, '大ネズミの防具のレシピ' FROM item_templates WHERE name = '大ネズミの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '大ネズミの装飾', id, '[{"name":"大ネズミの骨","quantity":3},{"name":"大ネズミの鋭牙","quantity":2},{"name":"大ネズミの魔核","quantity":1}]'::jsonb, 0, '大ネズミの装飾のレシピ' FROM item_templates WHERE name = '大ネズミの装飾' LIMIT 1;

-- ゴブリン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゴブリンの皮', 'MATERIAL', 'ゴブリンから剥ぎ取った一般的な皮。', 20, 1),
  (gen_random_uuid(), 'ゴブリンの骨', 'MATERIAL', 'ゴブリンから剥ぎ取った一般的な骨。', 20, 1),
  (gen_random_uuid(), 'ゴブリンの鋭牙', 'MATERIAL', 'ゴブリンの稀少な部位。', 200, 1),
  (gen_random_uuid(), 'ゴブリンの魔核', 'MATERIAL', 'ゴブリンの体内にある幻の魔核。', 2000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ゴブリンの武器', 'WEAPON', 'WEAPON_SWORD', 'ゴブリンの素材で作られた強力な武器。', 500, 5, '{"attack": 15, "elementalAttack": "EARTH", "elementalAttackValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゴブリンの防具', 'ARMOR', NULL, 'ゴブリンの素材で作られた堅牢な防具。', 500, 8, '{"defense": 12, "elementalResistance": "FIRE", "elementalResistanceValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゴブリンの装飾', 'ACCESSORY', NULL, 'ゴブリンの魔核を用いた装飾品。', 800, 1, '{"attack": 5, "defense": 4, "elementalAttack": "EARTH", "elementalAttackValue": 2, "elementalResistance": "FIRE", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゴブリンの武器', id, '[{"name":"ゴブリンの皮","quantity":5},{"name":"ゴブリンの骨","quantity":3},{"name":"ゴブリンの鋭牙","quantity":1}]'::jsonb, 0, 'ゴブリンの武器のレシピ' FROM item_templates WHERE name = 'ゴブリンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゴブリンの防具', id, '[{"name":"ゴブリンの皮","quantity":8},{"name":"ゴブリンの鋭牙","quantity":1}]'::jsonb, 0, 'ゴブリンの防具のレシピ' FROM item_templates WHERE name = 'ゴブリンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゴブリンの装飾', id, '[{"name":"ゴブリンの骨","quantity":3},{"name":"ゴブリンの鋭牙","quantity":2},{"name":"ゴブリンの魔核","quantity":1}]'::jsonb, 0, 'ゴブリンの装飾のレシピ' FROM item_templates WHERE name = 'ゴブリンの装飾' LIMIT 1;

-- スケルトン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'スケルトンの皮', 'MATERIAL', 'スケルトンから剥ぎ取った一般的な皮。', 20, 1),
  (gen_random_uuid(), 'スケルトンの骨', 'MATERIAL', 'スケルトンから剥ぎ取った一般的な骨。', 20, 1),
  (gen_random_uuid(), 'スケルトンの鋭牙', 'MATERIAL', 'スケルトンの稀少な部位。', 200, 1),
  (gen_random_uuid(), 'スケルトンの魔核', 'MATERIAL', 'スケルトンの体内にある幻の魔核。', 2000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'スケルトンの武器', 'WEAPON', 'WEAPON_SWORD', 'スケルトンの素材で作られた強力な武器。', 500, 5, '{"attack": 15, "elementalAttack": "DARK", "elementalAttackValue": 5}'::jsonb),
  (gen_random_uuid(), 'スケルトンの防具', 'ARMOR', NULL, 'スケルトンの素材で作られた堅牢な防具。', 500, 8, '{"defense": 12, "elementalResistance": "EARTH", "elementalResistanceValue": 5}'::jsonb),
  (gen_random_uuid(), 'スケルトンの装飾', 'ACCESSORY', NULL, 'スケルトンの魔核を用いた装飾品。', 800, 1, '{"attack": 5, "defense": 4, "elementalAttack": "DARK", "elementalAttackValue": 2, "elementalResistance": "EARTH", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'スケルトンの武器', id, '[{"name":"スケルトンの皮","quantity":5},{"name":"スケルトンの骨","quantity":3},{"name":"スケルトンの鋭牙","quantity":1}]'::jsonb, 0, 'スケルトンの武器のレシピ' FROM item_templates WHERE name = 'スケルトンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'スケルトンの防具', id, '[{"name":"スケルトンの皮","quantity":8},{"name":"スケルトンの鋭牙","quantity":1}]'::jsonb, 0, 'スケルトンの防具のレシピ' FROM item_templates WHERE name = 'スケルトンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'スケルトンの装飾', id, '[{"name":"スケルトンの骨","quantity":3},{"name":"スケルトンの鋭牙","quantity":2},{"name":"スケルトンの魔核","quantity":1}]'::jsonb, 0, 'スケルトンの装飾のレシピ' FROM item_templates WHERE name = 'スケルトンの装飾' LIMIT 1;

-- ゾンビ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゾンビの皮', 'MATERIAL', 'ゾンビから剥ぎ取った一般的な皮。', 20, 1),
  (gen_random_uuid(), 'ゾンビの骨', 'MATERIAL', 'ゾンビから剥ぎ取った一般的な骨。', 20, 1),
  (gen_random_uuid(), 'ゾンビの鋭牙', 'MATERIAL', 'ゾンビの稀少な部位。', 200, 1),
  (gen_random_uuid(), 'ゾンビの魔核', 'MATERIAL', 'ゾンビの体内にある幻の魔核。', 2000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ゾンビの武器', 'WEAPON', 'WEAPON_SWORD', 'ゾンビの素材で作られた強力な武器。', 500, 5, '{"attack": 15, "elementalAttack": "DARK", "elementalAttackValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゾンビの防具', 'ARMOR', NULL, 'ゾンビの素材で作られた堅牢な防具。', 500, 8, '{"defense": 12, "elementalResistance": "WATER", "elementalResistanceValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゾンビの装飾', 'ACCESSORY', NULL, 'ゾンビの魔核を用いた装飾品。', 800, 1, '{"attack": 5, "defense": 4, "elementalAttack": "DARK", "elementalAttackValue": 2, "elementalResistance": "WATER", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゾンビの武器', id, '[{"name":"ゾンビの皮","quantity":5},{"name":"ゾンビの骨","quantity":3},{"name":"ゾンビの鋭牙","quantity":1}]'::jsonb, 0, 'ゾンビの武器のレシピ' FROM item_templates WHERE name = 'ゾンビの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゾンビの防具', id, '[{"name":"ゾンビの皮","quantity":8},{"name":"ゾンビの鋭牙","quantity":1}]'::jsonb, 0, 'ゾンビの防具のレシピ' FROM item_templates WHERE name = 'ゾンビの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゾンビの装飾', id, '[{"name":"ゾンビの骨","quantity":3},{"name":"ゾンビの鋭牙","quantity":2},{"name":"ゾンビの魔核","quantity":1}]'::jsonb, 0, 'ゾンビの装飾のレシピ' FROM item_templates WHERE name = 'ゾンビの装飾' LIMIT 1;

-- 毒蜘蛛 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '毒蜘蛛の皮', 'MATERIAL', '毒蜘蛛から剥ぎ取った一般的な皮。', 24, 1),
  (gen_random_uuid(), '毒蜘蛛の骨', 'MATERIAL', '毒蜘蛛から剥ぎ取った一般的な骨。', 24, 1),
  (gen_random_uuid(), '毒蜘蛛の鋭牙', 'MATERIAL', '毒蜘蛛の稀少な部位。', 240, 1),
  (gen_random_uuid(), '毒蜘蛛の魔核', 'MATERIAL', '毒蜘蛛の体内にある幻の魔核。', 2400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '毒蜘蛛の武器', 'WEAPON', 'WEAPON_SWORD', '毒蜘蛛の素材で作られた強力な武器。', 600, 5, '{"attack": 18, "elementalAttack": "DARK", "elementalAttackValue": 6}'::jsonb),
  (gen_random_uuid(), '毒蜘蛛の防具', 'ARMOR', NULL, '毒蜘蛛の素材で作られた堅牢な防具。', 600, 8, '{"defense": 14, "elementalResistance": "EARTH", "elementalResistanceValue": 6}'::jsonb),
  (gen_random_uuid(), '毒蜘蛛の装飾', 'ACCESSORY', NULL, '毒蜘蛛の魔核を用いた装飾品。', 960, 1, '{"attack": 6, "defense": 4, "elementalAttack": "DARK", "elementalAttackValue": 2, "elementalResistance": "EARTH", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '毒蜘蛛の武器', id, '[{"name":"毒蜘蛛の皮","quantity":5},{"name":"毒蜘蛛の骨","quantity":3},{"name":"毒蜘蛛の鋭牙","quantity":1}]'::jsonb, 0, '毒蜘蛛の武器のレシピ' FROM item_templates WHERE name = '毒蜘蛛の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '毒蜘蛛の防具', id, '[{"name":"毒蜘蛛の皮","quantity":8},{"name":"毒蜘蛛の鋭牙","quantity":1}]'::jsonb, 0, '毒蜘蛛の防具のレシピ' FROM item_templates WHERE name = '毒蜘蛛の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '毒蜘蛛の装飾', id, '[{"name":"毒蜘蛛の骨","quantity":3},{"name":"毒蜘蛛の鋭牙","quantity":2},{"name":"毒蜘蛛の魔核","quantity":1}]'::jsonb, 0, '毒蜘蛛の装飾のレシピ' FROM item_templates WHERE name = '毒蜘蛛の装飾' LIMIT 1;

-- コボルト のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'コボルトの皮', 'MATERIAL', 'コボルトから剥ぎ取った一般的な皮。', 24, 1),
  (gen_random_uuid(), 'コボルトの骨', 'MATERIAL', 'コボルトから剥ぎ取った一般的な骨。', 24, 1),
  (gen_random_uuid(), 'コボルトの鋭牙', 'MATERIAL', 'コボルトの稀少な部位。', 240, 1),
  (gen_random_uuid(), 'コボルトの魔核', 'MATERIAL', 'コボルトの体内にある幻の魔核。', 2400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'コボルトの武器', 'WEAPON', 'WEAPON_SWORD', 'コボルトの素材で作られた強力な武器。', 600, 5, '{"attack": 18, "elementalAttack": "EARTH", "elementalAttackValue": 6}'::jsonb),
  (gen_random_uuid(), 'コボルトの防具', 'ARMOR', NULL, 'コボルトの素材で作られた堅牢な防具。', 600, 8, '{"defense": 14, "elementalResistance": "WIND", "elementalResistanceValue": 6}'::jsonb),
  (gen_random_uuid(), 'コボルトの装飾', 'ACCESSORY', NULL, 'コボルトの魔核を用いた装飾品。', 960, 1, '{"attack": 6, "defense": 4, "elementalAttack": "EARTH", "elementalAttackValue": 2, "elementalResistance": "WIND", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コボルトの武器', id, '[{"name":"コボルトの皮","quantity":5},{"name":"コボルトの骨","quantity":3},{"name":"コボルトの鋭牙","quantity":1}]'::jsonb, 0, 'コボルトの武器のレシピ' FROM item_templates WHERE name = 'コボルトの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コボルトの防具', id, '[{"name":"コボルトの皮","quantity":8},{"name":"コボルトの鋭牙","quantity":1}]'::jsonb, 0, 'コボルトの防具のレシピ' FROM item_templates WHERE name = 'コボルトの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コボルトの装飾', id, '[{"name":"コボルトの骨","quantity":3},{"name":"コボルトの鋭牙","quantity":2},{"name":"コボルトの魔核","quantity":1}]'::jsonb, 0, 'コボルトの装飾のレシピ' FROM item_templates WHERE name = 'コボルトの装飾' LIMIT 1;

-- ホブゴブリン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ホブゴブリンの皮', 'MATERIAL', 'ホブゴブリンから剥ぎ取った一般的な皮。', 26, 1),
  (gen_random_uuid(), 'ホブゴブリンの骨', 'MATERIAL', 'ホブゴブリンから剥ぎ取った一般的な骨。', 26, 1),
  (gen_random_uuid(), 'ホブゴブリンの鋭牙', 'MATERIAL', 'ホブゴブリンの稀少な部位。', 260, 1),
  (gen_random_uuid(), 'ホブゴブリンの魔核', 'MATERIAL', 'ホブゴブリンの体内にある幻の魔核。', 2600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ホブゴブリンの武器', 'WEAPON', 'WEAPON_SWORD', 'ホブゴブリンの素材で作られた強力な武器。', 650, 5, '{"attack": 19, "elementalAttack": "EARTH", "elementalAttackValue": 6}'::jsonb),
  (gen_random_uuid(), 'ホブゴブリンの防具', 'ARMOR', NULL, 'ホブゴブリンの素材で作られた堅牢な防具。', 650, 8, '{"defense": 15, "elementalResistance": "FIRE", "elementalResistanceValue": 6}'::jsonb),
  (gen_random_uuid(), 'ホブゴブリンの装飾', 'ACCESSORY', NULL, 'ホブゴブリンの魔核を用いた装飾品。', 1040, 1, '{"attack": 6, "defense": 5, "elementalAttack": "EARTH", "elementalAttackValue": 2, "elementalResistance": "FIRE", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ホブゴブリンの武器', id, '[{"name":"ホブゴブリンの皮","quantity":5},{"name":"ホブゴブリンの骨","quantity":3},{"name":"ホブゴブリンの鋭牙","quantity":1}]'::jsonb, 0, 'ホブゴブリンの武器のレシピ' FROM item_templates WHERE name = 'ホブゴブリンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ホブゴブリンの防具', id, '[{"name":"ホブゴブリンの皮","quantity":8},{"name":"ホブゴブリンの鋭牙","quantity":1}]'::jsonb, 0, 'ホブゴブリンの防具のレシピ' FROM item_templates WHERE name = 'ホブゴブリンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ホブゴブリンの装飾', id, '[{"name":"ホブゴブリンの骨","quantity":3},{"name":"ホブゴブリンの鋭牙","quantity":2},{"name":"ホブゴブリンの魔核","quantity":1}]'::jsonb, 0, 'ホブゴブリンの装飾のレシピ' FROM item_templates WHERE name = 'ホブゴブリンの装飾' LIMIT 1;

-- 狼 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '狼の皮', 'MATERIAL', '狼から剥ぎ取った一般的な皮。', 30, 1),
  (gen_random_uuid(), '狼の骨', 'MATERIAL', '狼から剥ぎ取った一般的な骨。', 30, 1),
  (gen_random_uuid(), '狼の鋭牙', 'MATERIAL', '狼の稀少な部位。', 300, 1),
  (gen_random_uuid(), '狼の魔核', 'MATERIAL', '狼の体内にある幻の魔核。', 3000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '狼の武器', 'WEAPON', 'WEAPON_SWORD', '狼の素材で作られた強力な武器。', 750, 5, '{"attack": 22, "elementalAttack": "WIND", "elementalAttackValue": 7}'::jsonb),
  (gen_random_uuid(), '狼の防具', 'ARMOR', NULL, '狼の素材で作られた堅牢な防具。', 750, 8, '{"defense": 18, "elementalResistance": "ICE", "elementalResistanceValue": 7}'::jsonb),
  (gen_random_uuid(), '狼の装飾', 'ACCESSORY', NULL, '狼の魔核を用いた装飾品。', 1200, 1, '{"attack": 7, "defense": 6, "elementalAttack": "WIND", "elementalAttackValue": 3, "elementalResistance": "ICE", "elementalResistanceValue": 3}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '狼の武器', id, '[{"name":"狼の皮","quantity":5},{"name":"狼の骨","quantity":3},{"name":"狼の鋭牙","quantity":1}]'::jsonb, 0, '狼の武器のレシピ' FROM item_templates WHERE name = '狼の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '狼の防具', id, '[{"name":"狼の皮","quantity":8},{"name":"狼の鋭牙","quantity":1}]'::jsonb, 0, '狼の防具のレシピ' FROM item_templates WHERE name = '狼の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '狼の装飾', id, '[{"name":"狼の骨","quantity":3},{"name":"狼の鋭牙","quantity":2},{"name":"狼の魔核","quantity":1}]'::jsonb, 0, '狼の装飾のレシピ' FROM item_templates WHERE name = '狼の装飾' LIMIT 1;

-- グレムリン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'グレムリンの皮', 'MATERIAL', 'グレムリンから剥ぎ取った一般的な皮。', 36, 1),
  (gen_random_uuid(), 'グレムリンの骨', 'MATERIAL', 'グレムリンから剥ぎ取った一般的な骨。', 36, 1),
  (gen_random_uuid(), 'グレムリンの鋭牙', 'MATERIAL', 'グレムリンの稀少な部位。', 360, 1),
  (gen_random_uuid(), 'グレムリンの魔核', 'MATERIAL', 'グレムリンの体内にある幻の魔核。', 3600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'グレムリンの武器', 'WEAPON', 'WEAPON_SWORD', 'グレムリンの素材で作られた強力な武器。', 900, 5, '{"attack": 27, "elementalAttack": "THUNDER", "elementalAttackValue": 9}'::jsonb),
  (gen_random_uuid(), 'グレムリンの防具', 'ARMOR', NULL, 'グレムリンの素材で作られた堅牢な防具。', 900, 8, '{"defense": 21, "elementalResistance": "WIND", "elementalResistanceValue": 9}'::jsonb),
  (gen_random_uuid(), 'グレムリンの装飾', 'ACCESSORY', NULL, 'グレムリンの魔核を用いた装飾品。', 1440, 1, '{"attack": 9, "defense": 7, "elementalAttack": "THUNDER", "elementalAttackValue": 3, "elementalResistance": "WIND", "elementalResistanceValue": 3}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グレムリンの武器', id, '[{"name":"グレムリンの皮","quantity":5},{"name":"グレムリンの骨","quantity":3},{"name":"グレムリンの鋭牙","quantity":1}]'::jsonb, 0, 'グレムリンの武器のレシピ' FROM item_templates WHERE name = 'グレムリンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グレムリンの防具', id, '[{"name":"グレムリンの皮","quantity":8},{"name":"グレムリンの鋭牙","quantity":1}]'::jsonb, 0, 'グレムリンの防具のレシピ' FROM item_templates WHERE name = 'グレムリンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グレムリンの装飾', id, '[{"name":"グレムリンの骨","quantity":3},{"name":"グレムリンの鋭牙","quantity":2},{"name":"グレムリンの魔核","quantity":1}]'::jsonb, 0, 'グレムリンの装飾のレシピ' FROM item_templates WHERE name = 'グレムリンの装飾' LIMIT 1;

-- ハーピー のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ハーピーの皮', 'MATERIAL', 'ハーピーから剥ぎ取った一般的な皮。', 40, 1),
  (gen_random_uuid(), 'ハーピーの骨', 'MATERIAL', 'ハーピーから剥ぎ取った一般的な骨。', 40, 1),
  (gen_random_uuid(), 'ハーピーの鋭牙', 'MATERIAL', 'ハーピーの稀少な部位。', 400, 1),
  (gen_random_uuid(), 'ハーピーの魔核', 'MATERIAL', 'ハーピーの体内にある幻の魔核。', 4000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ハーピーの武器', 'WEAPON', 'WEAPON_SWORD', 'ハーピーの素材で作られた強力な武器。', 1000, 5, '{"attack": 30, "elementalAttack": "WIND", "elementalAttackValue": 10}'::jsonb),
  (gen_random_uuid(), 'ハーピーの防具', 'ARMOR', NULL, 'ハーピーの素材で作られた堅牢な防具。', 1000, 8, '{"defense": 24, "elementalResistance": "THUNDER", "elementalResistanceValue": 10}'::jsonb),
  (gen_random_uuid(), 'ハーピーの装飾', 'ACCESSORY', NULL, 'ハーピーの魔核を用いた装飾品。', 1600, 1, '{"attack": 10, "defense": 8, "elementalAttack": "WIND", "elementalAttackValue": 4, "elementalResistance": "THUNDER", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ハーピーの武器', id, '[{"name":"ハーピーの皮","quantity":5},{"name":"ハーピーの骨","quantity":3},{"name":"ハーピーの鋭牙","quantity":1}]'::jsonb, 0, 'ハーピーの武器のレシピ' FROM item_templates WHERE name = 'ハーピーの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ハーピーの防具', id, '[{"name":"ハーピーの皮","quantity":8},{"name":"ハーピーの鋭牙","quantity":1}]'::jsonb, 0, 'ハーピーの防具のレシピ' FROM item_templates WHERE name = 'ハーピーの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ハーピーの装飾', id, '[{"name":"ハーピーの骨","quantity":3},{"name":"ハーピーの鋭牙","quantity":2},{"name":"ハーピーの魔核","quantity":1}]'::jsonb, 0, 'ハーピーの装飾のレシピ' FROM item_templates WHERE name = 'ハーピーの装飾' LIMIT 1;

-- 盗賊 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '盗賊の皮', 'MATERIAL', '盗賊から剥ぎ取った一般的な皮。', 40, 1),
  (gen_random_uuid(), '盗賊の骨', 'MATERIAL', '盗賊から剥ぎ取った一般的な骨。', 40, 1),
  (gen_random_uuid(), '盗賊の鋭牙', 'MATERIAL', '盗賊の稀少な部位。', 400, 1),
  (gen_random_uuid(), '盗賊の魔核', 'MATERIAL', '盗賊の体内にある幻の魔核。', 4000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '盗賊の武器', 'WEAPON', 'WEAPON_SWORD', '盗賊の素材で作られた強力な武器。', 1000, 5, '{"attack": 30, "elementalAttack": "DARK", "elementalAttackValue": 10}'::jsonb),
  (gen_random_uuid(), '盗賊の防具', 'ARMOR', NULL, '盗賊の素材で作られた堅牢な防具。', 1000, 8, '{"defense": 24, "elementalResistance": "EARTH", "elementalResistanceValue": 10}'::jsonb),
  (gen_random_uuid(), '盗賊の装飾', 'ACCESSORY', NULL, '盗賊の魔核を用いた装飾品。', 1600, 1, '{"attack": 10, "defense": 8, "elementalAttack": "DARK", "elementalAttackValue": 4, "elementalResistance": "EARTH", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '盗賊の武器', id, '[{"name":"盗賊の皮","quantity":5},{"name":"盗賊の骨","quantity":3},{"name":"盗賊の鋭牙","quantity":1}]'::jsonb, 0, '盗賊の武器のレシピ' FROM item_templates WHERE name = '盗賊の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '盗賊の防具', id, '[{"name":"盗賊の皮","quantity":8},{"name":"盗賊の鋭牙","quantity":1}]'::jsonb, 0, '盗賊の防具のレシピ' FROM item_templates WHERE name = '盗賊の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '盗賊の装飾', id, '[{"name":"盗賊の骨","quantity":3},{"name":"盗賊の鋭牙","quantity":2},{"name":"盗賊の魔核","quantity":1}]'::jsonb, 0, '盗賊の装飾のレシピ' FROM item_templates WHERE name = '盗賊の装飾' LIMIT 1;

-- リザードマン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'リザードマンの皮', 'MATERIAL', 'リザードマンから剥ぎ取った一般的な皮。', 44, 1),
  (gen_random_uuid(), 'リザードマンの骨', 'MATERIAL', 'リザードマンから剥ぎ取った一般的な骨。', 44, 1),
  (gen_random_uuid(), 'リザードマンの鋭牙', 'MATERIAL', 'リザードマンの稀少な部位。', 440, 1),
  (gen_random_uuid(), 'リザードマンの魔核', 'MATERIAL', 'リザードマンの体内にある幻の魔核。', 4400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'リザードマンの武器', 'WEAPON', 'WEAPON_SWORD', 'リザードマンの素材で作られた強力な武器。', 1100, 5, '{"attack": 33, "elementalAttack": "WATER", "elementalAttackValue": 11}'::jsonb),
  (gen_random_uuid(), 'リザードマンの防具', 'ARMOR', NULL, 'リザードマンの素材で作られた堅牢な防具。', 1100, 8, '{"defense": 26, "elementalResistance": "EARTH", "elementalResistanceValue": 11}'::jsonb),
  (gen_random_uuid(), 'リザードマンの装飾', 'ACCESSORY', NULL, 'リザードマンの魔核を用いた装飾品。', 1760, 1, '{"attack": 11, "defense": 8, "elementalAttack": "WATER", "elementalAttackValue": 4, "elementalResistance": "EARTH", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リザードマンの武器', id, '[{"name":"リザードマンの皮","quantity":5},{"name":"リザードマンの骨","quantity":3},{"name":"リザードマンの鋭牙","quantity":1}]'::jsonb, 0, 'リザードマンの武器のレシピ' FROM item_templates WHERE name = 'リザードマンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リザードマンの防具', id, '[{"name":"リザードマンの皮","quantity":8},{"name":"リザードマンの鋭牙","quantity":1}]'::jsonb, 0, 'リザードマンの防具のレシピ' FROM item_templates WHERE name = 'リザードマンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リザードマンの装飾', id, '[{"name":"リザードマンの骨","quantity":3},{"name":"リザードマンの鋭牙","quantity":2},{"name":"リザードマンの魔核","quantity":1}]'::jsonb, 0, 'リザードマンの装飾のレシピ' FROM item_templates WHERE name = 'リザードマンの装飾' LIMIT 1;

-- ミイラ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ミイラの皮', 'MATERIAL', 'ミイラから剥ぎ取った一般的な皮。', 44, 1),
  (gen_random_uuid(), 'ミイラの骨', 'MATERIAL', 'ミイラから剥ぎ取った一般的な骨。', 44, 1),
  (gen_random_uuid(), 'ミイラの鋭牙', 'MATERIAL', 'ミイラの稀少な部位。', 440, 1),
  (gen_random_uuid(), 'ミイラの魔核', 'MATERIAL', 'ミイラの体内にある幻の魔核。', 4400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ミイラの武器', 'WEAPON', 'WEAPON_SWORD', 'ミイラの素材で作られた強力な武器。', 1100, 5, '{"attack": 33, "elementalAttack": "DARK", "elementalAttackValue": 11}'::jsonb),
  (gen_random_uuid(), 'ミイラの防具', 'ARMOR', NULL, 'ミイラの素材で作られた堅牢な防具。', 1100, 8, '{"defense": 26, "elementalResistance": "EARTH", "elementalResistanceValue": 11}'::jsonb),
  (gen_random_uuid(), 'ミイラの装飾', 'ACCESSORY', NULL, 'ミイラの魔核を用いた装飾品。', 1760, 1, '{"attack": 11, "defense": 8, "elementalAttack": "DARK", "elementalAttackValue": 4, "elementalResistance": "EARTH", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミイラの武器', id, '[{"name":"ミイラの皮","quantity":5},{"name":"ミイラの骨","quantity":3},{"name":"ミイラの鋭牙","quantity":1}]'::jsonb, 0, 'ミイラの武器のレシピ' FROM item_templates WHERE name = 'ミイラの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミイラの防具', id, '[{"name":"ミイラの皮","quantity":8},{"name":"ミイラの鋭牙","quantity":1}]'::jsonb, 0, 'ミイラの防具のレシピ' FROM item_templates WHERE name = 'ミイラの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミイラの装飾', id, '[{"name":"ミイラの骨","quantity":3},{"name":"ミイラの鋭牙","quantity":2},{"name":"ミイラの魔核","quantity":1}]'::jsonb, 0, 'ミイラの装飾のレシピ' FROM item_templates WHERE name = 'ミイラの装飾' LIMIT 1;

-- オーク のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'オークの皮', 'MATERIAL', 'オークから剥ぎ取った一般的な皮。', 50, 1),
  (gen_random_uuid(), 'オークの骨', 'MATERIAL', 'オークから剥ぎ取った一般的な骨。', 50, 1),
  (gen_random_uuid(), 'オークの鋭牙', 'MATERIAL', 'オークの稀少な部位。', 500, 1),
  (gen_random_uuid(), 'オークの魔核', 'MATERIAL', 'オークの体内にある幻の魔核。', 5000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'オークの武器', 'WEAPON', 'WEAPON_SWORD', 'オークの素材で作られた強力な武器。', 1250, 5, '{"attack": 37, "elementalAttack": "EARTH", "elementalAttackValue": 12}'::jsonb),
  (gen_random_uuid(), 'オークの防具', 'ARMOR', NULL, 'オークの素材で作られた堅牢な防具。', 1250, 8, '{"defense": 30, "elementalResistance": "FIRE", "elementalResistanceValue": 12}'::jsonb),
  (gen_random_uuid(), 'オークの装飾', 'ACCESSORY', NULL, 'オークの魔核を用いた装飾品。', 2000, 1, '{"attack": 12, "defense": 10, "elementalAttack": "EARTH", "elementalAttackValue": 5, "elementalResistance": "FIRE", "elementalResistanceValue": 5}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オークの武器', id, '[{"name":"オークの皮","quantity":5},{"name":"オークの骨","quantity":3},{"name":"オークの鋭牙","quantity":1}]'::jsonb, 0, 'オークの武器のレシピ' FROM item_templates WHERE name = 'オークの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オークの防具', id, '[{"name":"オークの皮","quantity":8},{"name":"オークの鋭牙","quantity":1}]'::jsonb, 0, 'オークの防具のレシピ' FROM item_templates WHERE name = 'オークの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オークの装飾', id, '[{"name":"オークの骨","quantity":3},{"name":"オークの鋭牙","quantity":2},{"name":"オークの魔核","quantity":1}]'::jsonb, 0, 'オークの装飾のレシピ' FROM item_templates WHERE name = 'オークの装飾' LIMIT 1;

-- 大蛇 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '大蛇の皮', 'MATERIAL', '大蛇から剥ぎ取った一般的な皮。', 50, 1),
  (gen_random_uuid(), '大蛇の骨', 'MATERIAL', '大蛇から剥ぎ取った一般的な骨。', 50, 1),
  (gen_random_uuid(), '大蛇の鋭牙', 'MATERIAL', '大蛇の稀少な部位。', 500, 1),
  (gen_random_uuid(), '大蛇の魔核', 'MATERIAL', '大蛇の体内にある幻の魔核。', 5000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '大蛇の武器', 'WEAPON', 'WEAPON_SWORD', '大蛇の素材で作られた強力な武器。', 1250, 5, '{"attack": 37, "elementalAttack": "WATER", "elementalAttackValue": 12}'::jsonb),
  (gen_random_uuid(), '大蛇の防具', 'ARMOR', NULL, '大蛇の素材で作られた堅牢な防具。', 1250, 8, '{"defense": 30, "elementalResistance": "DARK", "elementalResistanceValue": 12}'::jsonb),
  (gen_random_uuid(), '大蛇の装飾', 'ACCESSORY', NULL, '大蛇の魔核を用いた装飾品。', 2000, 1, '{"attack": 12, "defense": 10, "elementalAttack": "WATER", "elementalAttackValue": 5, "elementalResistance": "DARK", "elementalResistanceValue": 5}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '大蛇の武器', id, '[{"name":"大蛇の皮","quantity":5},{"name":"大蛇の骨","quantity":3},{"name":"大蛇の鋭牙","quantity":1}]'::jsonb, 0, '大蛇の武器のレシピ' FROM item_templates WHERE name = '大蛇の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '大蛇の防具', id, '[{"name":"大蛇の皮","quantity":8},{"name":"大蛇の鋭牙","quantity":1}]'::jsonb, 0, '大蛇の防具のレシピ' FROM item_templates WHERE name = '大蛇の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '大蛇の装飾', id, '[{"name":"大蛇の骨","quantity":3},{"name":"大蛇の鋭牙","quantity":2},{"name":"大蛇の魔核","quantity":1}]'::jsonb, 0, '大蛇の装飾のレシピ' FROM item_templates WHERE name = '大蛇の装飾' LIMIT 1;

-- 魔犬 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '魔犬の皮', 'MATERIAL', '魔犬から剥ぎ取った一般的な皮。', 56, 1),
  (gen_random_uuid(), '魔犬の骨', 'MATERIAL', '魔犬から剥ぎ取った一般的な骨。', 56, 1),
  (gen_random_uuid(), '魔犬の鋭牙', 'MATERIAL', '魔犬の稀少な部位。', 560, 1),
  (gen_random_uuid(), '魔犬の魔核', 'MATERIAL', '魔犬の体内にある幻の魔核。', 5600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '魔犬の武器', 'WEAPON', 'WEAPON_SWORD', '魔犬の素材で作られた強力な武器。', 1400, 5, '{"attack": 42, "elementalAttack": "FIRE", "elementalAttackValue": 14}'::jsonb),
  (gen_random_uuid(), '魔犬の防具', 'ARMOR', NULL, '魔犬の素材で作られた堅牢な防具。', 1400, 8, '{"defense": 33, "elementalResistance": "DARK", "elementalResistanceValue": 14}'::jsonb),
  (gen_random_uuid(), '魔犬の装飾', 'ACCESSORY', NULL, '魔犬の魔核を用いた装飾品。', 2240, 1, '{"attack": 14, "defense": 11, "elementalAttack": "FIRE", "elementalAttackValue": 5, "elementalResistance": "DARK", "elementalResistanceValue": 5}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔犬の武器', id, '[{"name":"魔犬の皮","quantity":5},{"name":"魔犬の骨","quantity":3},{"name":"魔犬の鋭牙","quantity":1}]'::jsonb, 0, '魔犬の武器のレシピ' FROM item_templates WHERE name = '魔犬の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔犬の防具', id, '[{"name":"魔犬の皮","quantity":8},{"name":"魔犬の鋭牙","quantity":1}]'::jsonb, 0, '魔犬の防具のレシピ' FROM item_templates WHERE name = '魔犬の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔犬の装飾', id, '[{"name":"魔犬の骨","quantity":3},{"name":"魔犬の鋭牙","quantity":2},{"name":"魔犬の魔核","quantity":1}]'::jsonb, 0, '魔犬の装飾のレシピ' FROM item_templates WHERE name = '魔犬の装飾' LIMIT 1;

-- アンデッド のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'アンデッドの皮', 'MATERIAL', 'アンデッドから剥ぎ取った一般的な皮。', 60, 1),
  (gen_random_uuid(), 'アンデッドの骨', 'MATERIAL', 'アンデッドから剥ぎ取った一般的な骨。', 60, 1),
  (gen_random_uuid(), 'アンデッドの鋭牙', 'MATERIAL', 'アンデッドの稀少な部位。', 600, 1),
  (gen_random_uuid(), 'アンデッドの魔核', 'MATERIAL', 'アンデッドの体内にある幻の魔核。', 6000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'アンデッドの武器', 'WEAPON', 'WEAPON_SWORD', 'アンデッドの素材で作られた強力な武器。', 1500, 5, '{"attack": 45, "elementalAttack": "DARK", "elementalAttackValue": 15}'::jsonb),
  (gen_random_uuid(), 'アンデッドの防具', 'ARMOR', NULL, 'アンデッドの素材で作られた堅牢な防具。', 1500, 8, '{"defense": 36, "elementalResistance": "ICE", "elementalResistanceValue": 15}'::jsonb),
  (gen_random_uuid(), 'アンデッドの装飾', 'ACCESSORY', NULL, 'アンデッドの魔核を用いた装飾品。', 2400, 1, '{"attack": 15, "defense": 12, "elementalAttack": "DARK", "elementalAttackValue": 6, "elementalResistance": "ICE", "elementalResistanceValue": 6}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'アンデッドの武器', id, '[{"name":"アンデッドの皮","quantity":5},{"name":"アンデッドの骨","quantity":3},{"name":"アンデッドの鋭牙","quantity":1}]'::jsonb, 0, 'アンデッドの武器のレシピ' FROM item_templates WHERE name = 'アンデッドの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'アンデッドの防具', id, '[{"name":"アンデッドの皮","quantity":8},{"name":"アンデッドの鋭牙","quantity":1}]'::jsonb, 0, 'アンデッドの防具のレシピ' FROM item_templates WHERE name = 'アンデッドの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'アンデッドの装飾', id, '[{"name":"アンデッドの骨","quantity":3},{"name":"アンデッドの鋭牙","quantity":2},{"name":"アンデッドの魔核","quantity":1}]'::jsonb, 0, 'アンデッドの装飾のレシピ' FROM item_templates WHERE name = 'アンデッドの装飾' LIMIT 1;

-- オーク戦士 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'オーク戦士の皮', 'MATERIAL', 'オーク戦士から剥ぎ取った一般的な皮。', 60, 1),
  (gen_random_uuid(), 'オーク戦士の骨', 'MATERIAL', 'オーク戦士から剥ぎ取った一般的な骨。', 60, 1),
  (gen_random_uuid(), 'オーク戦士の鋭牙', 'MATERIAL', 'オーク戦士の稀少な部位。', 600, 1),
  (gen_random_uuid(), 'オーク戦士の魔核', 'MATERIAL', 'オーク戦士の体内にある幻の魔核。', 6000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'オーク戦士の武器', 'WEAPON', 'WEAPON_SWORD', 'オーク戦士の素材で作られた強力な武器。', 1500, 5, '{"attack": 45, "elementalAttack": "EARTH", "elementalAttackValue": 15}'::jsonb),
  (gen_random_uuid(), 'オーク戦士の防具', 'ARMOR', NULL, 'オーク戦士の素材で作られた堅牢な防具。', 1500, 8, '{"defense": 36, "elementalResistance": "FIRE", "elementalResistanceValue": 15}'::jsonb),
  (gen_random_uuid(), 'オーク戦士の装飾', 'ACCESSORY', NULL, 'オーク戦士の魔核を用いた装飾品。', 2400, 1, '{"attack": 15, "defense": 12, "elementalAttack": "EARTH", "elementalAttackValue": 6, "elementalResistance": "FIRE", "elementalResistanceValue": 6}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オーク戦士の武器', id, '[{"name":"オーク戦士の皮","quantity":5},{"name":"オーク戦士の骨","quantity":3},{"name":"オーク戦士の鋭牙","quantity":1}]'::jsonb, 0, 'オーク戦士の武器のレシピ' FROM item_templates WHERE name = 'オーク戦士の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オーク戦士の防具', id, '[{"name":"オーク戦士の皮","quantity":8},{"name":"オーク戦士の鋭牙","quantity":1}]'::jsonb, 0, 'オーク戦士の防具のレシピ' FROM item_templates WHERE name = 'オーク戦士の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オーク戦士の装飾', id, '[{"name":"オーク戦士の骨","quantity":3},{"name":"オーク戦士の鋭牙","quantity":2},{"name":"オーク戦士の魔核","quantity":1}]'::jsonb, 0, 'オーク戦士の装飾のレシピ' FROM item_templates WHERE name = 'オーク戦士の装飾' LIMIT 1;

-- ダークエルフ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ダークエルフの皮', 'MATERIAL', 'ダークエルフから剥ぎ取った一般的な皮。', 70, 1),
  (gen_random_uuid(), 'ダークエルフの骨', 'MATERIAL', 'ダークエルフから剥ぎ取った一般的な骨。', 70, 1),
  (gen_random_uuid(), 'ダークエルフの鋭牙', 'MATERIAL', 'ダークエルフの稀少な部位。', 700, 1),
  (gen_random_uuid(), 'ダークエルフの魔核', 'MATERIAL', 'ダークエルフの体内にある幻の魔核。', 7000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ダークエルフの武器', 'WEAPON', 'WEAPON_SWORD', 'ダークエルフの素材で作られた強力な武器。', 1750, 5, '{"attack": 52, "elementalAttack": "DARK", "elementalAttackValue": 17}'::jsonb),
  (gen_random_uuid(), 'ダークエルフの防具', 'ARMOR', NULL, 'ダークエルフの素材で作られた堅牢な防具。', 1750, 8, '{"defense": 42, "elementalResistance": "WIND", "elementalResistanceValue": 17}'::jsonb),
  (gen_random_uuid(), 'ダークエルフの装飾', 'ACCESSORY', NULL, 'ダークエルフの魔核を用いた装飾品。', 2800, 1, '{"attack": 17, "defense": 14, "elementalAttack": "DARK", "elementalAttackValue": 7, "elementalResistance": "WIND", "elementalResistanceValue": 7}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ダークエルフの武器', id, '[{"name":"ダークエルフの皮","quantity":5},{"name":"ダークエルフの骨","quantity":3},{"name":"ダークエルフの鋭牙","quantity":1}]'::jsonb, 0, 'ダークエルフの武器のレシピ' FROM item_templates WHERE name = 'ダークエルフの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ダークエルフの防具', id, '[{"name":"ダークエルフの皮","quantity":8},{"name":"ダークエルフの鋭牙","quantity":1}]'::jsonb, 0, 'ダークエルフの防具のレシピ' FROM item_templates WHERE name = 'ダークエルフの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ダークエルフの装飾', id, '[{"name":"ダークエルフの骨","quantity":3},{"name":"ダークエルフの鋭牙","quantity":2},{"name":"ダークエルフの魔核","quantity":1}]'::jsonb, 0, 'ダークエルフの装飾のレシピ' FROM item_templates WHERE name = 'ダークエルフの装飾' LIMIT 1;

-- トロル のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'トロルの皮', 'MATERIAL', 'トロルから剥ぎ取った一般的な皮。', 80, 1),
  (gen_random_uuid(), 'トロルの骨', 'MATERIAL', 'トロルから剥ぎ取った一般的な骨。', 80, 1),
  (gen_random_uuid(), 'トロルの鋭牙', 'MATERIAL', 'トロルの稀少な部位。', 800, 1),
  (gen_random_uuid(), 'トロルの魔核', 'MATERIAL', 'トロルの体内にある幻の魔核。', 8000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'トロルの武器', 'WEAPON', 'WEAPON_SWORD', 'トロルの素材で作られた強力な武器。', 2000, 5, '{"attack": 60, "elementalAttack": "EARTH", "elementalAttackValue": 20}'::jsonb),
  (gen_random_uuid(), 'トロルの防具', 'ARMOR', NULL, 'トロルの素材で作られた堅牢な防具。', 2000, 8, '{"defense": 48, "elementalResistance": "WATER", "elementalResistanceValue": 20}'::jsonb),
  (gen_random_uuid(), 'トロルの装飾', 'ACCESSORY', NULL, 'トロルの魔核を用いた装飾品。', 3200, 1, '{"attack": 20, "defense": 16, "elementalAttack": "EARTH", "elementalAttackValue": 8, "elementalResistance": "WATER", "elementalResistanceValue": 8}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'トロルの武器', id, '[{"name":"トロルの皮","quantity":5},{"name":"トロルの骨","quantity":3},{"name":"トロルの鋭牙","quantity":1}]'::jsonb, 0, 'トロルの武器のレシピ' FROM item_templates WHERE name = 'トロルの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'トロルの防具', id, '[{"name":"トロルの皮","quantity":8},{"name":"トロルの鋭牙","quantity":1}]'::jsonb, 0, 'トロルの防具のレシピ' FROM item_templates WHERE name = 'トロルの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'トロルの装飾', id, '[{"name":"トロルの骨","quantity":3},{"name":"トロルの鋭牙","quantity":2},{"name":"トロルの魔核","quantity":1}]'::jsonb, 0, 'トロルの装飾のレシピ' FROM item_templates WHERE name = 'トロルの装飾' LIMIT 1;

-- ゾンビナイト のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゾンビナイトの皮', 'MATERIAL', 'ゾンビナイトから剥ぎ取った一般的な皮。', 80, 1),
  (gen_random_uuid(), 'ゾンビナイトの骨', 'MATERIAL', 'ゾンビナイトから剥ぎ取った一般的な骨。', 80, 1),
  (gen_random_uuid(), 'ゾンビナイトの鋭牙', 'MATERIAL', 'ゾンビナイトの稀少な部位。', 800, 1),
  (gen_random_uuid(), 'ゾンビナイトの魔核', 'MATERIAL', 'ゾンビナイトの体内にある幻の魔核。', 8000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ゾンビナイトの武器', 'WEAPON', 'WEAPON_SWORD', 'ゾンビナイトの素材で作られた強力な武器。', 2000, 5, '{"attack": 60, "elementalAttack": "DARK", "elementalAttackValue": 20}'::jsonb),
  (gen_random_uuid(), 'ゾンビナイトの防具', 'ARMOR', NULL, 'ゾンビナイトの素材で作られた堅牢な防具。', 2000, 8, '{"defense": 48, "elementalResistance": "ICE", "elementalResistanceValue": 20}'::jsonb),
  (gen_random_uuid(), 'ゾンビナイトの装飾', 'ACCESSORY', NULL, 'ゾンビナイトの魔核を用いた装飾品。', 3200, 1, '{"attack": 20, "defense": 16, "elementalAttack": "DARK", "elementalAttackValue": 8, "elementalResistance": "ICE", "elementalResistanceValue": 8}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゾンビナイトの武器', id, '[{"name":"ゾンビナイトの皮","quantity":5},{"name":"ゾンビナイトの骨","quantity":3},{"name":"ゾンビナイトの鋭牙","quantity":1}]'::jsonb, 0, 'ゾンビナイトの武器のレシピ' FROM item_templates WHERE name = 'ゾンビナイトの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゾンビナイトの防具', id, '[{"name":"ゾンビナイトの皮","quantity":8},{"name":"ゾンビナイトの鋭牙","quantity":1}]'::jsonb, 0, 'ゾンビナイトの防具のレシピ' FROM item_templates WHERE name = 'ゾンビナイトの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゾンビナイトの装飾', id, '[{"name":"ゾンビナイトの骨","quantity":3},{"name":"ゾンビナイトの鋭牙","quantity":2},{"name":"ゾンビナイトの魔核","quantity":1}]'::jsonb, 0, 'ゾンビナイトの装飾のレシピ' FROM item_templates WHERE name = 'ゾンビナイトの装飾' LIMIT 1;

-- ガーゴイル のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ガーゴイルの皮', 'MATERIAL', 'ガーゴイルから剥ぎ取った一般的な皮。', 84, 1),
  (gen_random_uuid(), 'ガーゴイルの骨', 'MATERIAL', 'ガーゴイルから剥ぎ取った一般的な骨。', 84, 1),
  (gen_random_uuid(), 'ガーゴイルの鋭牙', 'MATERIAL', 'ガーゴイルの稀少な部位。', 840, 1),
  (gen_random_uuid(), 'ガーゴイルの魔核', 'MATERIAL', 'ガーゴイルの体内にある幻の魔核。', 8400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ガーゴイルの武器', 'WEAPON', 'WEAPON_SWORD', 'ガーゴイルの素材で作られた強力な武器。', 2100, 5, '{"attack": 63, "elementalAttack": "EARTH", "elementalAttackValue": 21}'::jsonb),
  (gen_random_uuid(), 'ガーゴイルの防具', 'ARMOR', NULL, 'ガーゴイルの素材で作られた堅牢な防具。', 2100, 8, '{"defense": 50, "elementalResistance": "WIND", "elementalResistanceValue": 21}'::jsonb),
  (gen_random_uuid(), 'ガーゴイルの装飾', 'ACCESSORY', NULL, 'ガーゴイルの魔核を用いた装飾品。', 3360, 1, '{"attack": 21, "defense": 16, "elementalAttack": "EARTH", "elementalAttackValue": 8, "elementalResistance": "WIND", "elementalResistanceValue": 8}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ガーゴイルの武器', id, '[{"name":"ガーゴイルの皮","quantity":5},{"name":"ガーゴイルの骨","quantity":3},{"name":"ガーゴイルの鋭牙","quantity":1}]'::jsonb, 0, 'ガーゴイルの武器のレシピ' FROM item_templates WHERE name = 'ガーゴイルの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ガーゴイルの防具', id, '[{"name":"ガーゴイルの皮","quantity":8},{"name":"ガーゴイルの鋭牙","quantity":1}]'::jsonb, 0, 'ガーゴイルの防具のレシピ' FROM item_templates WHERE name = 'ガーゴイルの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ガーゴイルの装飾', id, '[{"name":"ガーゴイルの骨","quantity":3},{"name":"ガーゴイルの鋭牙","quantity":2},{"name":"ガーゴイルの魔核","quantity":1}]'::jsonb, 0, 'ガーゴイルの装飾のレシピ' FROM item_templates WHERE name = 'ガーゴイルの装飾' LIMIT 1;

-- グリフィン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'グリフィンの皮', 'MATERIAL', 'グリフィンから剥ぎ取った一般的な皮。', 90, 1),
  (gen_random_uuid(), 'グリフィンの骨', 'MATERIAL', 'グリフィンから剥ぎ取った一般的な骨。', 90, 1),
  (gen_random_uuid(), 'グリフィンの鋭牙', 'MATERIAL', 'グリフィンの稀少な部位。', 900, 1),
  (gen_random_uuid(), 'グリフィンの魔核', 'MATERIAL', 'グリフィンの体内にある幻の魔核。', 9000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'グリフィンの武器', 'WEAPON', 'WEAPON_SWORD', 'グリフィンの素材で作られた強力な武器。', 2250, 5, '{"attack": 67, "elementalAttack": "WIND", "elementalAttackValue": 22}'::jsonb),
  (gen_random_uuid(), 'グリフィンの防具', 'ARMOR', NULL, 'グリフィンの素材で作られた堅牢な防具。', 2250, 8, '{"defense": 54, "elementalResistance": "THUNDER", "elementalResistanceValue": 22}'::jsonb),
  (gen_random_uuid(), 'グリフィンの装飾', 'ACCESSORY', NULL, 'グリフィンの魔核を用いた装飾品。', 3600, 1, '{"attack": 22, "defense": 18, "elementalAttack": "WIND", "elementalAttackValue": 9, "elementalResistance": "THUNDER", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グリフィンの武器', id, '[{"name":"グリフィンの皮","quantity":5},{"name":"グリフィンの骨","quantity":3},{"name":"グリフィンの鋭牙","quantity":1}]'::jsonb, 0, 'グリフィンの武器のレシピ' FROM item_templates WHERE name = 'グリフィンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グリフィンの防具', id, '[{"name":"グリフィンの皮","quantity":8},{"name":"グリフィンの鋭牙","quantity":1}]'::jsonb, 0, 'グリフィンの防具のレシピ' FROM item_templates WHERE name = 'グリフィンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グリフィンの装飾', id, '[{"name":"グリフィンの骨","quantity":3},{"name":"グリフィンの鋭牙","quantity":2},{"name":"グリフィンの魔核","quantity":1}]'::jsonb, 0, 'グリフィンの装飾のレシピ' FROM item_templates WHERE name = 'グリフィンの装飾' LIMIT 1;

-- オーガ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'オーガの皮', 'MATERIAL', 'オーガから剥ぎ取った一般的な皮。', 90, 1),
  (gen_random_uuid(), 'オーガの骨', 'MATERIAL', 'オーガから剥ぎ取った一般的な骨。', 90, 1),
  (gen_random_uuid(), 'オーガの鋭牙', 'MATERIAL', 'オーガの稀少な部位。', 900, 1),
  (gen_random_uuid(), 'オーガの魔核', 'MATERIAL', 'オーガの体内にある幻の魔核。', 9000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'オーガの武器', 'WEAPON', 'WEAPON_SWORD', 'オーガの素材で作られた強力な武器。', 2250, 5, '{"attack": 67, "elementalAttack": "EARTH", "elementalAttackValue": 22}'::jsonb),
  (gen_random_uuid(), 'オーガの防具', 'ARMOR', NULL, 'オーガの素材で作られた堅牢な防具。', 2250, 8, '{"defense": 54, "elementalResistance": "FIRE", "elementalResistanceValue": 22}'::jsonb),
  (gen_random_uuid(), 'オーガの装飾', 'ACCESSORY', NULL, 'オーガの魔核を用いた装飾品。', 3600, 1, '{"attack": 22, "defense": 18, "elementalAttack": "EARTH", "elementalAttackValue": 9, "elementalResistance": "FIRE", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オーガの武器', id, '[{"name":"オーガの皮","quantity":5},{"name":"オーガの骨","quantity":3},{"name":"オーガの鋭牙","quantity":1}]'::jsonb, 0, 'オーガの武器のレシピ' FROM item_templates WHERE name = 'オーガの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オーガの防具', id, '[{"name":"オーガの皮","quantity":8},{"name":"オーガの鋭牙","quantity":1}]'::jsonb, 0, 'オーガの防具のレシピ' FROM item_templates WHERE name = 'オーガの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'オーガの装飾', id, '[{"name":"オーガの骨","quantity":3},{"name":"オーガの鋭牙","quantity":2},{"name":"オーガの魔核","quantity":1}]'::jsonb, 0, 'オーガの装飾のレシピ' FROM item_templates WHERE name = 'オーガの装飾' LIMIT 1;

-- 闇魔法使い のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '闇魔法使いの皮', 'MATERIAL', '闇魔法使いから剥ぎ取った一般的な皮。', 90, 1),
  (gen_random_uuid(), '闇魔法使いの骨', 'MATERIAL', '闇魔法使いから剥ぎ取った一般的な骨。', 90, 1),
  (gen_random_uuid(), '闇魔法使いの鋭牙', 'MATERIAL', '闇魔法使いの稀少な部位。', 900, 1),
  (gen_random_uuid(), '闇魔法使いの魔核', 'MATERIAL', '闇魔法使いの体内にある幻の魔核。', 9000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '闇魔法使いの武器', 'WEAPON', 'WEAPON_SWORD', '闇魔法使いの素材で作られた強力な武器。', 2250, 5, '{"attack": 67, "elementalAttack": "DARK", "elementalAttackValue": 22}'::jsonb),
  (gen_random_uuid(), '闇魔法使いの防具', 'ARMOR', NULL, '闇魔法使いの素材で作られた堅牢な防具。', 2250, 8, '{"defense": 54, "elementalResistance": "FIRE", "elementalResistanceValue": 22}'::jsonb),
  (gen_random_uuid(), '闇魔法使いの装飾', 'ACCESSORY', NULL, '闇魔法使いの魔核を用いた装飾品。', 3600, 1, '{"attack": 22, "defense": 18, "elementalAttack": "DARK", "elementalAttackValue": 9, "elementalResistance": "FIRE", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '闇魔法使いの武器', id, '[{"name":"闇魔法使いの皮","quantity":5},{"name":"闇魔法使いの骨","quantity":3},{"name":"闇魔法使いの鋭牙","quantity":1}]'::jsonb, 0, '闇魔法使いの武器のレシピ' FROM item_templates WHERE name = '闇魔法使いの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '闇魔法使いの防具', id, '[{"name":"闇魔法使いの皮","quantity":8},{"name":"闇魔法使いの鋭牙","quantity":1}]'::jsonb, 0, '闇魔法使いの防具のレシピ' FROM item_templates WHERE name = '闇魔法使いの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '闇魔法使いの装飾', id, '[{"name":"闇魔法使いの骨","quantity":3},{"name":"闇魔法使いの鋭牙","quantity":2},{"name":"闇魔法使いの魔核","quantity":1}]'::jsonb, 0, '闇魔法使いの装飾のレシピ' FROM item_templates WHERE name = '闇魔法使いの装飾' LIMIT 1;

-- バジリスク のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'バジリスクの皮', 'MATERIAL', 'バジリスクから剥ぎ取った一般的な皮。', 96, 1),
  (gen_random_uuid(), 'バジリスクの骨', 'MATERIAL', 'バジリスクから剥ぎ取った一般的な骨。', 96, 1),
  (gen_random_uuid(), 'バジリスクの鋭牙', 'MATERIAL', 'バジリスクの稀少な部位。', 960, 1),
  (gen_random_uuid(), 'バジリスクの魔核', 'MATERIAL', 'バジリスクの体内にある幻の魔核。', 9600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'バジリスクの武器', 'WEAPON', 'WEAPON_SWORD', 'バジリスクの素材で作られた強力な武器。', 2400, 5, '{"attack": 72, "elementalAttack": "EARTH", "elementalAttackValue": 24}'::jsonb),
  (gen_random_uuid(), 'バジリスクの防具', 'ARMOR', NULL, 'バジリスクの素材で作られた堅牢な防具。', 2400, 8, '{"defense": 57, "elementalResistance": "POISON", "elementalResistanceValue": 24}'::jsonb),
  (gen_random_uuid(), 'バジリスクの装飾', 'ACCESSORY', NULL, 'バジリスクの魔核を用いた装飾品。', 3840, 1, '{"attack": 24, "defense": 19, "elementalAttack": "EARTH", "elementalAttackValue": 9, "elementalResistance": "POISON", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'バジリスクの武器', id, '[{"name":"バジリスクの皮","quantity":5},{"name":"バジリスクの骨","quantity":3},{"name":"バジリスクの鋭牙","quantity":1}]'::jsonb, 0, 'バジリスクの武器のレシピ' FROM item_templates WHERE name = 'バジリスクの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'バジリスクの防具', id, '[{"name":"バジリスクの皮","quantity":8},{"name":"バジリスクの鋭牙","quantity":1}]'::jsonb, 0, 'バジリスクの防具のレシピ' FROM item_templates WHERE name = 'バジリスクの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'バジリスクの装飾', id, '[{"name":"バジリスクの骨","quantity":3},{"name":"バジリスクの鋭牙","quantity":2},{"name":"バジリスクの魔核","quantity":1}]'::jsonb, 0, 'バジリスクの装飾のレシピ' FROM item_templates WHERE name = 'バジリスクの装飾' LIMIT 1;

-- ウェアウルフ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ウェアウルフの皮', 'MATERIAL', 'ウェアウルフから剥ぎ取った一般的な皮。', 96, 1),
  (gen_random_uuid(), 'ウェアウルフの骨', 'MATERIAL', 'ウェアウルフから剥ぎ取った一般的な骨。', 96, 1),
  (gen_random_uuid(), 'ウェアウルフの鋭牙', 'MATERIAL', 'ウェアウルフの稀少な部位。', 960, 1),
  (gen_random_uuid(), 'ウェアウルフの魔核', 'MATERIAL', 'ウェアウルフの体内にある幻の魔核。', 9600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ウェアウルフの武器', 'WEAPON', 'WEAPON_SWORD', 'ウェアウルフの素材で作られた強力な武器。', 2400, 5, '{"attack": 72, "elementalAttack": "WIND", "elementalAttackValue": 24}'::jsonb),
  (gen_random_uuid(), 'ウェアウルフの防具', 'ARMOR', NULL, 'ウェアウルフの素材で作られた堅牢な防具。', 2400, 8, '{"defense": 57, "elementalResistance": "DARK", "elementalResistanceValue": 24}'::jsonb),
  (gen_random_uuid(), 'ウェアウルフの装飾', 'ACCESSORY', NULL, 'ウェアウルフの魔核を用いた装飾品。', 3840, 1, '{"attack": 24, "defense": 19, "elementalAttack": "WIND", "elementalAttackValue": 9, "elementalResistance": "DARK", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ウェアウルフの武器', id, '[{"name":"ウェアウルフの皮","quantity":5},{"name":"ウェアウルフの骨","quantity":3},{"name":"ウェアウルフの鋭牙","quantity":1}]'::jsonb, 0, 'ウェアウルフの武器のレシピ' FROM item_templates WHERE name = 'ウェアウルフの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ウェアウルフの防具', id, '[{"name":"ウェアウルフの皮","quantity":8},{"name":"ウェアウルフの鋭牙","quantity":1}]'::jsonb, 0, 'ウェアウルフの防具のレシピ' FROM item_templates WHERE name = 'ウェアウルフの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ウェアウルフの装飾', id, '[{"name":"ウェアウルフの骨","quantity":3},{"name":"ウェアウルフの鋭牙","quantity":2},{"name":"ウェアウルフの魔核","quantity":1}]'::jsonb, 0, 'ウェアウルフの装飾のレシピ' FROM item_templates WHERE name = 'ウェアウルフの装飾' LIMIT 1;

-- サイクロプス のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'サイクロプスの皮', 'MATERIAL', 'サイクロプスから剥ぎ取った一般的な皮。', 100, 1),
  (gen_random_uuid(), 'サイクロプスの骨', 'MATERIAL', 'サイクロプスから剥ぎ取った一般的な骨。', 100, 1),
  (gen_random_uuid(), 'サイクロプスの鋭牙', 'MATERIAL', 'サイクロプスの稀少な部位。', 1000, 1),
  (gen_random_uuid(), 'サイクロプスの魔核', 'MATERIAL', 'サイクロプスの体内にある幻の魔核。', 10000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'サイクロプスの武器', 'WEAPON', 'WEAPON_SWORD', 'サイクロプスの素材で作られた強力な武器。', 2500, 5, '{"attack": 75, "elementalAttack": "EARTH", "elementalAttackValue": 25}'::jsonb),
  (gen_random_uuid(), 'サイクロプスの防具', 'ARMOR', NULL, 'サイクロプスの素材で作られた堅牢な防具。', 2500, 8, '{"defense": 60, "elementalResistance": "THUNDER", "elementalResistanceValue": 25}'::jsonb),
  (gen_random_uuid(), 'サイクロプスの装飾', 'ACCESSORY', NULL, 'サイクロプスの魔核を用いた装飾品。', 4000, 1, '{"attack": 25, "defense": 20, "elementalAttack": "EARTH", "elementalAttackValue": 10, "elementalResistance": "THUNDER", "elementalResistanceValue": 10}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'サイクロプスの武器', id, '[{"name":"サイクロプスの皮","quantity":5},{"name":"サイクロプスの骨","quantity":3},{"name":"サイクロプスの鋭牙","quantity":1}]'::jsonb, 0, 'サイクロプスの武器のレシピ' FROM item_templates WHERE name = 'サイクロプスの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'サイクロプスの防具', id, '[{"name":"サイクロプスの皮","quantity":8},{"name":"サイクロプスの鋭牙","quantity":1}]'::jsonb, 0, 'サイクロプスの防具のレシピ' FROM item_templates WHERE name = 'サイクロプスの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'サイクロプスの装飾', id, '[{"name":"サイクロプスの骨","quantity":3},{"name":"サイクロプスの鋭牙","quantity":2},{"name":"サイクロプスの魔核","quantity":1}]'::jsonb, 0, 'サイクロプスの装飾のレシピ' FROM item_templates WHERE name = 'サイクロプスの装飾' LIMIT 1;

-- ヴァンパイア のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ヴァンパイアの皮', 'MATERIAL', 'ヴァンパイアから剥ぎ取った一般的な皮。', 100, 1),
  (gen_random_uuid(), 'ヴァンパイアの骨', 'MATERIAL', 'ヴァンパイアから剥ぎ取った一般的な骨。', 100, 1),
  (gen_random_uuid(), 'ヴァンパイアの鋭牙', 'MATERIAL', 'ヴァンパイアの稀少な部位。', 1000, 1),
  (gen_random_uuid(), 'ヴァンパイアの魔核', 'MATERIAL', 'ヴァンパイアの体内にある幻の魔核。', 10000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ヴァンパイアの武器', 'WEAPON', 'WEAPON_SWORD', 'ヴァンパイアの素材で作られた強力な武器。', 2500, 5, '{"attack": 75, "elementalAttack": "DARK", "elementalAttackValue": 25}'::jsonb),
  (gen_random_uuid(), 'ヴァンパイアの防具', 'ARMOR', NULL, 'ヴァンパイアの素材で作られた堅牢な防具。', 2500, 8, '{"defense": 60, "elementalResistance": "ICE", "elementalResistanceValue": 25}'::jsonb),
  (gen_random_uuid(), 'ヴァンパイアの装飾', 'ACCESSORY', NULL, 'ヴァンパイアの魔核を用いた装飾品。', 4000, 1, '{"attack": 25, "defense": 20, "elementalAttack": "DARK", "elementalAttackValue": 10, "elementalResistance": "ICE", "elementalResistanceValue": 10}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヴァンパイアの武器', id, '[{"name":"ヴァンパイアの皮","quantity":5},{"name":"ヴァンパイアの骨","quantity":3},{"name":"ヴァンパイアの鋭牙","quantity":1}]'::jsonb, 0, 'ヴァンパイアの武器のレシピ' FROM item_templates WHERE name = 'ヴァンパイアの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヴァンパイアの防具', id, '[{"name":"ヴァンパイアの皮","quantity":8},{"name":"ヴァンパイアの鋭牙","quantity":1}]'::jsonb, 0, 'ヴァンパイアの防具のレシピ' FROM item_templates WHERE name = 'ヴァンパイアの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヴァンパイアの装飾', id, '[{"name":"ヴァンパイアの骨","quantity":3},{"name":"ヴァンパイアの鋭牙","quantity":2},{"name":"ヴァンパイアの魔核","quantity":1}]'::jsonb, 0, 'ヴァンパイアの装飾のレシピ' FROM item_templates WHERE name = 'ヴァンパイアの装飾' LIMIT 1;

-- ドッペルゲンガー のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ドッペルゲンガーの皮', 'MATERIAL', 'ドッペルゲンガーから剥ぎ取った一般的な皮。', 104, 1),
  (gen_random_uuid(), 'ドッペルゲンガーの骨', 'MATERIAL', 'ドッペルゲンガーから剥ぎ取った一般的な骨。', 104, 1),
  (gen_random_uuid(), 'ドッペルゲンガーの鋭牙', 'MATERIAL', 'ドッペルゲンガーの稀少な部位。', 1040, 1),
  (gen_random_uuid(), 'ドッペルゲンガーの魔核', 'MATERIAL', 'ドッペルゲンガーの体内にある幻の魔核。', 10400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ドッペルゲンガーの武器', 'WEAPON', 'WEAPON_SWORD', 'ドッペルゲンガーの素材で作られた強力な武器。', 2600, 5, '{"attack": 78, "elementalAttack": "DARK", "elementalAttackValue": 26}'::jsonb),
  (gen_random_uuid(), 'ドッペルゲンガーの防具', 'ARMOR', NULL, 'ドッペルゲンガーの素材で作られた堅牢な防具。', 2600, 8, '{"defense": 62, "elementalResistance": "LIGHT", "elementalResistanceValue": 26}'::jsonb),
  (gen_random_uuid(), 'ドッペルゲンガーの装飾', 'ACCESSORY', NULL, 'ドッペルゲンガーの魔核を用いた装飾品。', 4160, 1, '{"attack": 26, "defense": 20, "elementalAttack": "DARK", "elementalAttackValue": 10, "elementalResistance": "LIGHT", "elementalResistanceValue": 10}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ドッペルゲンガーの武器', id, '[{"name":"ドッペルゲンガーの皮","quantity":5},{"name":"ドッペルゲンガーの骨","quantity":3},{"name":"ドッペルゲンガーの鋭牙","quantity":1}]'::jsonb, 0, 'ドッペルゲンガーの武器のレシピ' FROM item_templates WHERE name = 'ドッペルゲンガーの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ドッペルゲンガーの防具', id, '[{"name":"ドッペルゲンガーの皮","quantity":8},{"name":"ドッペルゲンガーの鋭牙","quantity":1}]'::jsonb, 0, 'ドッペルゲンガーの防具のレシピ' FROM item_templates WHERE name = 'ドッペルゲンガーの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ドッペルゲンガーの装飾', id, '[{"name":"ドッペルゲンガーの骨","quantity":3},{"name":"ドッペルゲンガーの鋭牙","quantity":2},{"name":"ドッペルゲンガーの魔核","quantity":1}]'::jsonb, 0, 'ドッペルゲンガーの装飾のレシピ' FROM item_templates WHERE name = 'ドッペルゲンガーの装飾' LIMIT 1;

-- 暗黒騎士 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '暗黒騎士の皮', 'MATERIAL', '暗黒騎士から剥ぎ取った一般的な皮。', 120, 1),
  (gen_random_uuid(), '暗黒騎士の骨', 'MATERIAL', '暗黒騎士から剥ぎ取った一般的な骨。', 120, 1),
  (gen_random_uuid(), '暗黒騎士の鋭牙', 'MATERIAL', '暗黒騎士の稀少な部位。', 1200, 1),
  (gen_random_uuid(), '暗黒騎士の魔核', 'MATERIAL', '暗黒騎士の体内にある幻の魔核。', 12000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '暗黒騎士の武器', 'WEAPON', 'WEAPON_SWORD', '暗黒騎士の素材で作られた強力な武器。', 3000, 5, '{"attack": 90, "elementalAttack": "DARK", "elementalAttackValue": 30}'::jsonb),
  (gen_random_uuid(), '暗黒騎士の防具', 'ARMOR', NULL, '暗黒騎士の素材で作られた堅牢な防具。', 3000, 8, '{"defense": 72, "elementalResistance": "FIRE", "elementalResistanceValue": 30}'::jsonb),
  (gen_random_uuid(), '暗黒騎士の装飾', 'ACCESSORY', NULL, '暗黒騎士の魔核を用いた装飾品。', 4800, 1, '{"attack": 30, "defense": 24, "elementalAttack": "DARK", "elementalAttackValue": 12, "elementalResistance": "FIRE", "elementalResistanceValue": 12}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '暗黒騎士の武器', id, '[{"name":"暗黒騎士の皮","quantity":5},{"name":"暗黒騎士の骨","quantity":3},{"name":"暗黒騎士の鋭牙","quantity":1}]'::jsonb, 0, '暗黒騎士の武器のレシピ' FROM item_templates WHERE name = '暗黒騎士の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '暗黒騎士の防具', id, '[{"name":"暗黒騎士の皮","quantity":8},{"name":"暗黒騎士の鋭牙","quantity":1}]'::jsonb, 0, '暗黒騎士の防具のレシピ' FROM item_templates WHERE name = '暗黒騎士の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '暗黒騎士の装飾', id, '[{"name":"暗黒騎士の骨","quantity":3},{"name":"暗黒騎士の鋭牙","quantity":2},{"name":"暗黒騎士の魔核","quantity":1}]'::jsonb, 0, '暗黒騎士の装飾のレシピ' FROM item_templates WHERE name = '暗黒騎士の装飾' LIMIT 1;

-- フェニックス のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'フェニックスの皮', 'MATERIAL', 'フェニックスから剥ぎ取った一般的な皮。', 140, 1),
  (gen_random_uuid(), 'フェニックスの骨', 'MATERIAL', 'フェニックスから剥ぎ取った一般的な骨。', 140, 1),
  (gen_random_uuid(), 'フェニックスの鋭牙', 'MATERIAL', 'フェニックスの稀少な部位。', 1400, 1),
  (gen_random_uuid(), 'フェニックスの魔核', 'MATERIAL', 'フェニックスの体内にある幻の魔核。', 14000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'フェニックスの武器', 'WEAPON', 'WEAPON_SWORD', 'フェニックスの素材で作られた強力な武器。', 3500, 5, '{"attack": 105, "elementalAttack": "FIRE", "elementalAttackValue": 35}'::jsonb),
  (gen_random_uuid(), 'フェニックスの防具', 'ARMOR', NULL, 'フェニックスの素材で作られた堅牢な防具。', 3500, 8, '{"defense": 84, "elementalResistance": "LIGHT", "elementalResistanceValue": 35}'::jsonb),
  (gen_random_uuid(), 'フェニックスの装飾', 'ACCESSORY', NULL, 'フェニックスの魔核を用いた装飾品。', 5600, 1, '{"attack": 35, "defense": 28, "elementalAttack": "FIRE", "elementalAttackValue": 14, "elementalResistance": "LIGHT", "elementalResistanceValue": 14}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'フェニックスの武器', id, '[{"name":"フェニックスの皮","quantity":5},{"name":"フェニックスの骨","quantity":3},{"name":"フェニックスの鋭牙","quantity":1}]'::jsonb, 0, 'フェニックスの武器のレシピ' FROM item_templates WHERE name = 'フェニックスの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'フェニックスの防具', id, '[{"name":"フェニックスの皮","quantity":8},{"name":"フェニックスの鋭牙","quantity":1}]'::jsonb, 0, 'フェニックスの防具のレシピ' FROM item_templates WHERE name = 'フェニックスの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'フェニックスの装飾', id, '[{"name":"フェニックスの骨","quantity":3},{"name":"フェニックスの鋭牙","quantity":2},{"name":"フェニックスの魔核","quantity":1}]'::jsonb, 0, 'フェニックスの装飾のレシピ' FROM item_templates WHERE name = 'フェニックスの装飾' LIMIT 1;

-- リッチ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'リッチの皮', 'MATERIAL', 'リッチから剥ぎ取った一般的な皮。', 160, 1),
  (gen_random_uuid(), 'リッチの骨', 'MATERIAL', 'リッチから剥ぎ取った一般的な骨。', 160, 1),
  (gen_random_uuid(), 'リッチの鋭牙', 'MATERIAL', 'リッチの稀少な部位。', 1600, 1),
  (gen_random_uuid(), 'リッチの魔核', 'MATERIAL', 'リッチの体内にある幻の魔核。', 16000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'リッチの武器', 'WEAPON', 'WEAPON_SWORD', 'リッチの素材で作られた強力な武器。', 4000, 5, '{"attack": 120, "elementalAttack": "DARK", "elementalAttackValue": 40}'::jsonb),
  (gen_random_uuid(), 'リッチの防具', 'ARMOR', NULL, 'リッチの素材で作られた堅牢な防具。', 4000, 8, '{"defense": 96, "elementalResistance": "ICE", "elementalResistanceValue": 40}'::jsonb),
  (gen_random_uuid(), 'リッチの装飾', 'ACCESSORY', NULL, 'リッチの魔核を用いた装飾品。', 6400, 1, '{"attack": 40, "defense": 32, "elementalAttack": "DARK", "elementalAttackValue": 16, "elementalResistance": "ICE", "elementalResistanceValue": 16}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リッチの武器', id, '[{"name":"リッチの皮","quantity":5},{"name":"リッチの骨","quantity":3},{"name":"リッチの鋭牙","quantity":1}]'::jsonb, 0, 'リッチの武器のレシピ' FROM item_templates WHERE name = 'リッチの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リッチの防具', id, '[{"name":"リッチの皮","quantity":8},{"name":"リッチの鋭牙","quantity":1}]'::jsonb, 0, 'リッチの防具のレシピ' FROM item_templates WHERE name = 'リッチの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リッチの装飾', id, '[{"name":"リッチの骨","quantity":3},{"name":"リッチの鋭牙","quantity":2},{"name":"リッチの魔核","quantity":1}]'::jsonb, 0, 'リッチの装飾のレシピ' FROM item_templates WHERE name = 'リッチの装飾' LIMIT 1;

-- ヒュドラ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ヒュドラの皮', 'MATERIAL', 'ヒュドラから剥ぎ取った一般的な皮。', 150, 1),
  (gen_random_uuid(), 'ヒュドラの骨', 'MATERIAL', 'ヒュドラから剥ぎ取った一般的な骨。', 150, 1),
  (gen_random_uuid(), 'ヒュドラの鋭牙', 'MATERIAL', 'ヒュドラの稀少な部位。', 1500, 1),
  (gen_random_uuid(), 'ヒュドラの魔核', 'MATERIAL', 'ヒュドラの体内にある幻の魔核。', 15000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ヒュドラの武器', 'WEAPON', 'WEAPON_SWORD', 'ヒュドラの素材で作られた強力な武器。', 3750, 5, '{"attack": 112, "elementalAttack": "WATER", "elementalAttackValue": 37}'::jsonb),
  (gen_random_uuid(), 'ヒュドラの防具', 'ARMOR', NULL, 'ヒュドラの素材で作られた堅牢な防具。', 3750, 8, '{"defense": 90, "elementalResistance": "DARK", "elementalResistanceValue": 37}'::jsonb),
  (gen_random_uuid(), 'ヒュドラの装飾', 'ACCESSORY', NULL, 'ヒュドラの魔核を用いた装飾品。', 6000, 1, '{"attack": 37, "defense": 30, "elementalAttack": "WATER", "elementalAttackValue": 15, "elementalResistance": "DARK", "elementalResistanceValue": 15}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヒュドラの武器', id, '[{"name":"ヒュドラの皮","quantity":5},{"name":"ヒュドラの骨","quantity":3},{"name":"ヒュドラの鋭牙","quantity":1}]'::jsonb, 0, 'ヒュドラの武器のレシピ' FROM item_templates WHERE name = 'ヒュドラの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヒュドラの防具', id, '[{"name":"ヒュドラの皮","quantity":8},{"name":"ヒュドラの鋭牙","quantity":1}]'::jsonb, 0, 'ヒュドラの防具のレシピ' FROM item_templates WHERE name = 'ヒュドラの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヒュドラの装飾', id, '[{"name":"ヒュドラの骨","quantity":3},{"name":"ヒュドラの鋭牙","quantity":2},{"name":"ヒュドラの魔核","quantity":1}]'::jsonb, 0, 'ヒュドラの装飾のレシピ' FROM item_templates WHERE name = 'ヒュドラの装飾' LIMIT 1;

-- ミノタウロス のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ミノタウロスの皮', 'MATERIAL', 'ミノタウロスから剥ぎ取った一般的な皮。', 140, 1),
  (gen_random_uuid(), 'ミノタウロスの骨', 'MATERIAL', 'ミノタウロスから剥ぎ取った一般的な骨。', 140, 1),
  (gen_random_uuid(), 'ミノタウロスの鋭牙', 'MATERIAL', 'ミノタウロスの稀少な部位。', 1400, 1),
  (gen_random_uuid(), 'ミノタウロスの魔核', 'MATERIAL', 'ミノタウロスの体内にある幻の魔核。', 14000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ミノタウロスの武器', 'WEAPON', 'WEAPON_SWORD', 'ミノタウロスの素材で作られた強力な武器。', 3500, 5, '{"attack": 105, "elementalAttack": "EARTH", "elementalAttackValue": 35}'::jsonb),
  (gen_random_uuid(), 'ミノタウロスの防具', 'ARMOR', NULL, 'ミノタウロスの素材で作られた堅牢な防具。', 3500, 8, '{"defense": 84, "elementalResistance": "FIRE", "elementalResistanceValue": 35}'::jsonb),
  (gen_random_uuid(), 'ミノタウロスの装飾', 'ACCESSORY', NULL, 'ミノタウロスの魔核を用いた装飾品。', 5600, 1, '{"attack": 35, "defense": 28, "elementalAttack": "EARTH", "elementalAttackValue": 14, "elementalResistance": "FIRE", "elementalResistanceValue": 14}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミノタウロスの武器', id, '[{"name":"ミノタウロスの皮","quantity":5},{"name":"ミノタウロスの骨","quantity":3},{"name":"ミノタウロスの鋭牙","quantity":1}]'::jsonb, 0, 'ミノタウロスの武器のレシピ' FROM item_templates WHERE name = 'ミノタウロスの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミノタウロスの防具', id, '[{"name":"ミノタウロスの皮","quantity":8},{"name":"ミノタウロスの鋭牙","quantity":1}]'::jsonb, 0, 'ミノタウロスの防具のレシピ' FROM item_templates WHERE name = 'ミノタウロスの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミノタウロスの装飾', id, '[{"name":"ミノタウロスの骨","quantity":3},{"name":"ミノタウロスの鋭牙","quantity":2},{"name":"ミノタウロスの魔核","quantity":1}]'::jsonb, 0, 'ミノタウロスの装飾のレシピ' FROM item_templates WHERE name = 'ミノタウロスの装飾' LIMIT 1;

-- ドラゴン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ドラゴンの皮', 'MATERIAL', 'ドラゴンから剥ぎ取った一般的な皮。', 200, 1),
  (gen_random_uuid(), 'ドラゴンの骨', 'MATERIAL', 'ドラゴンから剥ぎ取った一般的な骨。', 200, 1),
  (gen_random_uuid(), 'ドラゴンの鋭牙', 'MATERIAL', 'ドラゴンの稀少な部位。', 2000, 1),
  (gen_random_uuid(), 'ドラゴンの魔核', 'MATERIAL', 'ドラゴンの体内にある幻の魔核。', 20000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ドラゴンの武器', 'WEAPON', 'WEAPON_SWORD', 'ドラゴンの素材で作られた強力な武器。', 5000, 5, '{"attack": 150, "elementalAttack": "FIRE", "elementalAttackValue": 50}'::jsonb),
  (gen_random_uuid(), 'ドラゴンの防具', 'ARMOR', NULL, 'ドラゴンの素材で作られた堅牢な防具。', 5000, 8, '{"defense": 120, "elementalResistance": "WIND", "elementalResistanceValue": 50}'::jsonb),
  (gen_random_uuid(), 'ドラゴンの装飾', 'ACCESSORY', NULL, 'ドラゴンの魔核を用いた装飾品。', 8000, 1, '{"attack": 50, "defense": 40, "elementalAttack": "FIRE", "elementalAttackValue": 20, "elementalResistance": "WIND", "elementalResistanceValue": 20}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ドラゴンの武器', id, '[{"name":"ドラゴンの皮","quantity":5},{"name":"ドラゴンの骨","quantity":3},{"name":"ドラゴンの鋭牙","quantity":1}]'::jsonb, 0, 'ドラゴンの武器のレシピ' FROM item_templates WHERE name = 'ドラゴンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ドラゴンの防具', id, '[{"name":"ドラゴンの皮","quantity":8},{"name":"ドラゴンの鋭牙","quantity":1}]'::jsonb, 0, 'ドラゴンの防具のレシピ' FROM item_templates WHERE name = 'ドラゴンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ドラゴンの装飾', id, '[{"name":"ドラゴンの骨","quantity":3},{"name":"ドラゴンの鋭牙","quantity":2},{"name":"ドラゴンの魔核","quantity":1}]'::jsonb, 0, 'ドラゴンの装飾のレシピ' FROM item_templates WHERE name = 'ドラゴンの装飾' LIMIT 1;

-- ゴルゴン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゴルゴンの皮', 'MATERIAL', 'ゴルゴンから剥ぎ取った一般的な皮。', 144, 1),
  (gen_random_uuid(), 'ゴルゴンの骨', 'MATERIAL', 'ゴルゴンから剥ぎ取った一般的な骨。', 144, 1),
  (gen_random_uuid(), 'ゴルゴンの鋭牙', 'MATERIAL', 'ゴルゴンの稀少な部位。', 1440, 1),
  (gen_random_uuid(), 'ゴルゴンの魔核', 'MATERIAL', 'ゴルゴンの体内にある幻の魔核。', 14400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ゴルゴンの武器', 'WEAPON', 'WEAPON_SWORD', 'ゴルゴンの素材で作られた強力な武器。', 3600, 5, '{"attack": 108, "elementalAttack": "EARTH", "elementalAttackValue": 36}'::jsonb),
  (gen_random_uuid(), 'ゴルゴンの防具', 'ARMOR', NULL, 'ゴルゴンの素材で作られた堅牢な防具。', 3600, 8, '{"defense": 86, "elementalResistance": "DARK", "elementalResistanceValue": 36}'::jsonb),
  (gen_random_uuid(), 'ゴルゴンの装飾', 'ACCESSORY', NULL, 'ゴルゴンの魔核を用いた装飾品。', 5760, 1, '{"attack": 36, "defense": 28, "elementalAttack": "EARTH", "elementalAttackValue": 14, "elementalResistance": "DARK", "elementalResistanceValue": 14}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゴルゴンの武器', id, '[{"name":"ゴルゴンの皮","quantity":5},{"name":"ゴルゴンの骨","quantity":3},{"name":"ゴルゴンの鋭牙","quantity":1}]'::jsonb, 0, 'ゴルゴンの武器のレシピ' FROM item_templates WHERE name = 'ゴルゴンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゴルゴンの防具', id, '[{"name":"ゴルゴンの皮","quantity":8},{"name":"ゴルゴンの鋭牙","quantity":1}]'::jsonb, 0, 'ゴルゴンの防具のレシピ' FROM item_templates WHERE name = 'ゴルゴンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ゴルゴンの装飾', id, '[{"name":"ゴルゴンの骨","quantity":3},{"name":"ゴルゴンの鋭牙","quantity":2},{"name":"ゴルゴンの魔核","quantity":1}]'::jsonb, 0, 'ゴルゴンの装飾のレシピ' FROM item_templates WHERE name = 'ゴルゴンの装飾' LIMIT 1;

-- ワイバーン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ワイバーンの皮', 'MATERIAL', 'ワイバーンから剥ぎ取った一般的な皮。', 170, 1),
  (gen_random_uuid(), 'ワイバーンの骨', 'MATERIAL', 'ワイバーンから剥ぎ取った一般的な骨。', 170, 1),
  (gen_random_uuid(), 'ワイバーンの鋭牙', 'MATERIAL', 'ワイバーンの稀少な部位。', 1700, 1),
  (gen_random_uuid(), 'ワイバーンの魔核', 'MATERIAL', 'ワイバーンの体内にある幻の魔核。', 17000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'ワイバーンの武器', 'WEAPON', 'WEAPON_SWORD', 'ワイバーンの素材で作られた強力な武器。', 4250, 5, '{"attack": 127, "elementalAttack": "WIND", "elementalAttackValue": 42}'::jsonb),
  (gen_random_uuid(), 'ワイバーンの防具', 'ARMOR', NULL, 'ワイバーンの素材で作られた堅牢な防具。', 4250, 8, '{"defense": 102, "elementalResistance": "THUNDER", "elementalResistanceValue": 42}'::jsonb),
  (gen_random_uuid(), 'ワイバーンの装飾', 'ACCESSORY', NULL, 'ワイバーンの魔核を用いた装飾品。', 6800, 1, '{"attack": 42, "defense": 34, "elementalAttack": "WIND", "elementalAttackValue": 17, "elementalResistance": "THUNDER", "elementalResistanceValue": 17}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ワイバーンの武器', id, '[{"name":"ワイバーンの皮","quantity":5},{"name":"ワイバーンの骨","quantity":3},{"name":"ワイバーンの鋭牙","quantity":1}]'::jsonb, 0, 'ワイバーンの武器のレシピ' FROM item_templates WHERE name = 'ワイバーンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ワイバーンの防具', id, '[{"name":"ワイバーンの皮","quantity":8},{"name":"ワイバーンの鋭牙","quantity":1}]'::jsonb, 0, 'ワイバーンの防具のレシピ' FROM item_templates WHERE name = 'ワイバーンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ワイバーンの装飾', id, '[{"name":"ワイバーンの骨","quantity":3},{"name":"ワイバーンの鋭牙","quantity":2},{"name":"ワイバーンの魔核","quantity":1}]'::jsonb, 0, 'ワイバーンの装飾のレシピ' FROM item_templates WHERE name = 'ワイバーンの装飾' LIMIT 1;

-- 魔王の手下 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '魔王の手下の皮', 'MATERIAL', '魔王の手下から剥ぎ取った一般的な皮。', 176, 1),
  (gen_random_uuid(), '魔王の手下の骨', 'MATERIAL', '魔王の手下から剥ぎ取った一般的な骨。', 176, 1),
  (gen_random_uuid(), '魔王の手下の鋭牙', 'MATERIAL', '魔王の手下の稀少な部位。', 1760, 1),
  (gen_random_uuid(), '魔王の手下の魔核', 'MATERIAL', '魔王の手下の体内にある幻の魔核。', 17600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '魔王の手下の武器', 'WEAPON', 'WEAPON_SWORD', '魔王の手下の素材で作られた強力な武器。', 4400, 5, '{"attack": 132, "elementalAttack": "DARK", "elementalAttackValue": 44}'::jsonb),
  (gen_random_uuid(), '魔王の手下の防具', 'ARMOR', NULL, '魔王の手下の素材で作られた堅牢な防具。', 4400, 8, '{"defense": 105, "elementalResistance": "FIRE", "elementalResistanceValue": 44}'::jsonb),
  (gen_random_uuid(), '魔王の手下の装飾', 'ACCESSORY', NULL, '魔王の手下の魔核を用いた装飾品。', 7040, 1, '{"attack": 44, "defense": 35, "elementalAttack": "DARK", "elementalAttackValue": 17, "elementalResistance": "FIRE", "elementalResistanceValue": 17}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の手下の武器', id, '[{"name":"魔王の手下の皮","quantity":5},{"name":"魔王の手下の骨","quantity":3},{"name":"魔王の手下の鋭牙","quantity":1}]'::jsonb, 0, '魔王の手下の武器のレシピ' FROM item_templates WHERE name = '魔王の手下の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の手下の防具', id, '[{"name":"魔王の手下の皮","quantity":8},{"name":"魔王の手下の鋭牙","quantity":1}]'::jsonb, 0, '魔王の手下の防具のレシピ' FROM item_templates WHERE name = '魔王の手下の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の手下の装飾', id, '[{"name":"魔王の手下の骨","quantity":3},{"name":"魔王の手下の鋭牙","quantity":2},{"name":"魔王の手下の魔核","quantity":1}]'::jsonb, 0, '魔王の手下の装飾のレシピ' FROM item_templates WHERE name = '魔王の手下の装飾' LIMIT 1;

-- 深淵の歩者 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '深淵の歩者の皮', 'MATERIAL', '深淵の歩者から剥ぎ取った一般的な皮。', 180, 1),
  (gen_random_uuid(), '深淵の歩者の骨', 'MATERIAL', '深淵の歩者から剥ぎ取った一般的な骨。', 180, 1),
  (gen_random_uuid(), '深淵の歩者の鋭牙', 'MATERIAL', '深淵の歩者の稀少な部位。', 1800, 1),
  (gen_random_uuid(), '深淵の歩者の魔核', 'MATERIAL', '深淵の歩者の体内にある幻の魔核。', 18000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '深淵の歩者の武器', 'WEAPON', 'WEAPON_SWORD', '深淵の歩者の素材で作られた強力な武器。', 4500, 5, '{"attack": 135, "elementalAttack": "DARK", "elementalAttackValue": 45}'::jsonb),
  (gen_random_uuid(), '深淵の歩者の防具', 'ARMOR', NULL, '深淵の歩者の素材で作られた堅牢な防具。', 4500, 8, '{"defense": 108, "elementalResistance": "ICE", "elementalResistanceValue": 45}'::jsonb),
  (gen_random_uuid(), '深淵の歩者の装飾', 'ACCESSORY', NULL, '深淵の歩者の魔核を用いた装飾品。', 7200, 1, '{"attack": 45, "defense": 36, "elementalAttack": "DARK", "elementalAttackValue": 18, "elementalResistance": "ICE", "elementalResistanceValue": 18}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '深淵の歩者の武器', id, '[{"name":"深淵の歩者の皮","quantity":5},{"name":"深淵の歩者の骨","quantity":3},{"name":"深淵の歩者の鋭牙","quantity":1}]'::jsonb, 0, '深淵の歩者の武器のレシピ' FROM item_templates WHERE name = '深淵の歩者の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '深淵の歩者の防具', id, '[{"name":"深淵の歩者の皮","quantity":8},{"name":"深淵の歩者の鋭牙","quantity":1}]'::jsonb, 0, '深淵の歩者の防具のレシピ' FROM item_templates WHERE name = '深淵の歩者の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '深淵の歩者の装飾', id, '[{"name":"深淵の歩者の骨","quantity":3},{"name":"深淵の歩者の鋭牙","quantity":2},{"name":"深淵の歩者の魔核","quantity":1}]'::jsonb, 0, '深淵の歩者の装飾のレシピ' FROM item_templates WHERE name = '深淵の歩者の装飾' LIMIT 1;

-- タイタン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'タイタンの皮', 'MATERIAL', 'タイタンから剥ぎ取った一般的な皮。', 190, 1),
  (gen_random_uuid(), 'タイタンの骨', 'MATERIAL', 'タイタンから剥ぎ取った一般的な骨。', 190, 1),
  (gen_random_uuid(), 'タイタンの鋭牙', 'MATERIAL', 'タイタンの稀少な部位。', 1900, 1),
  (gen_random_uuid(), 'タイタンの魔核', 'MATERIAL', 'タイタンの体内にある幻の魔核。', 19000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), 'タイタンの武器', 'WEAPON', 'WEAPON_SWORD', 'タイタンの素材で作られた強力な武器。', 4750, 5, '{"attack": 142, "elementalAttack": "EARTH", "elementalAttackValue": 47}'::jsonb),
  (gen_random_uuid(), 'タイタンの防具', 'ARMOR', NULL, 'タイタンの素材で作られた堅牢な防具。', 4750, 8, '{"defense": 114, "elementalResistance": "THUNDER", "elementalResistanceValue": 47}'::jsonb),
  (gen_random_uuid(), 'タイタンの装飾', 'ACCESSORY', NULL, 'タイタンの魔核を用いた装飾品。', 7600, 1, '{"attack": 47, "defense": 38, "elementalAttack": "EARTH", "elementalAttackValue": 19, "elementalResistance": "THUNDER", "elementalResistanceValue": 19}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'タイタンの武器', id, '[{"name":"タイタンの皮","quantity":5},{"name":"タイタンの骨","quantity":3},{"name":"タイタンの鋭牙","quantity":1}]'::jsonb, 0, 'タイタンの武器のレシピ' FROM item_templates WHERE name = 'タイタンの武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'タイタンの防具', id, '[{"name":"タイタンの皮","quantity":8},{"name":"タイタンの鋭牙","quantity":1}]'::jsonb, 0, 'タイタンの防具のレシピ' FROM item_templates WHERE name = 'タイタンの防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'タイタンの装飾', id, '[{"name":"タイタンの骨","quantity":3},{"name":"タイタンの鋭牙","quantity":2},{"name":"タイタンの魔核","quantity":1}]'::jsonb, 0, 'タイタンの装飾のレシピ' FROM item_templates WHERE name = 'タイタンの装飾' LIMIT 1;

-- 古竜 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '古竜の皮', 'MATERIAL', '古竜から剥ぎ取った一般的な皮。', 300, 1),
  (gen_random_uuid(), '古竜の骨', 'MATERIAL', '古竜から剥ぎ取った一般的な骨。', 300, 1),
  (gen_random_uuid(), '古竜の鋭牙', 'MATERIAL', '古竜の稀少な部位。', 3000, 1),
  (gen_random_uuid(), '古竜の魔核', 'MATERIAL', '古竜の体内にある幻の魔核。', 30000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '古竜の武器', 'WEAPON', 'WEAPON_SWORD', '古竜の素材で作られた強力な武器。', 7500, 5, '{"attack": 225, "elementalAttack": "LIGHT", "elementalAttackValue": 75}'::jsonb),
  (gen_random_uuid(), '古竜の防具', 'ARMOR', NULL, '古竜の素材で作られた堅牢な防具。', 7500, 8, '{"defense": 180, "elementalResistance": "DARK", "elementalResistanceValue": 75}'::jsonb),
  (gen_random_uuid(), '古竜の装飾', 'ACCESSORY', NULL, '古竜の魔核を用いた装飾品。', 12000, 1, '{"attack": 75, "defense": 60, "elementalAttack": "LIGHT", "elementalAttackValue": 30, "elementalResistance": "DARK", "elementalResistanceValue": 30}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '古竜の武器', id, '[{"name":"古竜の皮","quantity":5},{"name":"古竜の骨","quantity":3},{"name":"古竜の鋭牙","quantity":1}]'::jsonb, 0, '古竜の武器のレシピ' FROM item_templates WHERE name = '古竜の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '古竜の防具', id, '[{"name":"古竜の皮","quantity":8},{"name":"古竜の鋭牙","quantity":1}]'::jsonb, 0, '古竜の防具のレシピ' FROM item_templates WHERE name = '古竜の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '古竜の装飾', id, '[{"name":"古竜の骨","quantity":3},{"name":"古竜の鋭牙","quantity":2},{"name":"古竜の魔核","quantity":1}]'::jsonb, 0, '古竜の装飾のレシピ' FROM item_templates WHERE name = '古竜の装飾' LIMIT 1;

-- 魔王 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '魔王の皮', 'MATERIAL', '魔王から剥ぎ取った一般的な皮。', 400, 1),
  (gen_random_uuid(), '魔王の骨', 'MATERIAL', '魔王から剥ぎ取った一般的な骨。', 400, 1),
  (gen_random_uuid(), '魔王の鋭牙', 'MATERIAL', '魔王の稀少な部位。', 4000, 1),
  (gen_random_uuid(), '魔王の魔核', 'MATERIAL', '魔王の体内にある幻の魔核。', 40000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '魔王の武器', 'WEAPON', 'WEAPON_SWORD', '魔王の素材で作られた強力な武器。', 10000, 5, '{"attack": 300, "elementalAttack": "DARK", "elementalAttackValue": 100}'::jsonb),
  (gen_random_uuid(), '魔王の防具', 'ARMOR', NULL, '魔王の素材で作られた堅牢な防具。', 10000, 8, '{"defense": 240, "elementalResistance": "FIRE", "elementalResistanceValue": 100}'::jsonb),
  (gen_random_uuid(), '魔王の装飾', 'ACCESSORY', NULL, '魔王の魔核を用いた装飾品。', 16000, 1, '{"attack": 100, "defense": 80, "elementalAttack": "DARK", "elementalAttackValue": 40, "elementalResistance": "FIRE", "elementalResistanceValue": 40}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の武器', id, '[{"name":"魔王の皮","quantity":5},{"name":"魔王の骨","quantity":3},{"name":"魔王の鋭牙","quantity":1}]'::jsonb, 0, '魔王の武器のレシピ' FROM item_templates WHERE name = '魔王の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の防具', id, '[{"name":"魔王の皮","quantity":8},{"name":"魔王の鋭牙","quantity":1}]'::jsonb, 0, '魔王の防具のレシピ' FROM item_templates WHERE name = '魔王の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の装飾', id, '[{"name":"魔王の骨","quantity":3},{"name":"魔王の鋭牙","quantity":2},{"name":"魔王の魔核","quantity":1}]'::jsonb, 0, '魔王の装飾のレシピ' FROM item_templates WHERE name = '魔王の装飾' LIMIT 1;

-- 死神 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '死神の皮', 'MATERIAL', '死神から剥ぎ取った一般的な皮。', 360, 1),
  (gen_random_uuid(), '死神の骨', 'MATERIAL', '死神から剥ぎ取った一般的な骨。', 360, 1),
  (gen_random_uuid(), '死神の鋭牙', 'MATERIAL', '死神の稀少な部位。', 3600, 1),
  (gen_random_uuid(), '死神の魔核', 'MATERIAL', '死神の体内にある幻の魔核。', 36000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '死神の武器', 'WEAPON', 'WEAPON_SWORD', '死神の素材で作られた強力な武器。', 9000, 5, '{"attack": 270, "elementalAttack": "DARK", "elementalAttackValue": 90}'::jsonb),
  (gen_random_uuid(), '死神の防具', 'ARMOR', NULL, '死神の素材で作られた堅牢な防具。', 9000, 8, '{"defense": 216, "elementalResistance": "ICE", "elementalResistanceValue": 90}'::jsonb),
  (gen_random_uuid(), '死神の装飾', 'ACCESSORY', NULL, '死神の魔核を用いた装飾品。', 14400, 1, '{"attack": 90, "defense": 72, "elementalAttack": "DARK", "elementalAttackValue": 36, "elementalResistance": "ICE", "elementalResistanceValue": 36}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '死神の武器', id, '[{"name":"死神の皮","quantity":5},{"name":"死神の骨","quantity":3},{"name":"死神の鋭牙","quantity":1}]'::jsonb, 0, '死神の武器のレシピ' FROM item_templates WHERE name = '死神の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '死神の防具', id, '[{"name":"死神の皮","quantity":8},{"name":"死神の鋭牙","quantity":1}]'::jsonb, 0, '死神の防具のレシピ' FROM item_templates WHERE name = '死神の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '死神の装飾', id, '[{"name":"死神の骨","quantity":3},{"name":"死神の鋭牙","quantity":2},{"name":"死神の魔核","quantity":1}]'::jsonb, 0, '死神の装飾のレシピ' FROM item_templates WHERE name = '死神の装飾' LIMIT 1;

-- 堕天使 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '堕天使の皮', 'MATERIAL', '堕天使から剥ぎ取った一般的な皮。', 340, 1),
  (gen_random_uuid(), '堕天使の骨', 'MATERIAL', '堕天使から剥ぎ取った一般的な骨。', 340, 1),
  (gen_random_uuid(), '堕天使の鋭牙', 'MATERIAL', '堕天使の稀少な部位。', 3400, 1),
  (gen_random_uuid(), '堕天使の魔核', 'MATERIAL', '堕天使の体内にある幻の魔核。', 34000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '堕天使の武器', 'WEAPON', 'WEAPON_SWORD', '堕天使の素材で作られた強力な武器。', 8500, 5, '{"attack": 255, "elementalAttack": "LIGHT", "elementalAttackValue": 85}'::jsonb),
  (gen_random_uuid(), '堕天使の防具', 'ARMOR', NULL, '堕天使の素材で作られた堅牢な防具。', 8500, 8, '{"defense": 204, "elementalResistance": "DARK", "elementalResistanceValue": 85}'::jsonb),
  (gen_random_uuid(), '堕天使の装飾', 'ACCESSORY', NULL, '堕天使の魔核を用いた装飾品。', 13600, 1, '{"attack": 85, "defense": 68, "elementalAttack": "LIGHT", "elementalAttackValue": 34, "elementalResistance": "DARK", "elementalResistanceValue": 34}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '堕天使の武器', id, '[{"name":"堕天使の皮","quantity":5},{"name":"堕天使の骨","quantity":3},{"name":"堕天使の鋭牙","quantity":1}]'::jsonb, 0, '堕天使の武器のレシピ' FROM item_templates WHERE name = '堕天使の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '堕天使の防具', id, '[{"name":"堕天使の皮","quantity":8},{"name":"堕天使の鋭牙","quantity":1}]'::jsonb, 0, '堕天使の防具のレシピ' FROM item_templates WHERE name = '堕天使の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '堕天使の装飾', id, '[{"name":"堕天使の骨","quantity":3},{"name":"堕天使の鋭牙","quantity":2},{"name":"堕天使の魔核","quantity":1}]'::jsonb, 0, '堕天使の装飾のレシピ' FROM item_templates WHERE name = '堕天使の装飾' LIMIT 1;

-- 混沌の神 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '混沌の神の皮', 'MATERIAL', '混沌の神から剥ぎ取った一般的な皮。', 500, 1),
  (gen_random_uuid(), '混沌の神の骨', 'MATERIAL', '混沌の神から剥ぎ取った一般的な骨。', 500, 1),
  (gen_random_uuid(), '混沌の神の鋭牙', 'MATERIAL', '混沌の神の稀少な部位。', 5000, 1),
  (gen_random_uuid(), '混沌の神の魔核', 'MATERIAL', '混沌の神の体内にある幻の魔核。', 50000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, properties) VALUES
  (gen_random_uuid(), '混沌の神の武器', 'WEAPON', 'WEAPON_SWORD', '混沌の神の素材で作られた強力な武器。', 12500, 5, '{"attack": 375, "elementalAttack": "DARK", "elementalAttackValue": 125}'::jsonb),
  (gen_random_uuid(), '混沌の神の防具', 'ARMOR', NULL, '混沌の神の素材で作られた堅牢な防具。', 12500, 8, '{"defense": 300, "elementalResistance": "LIGHT", "elementalResistanceValue": 125}'::jsonb),
  (gen_random_uuid(), '混沌の神の装飾', 'ACCESSORY', NULL, '混沌の神の魔核を用いた装飾品。', 20000, 1, '{"attack": 125, "defense": 100, "elementalAttack": "DARK", "elementalAttackValue": 50, "elementalResistance": "LIGHT", "elementalResistanceValue": 50}'::jsonb);

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '混沌の神の武器', id, '[{"name":"混沌の神の皮","quantity":5},{"name":"混沌の神の骨","quantity":3},{"name":"混沌の神の鋭牙","quantity":1}]'::jsonb, 0, '混沌の神の武器のレシピ' FROM item_templates WHERE name = '混沌の神の武器' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '混沌の神の防具', id, '[{"name":"混沌の神の皮","quantity":8},{"name":"混沌の神の鋭牙","quantity":1}]'::jsonb, 0, '混沌の神の防具のレシピ' FROM item_templates WHERE name = '混沌の神の防具' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '混沌の神の装飾', id, '[{"name":"混沌の神の骨","quantity":3},{"name":"混沌の神の鋭牙","quantity":2},{"name":"混沌の神の魔核","quantity":1}]'::jsonb, 0, '混沌の神の装飾のレシピ' FROM item_templates WHERE name = '混沌の神の装飾' LIMIT 1;
