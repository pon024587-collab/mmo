-- Migration 013: 全魔物の素材と装備一式

-- スライム のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'スライムの皮', 'MATERIAL', 'スライムから剥ぎ取った一般的な皮。', 10, 1),
  (gen_random_uuid(), 'スライムの骨', 'MATERIAL', 'スライムから剥ぎ取った一般的な骨。', 10, 1),
  (gen_random_uuid(), 'スライムの鋭牙', 'MATERIAL', 'スライムの稀少な部位。', 100, 1),
  (gen_random_uuid(), 'スライムの魔核', 'MATERIAL', 'スライムの体内にある幻の魔核。', 1000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'スライムの武器', 'WEAPON', 'WEAPON_SWORD', 'スライムの素材で作られた強力な武器。', 250, 5, '{"attack": 7, "elementalAttack": "WATER", "elementalAttackValue": 2}'::jsonb),
  (gen_random_uuid(), 'スライムの防具', 'ARMOR', NULL, 'スライムの素材で作られた堅牢な防具。', 250, 8, '{"defense": 6, "elementalResistance": "ICE", "elementalResistanceValue": 2}'::jsonb),
  (gen_random_uuid(), 'スライムの装飾', 'ACCESSORY', NULL, 'スライムの魔核を用いた装飾品。', 400, 1, '{"attack": 2, "defense": 2, "elementalAttack": "WATER", "elementalAttackValue": 1, "elementalResistance": "ICE", "elementalResistanceValue": 1}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'スライムの武器' LIMIT 1), '{"スライムの皮": 5, "スライムの骨": 3, "スライムの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'スライムの防具' LIMIT 1), '{"スライムの皮": 8, "スライムの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'スライムの装飾' LIMIT 1), '{"スライムの骨": 3, "スライムの鋭牙": 2, "スライムの魔核": 1}'::jsonb);

-- コウモリ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'コウモリの皮', 'MATERIAL', 'コウモリから剥ぎ取った一般的な皮。', 16, 1),
  (gen_random_uuid(), 'コウモリの骨', 'MATERIAL', 'コウモリから剥ぎ取った一般的な骨。', 16, 1),
  (gen_random_uuid(), 'コウモリの鋭牙', 'MATERIAL', 'コウモリの稀少な部位。', 160, 1),
  (gen_random_uuid(), 'コウモリの魔核', 'MATERIAL', 'コウモリの体内にある幻の魔核。', 1600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'コウモリの武器', 'WEAPON', 'WEAPON_SWORD', 'コウモリの素材で作られた強力な武器。', 400, 5, '{"attack": 12, "elementalAttack": "WIND", "elementalAttackValue": 4}'::jsonb),
  (gen_random_uuid(), 'コウモリの防具', 'ARMOR', NULL, 'コウモリの素材で作られた堅牢な防具。', 400, 8, '{"defense": 9, "elementalResistance": "DARK", "elementalResistanceValue": 4}'::jsonb),
  (gen_random_uuid(), 'コウモリの装飾', 'ACCESSORY', NULL, 'コウモリの魔核を用いた装飾品。', 640, 1, '{"attack": 4, "defense": 3, "elementalAttack": "WIND", "elementalAttackValue": 1, "elementalResistance": "DARK", "elementalResistanceValue": 1}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'コウモリの武器' LIMIT 1), '{"コウモリの皮": 5, "コウモリの骨": 3, "コウモリの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'コウモリの防具' LIMIT 1), '{"コウモリの皮": 8, "コウモリの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'コウモリの装飾' LIMIT 1), '{"コウモリの骨": 3, "コウモリの鋭牙": 2, "コウモリの魔核": 1}'::jsonb);

-- 大ネズミ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '大ネズミの皮', 'MATERIAL', '大ネズミから剥ぎ取った一般的な皮。', 16, 1),
  (gen_random_uuid(), '大ネズミの骨', 'MATERIAL', '大ネズミから剥ぎ取った一般的な骨。', 16, 1),
  (gen_random_uuid(), '大ネズミの鋭牙', 'MATERIAL', '大ネズミの稀少な部位。', 160, 1),
  (gen_random_uuid(), '大ネズミの魔核', 'MATERIAL', '大ネズミの体内にある幻の魔核。', 1600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '大ネズミの武器', 'WEAPON', 'WEAPON_SWORD', '大ネズミの素材で作られた強力な武器。', 400, 5, '{"attack": 12, "elementalAttack": "EARTH", "elementalAttackValue": 4}'::jsonb),
  (gen_random_uuid(), '大ネズミの防具', 'ARMOR', NULL, '大ネズミの素材で作られた堅牢な防具。', 400, 8, '{"defense": 9, "elementalResistance": "DARK", "elementalResistanceValue": 4}'::jsonb),
  (gen_random_uuid(), '大ネズミの装飾', 'ACCESSORY', NULL, '大ネズミの魔核を用いた装飾品。', 640, 1, '{"attack": 4, "defense": 3, "elementalAttack": "EARTH", "elementalAttackValue": 1, "elementalResistance": "DARK", "elementalResistanceValue": 1}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '大ネズミの武器' LIMIT 1), '{"大ネズミの皮": 5, "大ネズミの骨": 3, "大ネズミの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '大ネズミの防具' LIMIT 1), '{"大ネズミの皮": 8, "大ネズミの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '大ネズミの装飾' LIMIT 1), '{"大ネズミの骨": 3, "大ネズミの鋭牙": 2, "大ネズミの魔核": 1}'::jsonb);

-- ゴブリン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゴブリンの皮', 'MATERIAL', 'ゴブリンから剥ぎ取った一般的な皮。', 20, 1),
  (gen_random_uuid(), 'ゴブリンの骨', 'MATERIAL', 'ゴブリンから剥ぎ取った一般的な骨。', 20, 1),
  (gen_random_uuid(), 'ゴブリンの鋭牙', 'MATERIAL', 'ゴブリンの稀少な部位。', 200, 1),
  (gen_random_uuid(), 'ゴブリンの魔核', 'MATERIAL', 'ゴブリンの体内にある幻の魔核。', 2000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ゴブリンの武器', 'WEAPON', 'WEAPON_SWORD', 'ゴブリンの素材で作られた強力な武器。', 500, 5, '{"attack": 15, "elementalAttack": "EARTH", "elementalAttackValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゴブリンの防具', 'ARMOR', NULL, 'ゴブリンの素材で作られた堅牢な防具。', 500, 8, '{"defense": 12, "elementalResistance": "FIRE", "elementalResistanceValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゴブリンの装飾', 'ACCESSORY', NULL, 'ゴブリンの魔核を用いた装飾品。', 800, 1, '{"attack": 5, "defense": 4, "elementalAttack": "EARTH", "elementalAttackValue": 2, "elementalResistance": "FIRE", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ゴブリンの武器' LIMIT 1), '{"ゴブリンの皮": 5, "ゴブリンの骨": 3, "ゴブリンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゴブリンの防具' LIMIT 1), '{"ゴブリンの皮": 8, "ゴブリンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゴブリンの装飾' LIMIT 1), '{"ゴブリンの骨": 3, "ゴブリンの鋭牙": 2, "ゴブリンの魔核": 1}'::jsonb);

-- スケルトン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'スケルトンの皮', 'MATERIAL', 'スケルトンから剥ぎ取った一般的な皮。', 20, 1),
  (gen_random_uuid(), 'スケルトンの骨', 'MATERIAL', 'スケルトンから剥ぎ取った一般的な骨。', 20, 1),
  (gen_random_uuid(), 'スケルトンの鋭牙', 'MATERIAL', 'スケルトンの稀少な部位。', 200, 1),
  (gen_random_uuid(), 'スケルトンの魔核', 'MATERIAL', 'スケルトンの体内にある幻の魔核。', 2000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'スケルトンの武器', 'WEAPON', 'WEAPON_SWORD', 'スケルトンの素材で作られた強力な武器。', 500, 5, '{"attack": 15, "elementalAttack": "DARK", "elementalAttackValue": 5}'::jsonb),
  (gen_random_uuid(), 'スケルトンの防具', 'ARMOR', NULL, 'スケルトンの素材で作られた堅牢な防具。', 500, 8, '{"defense": 12, "elementalResistance": "EARTH", "elementalResistanceValue": 5}'::jsonb),
  (gen_random_uuid(), 'スケルトンの装飾', 'ACCESSORY', NULL, 'スケルトンの魔核を用いた装飾品。', 800, 1, '{"attack": 5, "defense": 4, "elementalAttack": "DARK", "elementalAttackValue": 2, "elementalResistance": "EARTH", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'スケルトンの武器' LIMIT 1), '{"スケルトンの皮": 5, "スケルトンの骨": 3, "スケルトンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'スケルトンの防具' LIMIT 1), '{"スケルトンの皮": 8, "スケルトンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'スケルトンの装飾' LIMIT 1), '{"スケルトンの骨": 3, "スケルトンの鋭牙": 2, "スケルトンの魔核": 1}'::jsonb);

-- ゾンビ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゾンビの皮', 'MATERIAL', 'ゾンビから剥ぎ取った一般的な皮。', 20, 1),
  (gen_random_uuid(), 'ゾンビの骨', 'MATERIAL', 'ゾンビから剥ぎ取った一般的な骨。', 20, 1),
  (gen_random_uuid(), 'ゾンビの鋭牙', 'MATERIAL', 'ゾンビの稀少な部位。', 200, 1),
  (gen_random_uuid(), 'ゾンビの魔核', 'MATERIAL', 'ゾンビの体内にある幻の魔核。', 2000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ゾンビの武器', 'WEAPON', 'WEAPON_SWORD', 'ゾンビの素材で作られた強力な武器。', 500, 5, '{"attack": 15, "elementalAttack": "DARK", "elementalAttackValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゾンビの防具', 'ARMOR', NULL, 'ゾンビの素材で作られた堅牢な防具。', 500, 8, '{"defense": 12, "elementalResistance": "WATER", "elementalResistanceValue": 5}'::jsonb),
  (gen_random_uuid(), 'ゾンビの装飾', 'ACCESSORY', NULL, 'ゾンビの魔核を用いた装飾品。', 800, 1, '{"attack": 5, "defense": 4, "elementalAttack": "DARK", "elementalAttackValue": 2, "elementalResistance": "WATER", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ゾンビの武器' LIMIT 1), '{"ゾンビの皮": 5, "ゾンビの骨": 3, "ゾンビの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゾンビの防具' LIMIT 1), '{"ゾンビの皮": 8, "ゾンビの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゾンビの装飾' LIMIT 1), '{"ゾンビの骨": 3, "ゾンビの鋭牙": 2, "ゾンビの魔核": 1}'::jsonb);

-- 毒蜘蛛 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '毒蜘蛛の皮', 'MATERIAL', '毒蜘蛛から剥ぎ取った一般的な皮。', 24, 1),
  (gen_random_uuid(), '毒蜘蛛の骨', 'MATERIAL', '毒蜘蛛から剥ぎ取った一般的な骨。', 24, 1),
  (gen_random_uuid(), '毒蜘蛛の鋭牙', 'MATERIAL', '毒蜘蛛の稀少な部位。', 240, 1),
  (gen_random_uuid(), '毒蜘蛛の魔核', 'MATERIAL', '毒蜘蛛の体内にある幻の魔核。', 2400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '毒蜘蛛の武器', 'WEAPON', 'WEAPON_SWORD', '毒蜘蛛の素材で作られた強力な武器。', 600, 5, '{"attack": 18, "elementalAttack": "DARK", "elementalAttackValue": 6}'::jsonb),
  (gen_random_uuid(), '毒蜘蛛の防具', 'ARMOR', NULL, '毒蜘蛛の素材で作られた堅牢な防具。', 600, 8, '{"defense": 14, "elementalResistance": "EARTH", "elementalResistanceValue": 6}'::jsonb),
  (gen_random_uuid(), '毒蜘蛛の装飾', 'ACCESSORY', NULL, '毒蜘蛛の魔核を用いた装飾品。', 960, 1, '{"attack": 6, "defense": 4, "elementalAttack": "DARK", "elementalAttackValue": 2, "elementalResistance": "EARTH", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '毒蜘蛛の武器' LIMIT 1), '{"毒蜘蛛の皮": 5, "毒蜘蛛の骨": 3, "毒蜘蛛の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '毒蜘蛛の防具' LIMIT 1), '{"毒蜘蛛の皮": 8, "毒蜘蛛の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '毒蜘蛛の装飾' LIMIT 1), '{"毒蜘蛛の骨": 3, "毒蜘蛛の鋭牙": 2, "毒蜘蛛の魔核": 1}'::jsonb);

-- コボルト のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'コボルトの皮', 'MATERIAL', 'コボルトから剥ぎ取った一般的な皮。', 24, 1),
  (gen_random_uuid(), 'コボルトの骨', 'MATERIAL', 'コボルトから剥ぎ取った一般的な骨。', 24, 1),
  (gen_random_uuid(), 'コボルトの鋭牙', 'MATERIAL', 'コボルトの稀少な部位。', 240, 1),
  (gen_random_uuid(), 'コボルトの魔核', 'MATERIAL', 'コボルトの体内にある幻の魔核。', 2400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'コボルトの武器', 'WEAPON', 'WEAPON_SWORD', 'コボルトの素材で作られた強力な武器。', 600, 5, '{"attack": 18, "elementalAttack": "EARTH", "elementalAttackValue": 6}'::jsonb),
  (gen_random_uuid(), 'コボルトの防具', 'ARMOR', NULL, 'コボルトの素材で作られた堅牢な防具。', 600, 8, '{"defense": 14, "elementalResistance": "WIND", "elementalResistanceValue": 6}'::jsonb),
  (gen_random_uuid(), 'コボルトの装飾', 'ACCESSORY', NULL, 'コボルトの魔核を用いた装飾品。', 960, 1, '{"attack": 6, "defense": 4, "elementalAttack": "EARTH", "elementalAttackValue": 2, "elementalResistance": "WIND", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'コボルトの武器' LIMIT 1), '{"コボルトの皮": 5, "コボルトの骨": 3, "コボルトの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'コボルトの防具' LIMIT 1), '{"コボルトの皮": 8, "コボルトの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'コボルトの装飾' LIMIT 1), '{"コボルトの骨": 3, "コボルトの鋭牙": 2, "コボルトの魔核": 1}'::jsonb);

-- ホブゴブリン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ホブゴブリンの皮', 'MATERIAL', 'ホブゴブリンから剥ぎ取った一般的な皮。', 26, 1),
  (gen_random_uuid(), 'ホブゴブリンの骨', 'MATERIAL', 'ホブゴブリンから剥ぎ取った一般的な骨。', 26, 1),
  (gen_random_uuid(), 'ホブゴブリンの鋭牙', 'MATERIAL', 'ホブゴブリンの稀少な部位。', 260, 1),
  (gen_random_uuid(), 'ホブゴブリンの魔核', 'MATERIAL', 'ホブゴブリンの体内にある幻の魔核。', 2600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ホブゴブリンの武器', 'WEAPON', 'WEAPON_SWORD', 'ホブゴブリンの素材で作られた強力な武器。', 650, 5, '{"attack": 19, "elementalAttack": "EARTH", "elementalAttackValue": 6}'::jsonb),
  (gen_random_uuid(), 'ホブゴブリンの防具', 'ARMOR', NULL, 'ホブゴブリンの素材で作られた堅牢な防具。', 650, 8, '{"defense": 15, "elementalResistance": "FIRE", "elementalResistanceValue": 6}'::jsonb),
  (gen_random_uuid(), 'ホブゴブリンの装飾', 'ACCESSORY', NULL, 'ホブゴブリンの魔核を用いた装飾品。', 1040, 1, '{"attack": 6, "defense": 5, "elementalAttack": "EARTH", "elementalAttackValue": 2, "elementalResistance": "FIRE", "elementalResistanceValue": 2}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ホブゴブリンの武器' LIMIT 1), '{"ホブゴブリンの皮": 5, "ホブゴブリンの骨": 3, "ホブゴブリンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ホブゴブリンの防具' LIMIT 1), '{"ホブゴブリンの皮": 8, "ホブゴブリンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ホブゴブリンの装飾' LIMIT 1), '{"ホブゴブリンの骨": 3, "ホブゴブリンの鋭牙": 2, "ホブゴブリンの魔核": 1}'::jsonb);

-- 狼 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '狼の皮', 'MATERIAL', '狼から剥ぎ取った一般的な皮。', 30, 1),
  (gen_random_uuid(), '狼の骨', 'MATERIAL', '狼から剥ぎ取った一般的な骨。', 30, 1),
  (gen_random_uuid(), '狼の鋭牙', 'MATERIAL', '狼の稀少な部位。', 300, 1),
  (gen_random_uuid(), '狼の魔核', 'MATERIAL', '狼の体内にある幻の魔核。', 3000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '狼の武器', 'WEAPON', 'WEAPON_SWORD', '狼の素材で作られた強力な武器。', 750, 5, '{"attack": 22, "elementalAttack": "WIND", "elementalAttackValue": 7}'::jsonb),
  (gen_random_uuid(), '狼の防具', 'ARMOR', NULL, '狼の素材で作られた堅牢な防具。', 750, 8, '{"defense": 18, "elementalResistance": "ICE", "elementalResistanceValue": 7}'::jsonb),
  (gen_random_uuid(), '狼の装飾', 'ACCESSORY', NULL, '狼の魔核を用いた装飾品。', 1200, 1, '{"attack": 7, "defense": 6, "elementalAttack": "WIND", "elementalAttackValue": 3, "elementalResistance": "ICE", "elementalResistanceValue": 3}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '狼の武器' LIMIT 1), '{"狼の皮": 5, "狼の骨": 3, "狼の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '狼の防具' LIMIT 1), '{"狼の皮": 8, "狼の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '狼の装飾' LIMIT 1), '{"狼の骨": 3, "狼の鋭牙": 2, "狼の魔核": 1}'::jsonb);

-- グレムリン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'グレムリンの皮', 'MATERIAL', 'グレムリンから剥ぎ取った一般的な皮。', 36, 1),
  (gen_random_uuid(), 'グレムリンの骨', 'MATERIAL', 'グレムリンから剥ぎ取った一般的な骨。', 36, 1),
  (gen_random_uuid(), 'グレムリンの鋭牙', 'MATERIAL', 'グレムリンの稀少な部位。', 360, 1),
  (gen_random_uuid(), 'グレムリンの魔核', 'MATERIAL', 'グレムリンの体内にある幻の魔核。', 3600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'グレムリンの武器', 'WEAPON', 'WEAPON_SWORD', 'グレムリンの素材で作られた強力な武器。', 900, 5, '{"attack": 27, "elementalAttack": "THUNDER", "elementalAttackValue": 9}'::jsonb),
  (gen_random_uuid(), 'グレムリンの防具', 'ARMOR', NULL, 'グレムリンの素材で作られた堅牢な防具。', 900, 8, '{"defense": 21, "elementalResistance": "WIND", "elementalResistanceValue": 9}'::jsonb),
  (gen_random_uuid(), 'グレムリンの装飾', 'ACCESSORY', NULL, 'グレムリンの魔核を用いた装飾品。', 1440, 1, '{"attack": 9, "defense": 7, "elementalAttack": "THUNDER", "elementalAttackValue": 3, "elementalResistance": "WIND", "elementalResistanceValue": 3}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'グレムリンの武器' LIMIT 1), '{"グレムリンの皮": 5, "グレムリンの骨": 3, "グレムリンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'グレムリンの防具' LIMIT 1), '{"グレムリンの皮": 8, "グレムリンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'グレムリンの装飾' LIMIT 1), '{"グレムリンの骨": 3, "グレムリンの鋭牙": 2, "グレムリンの魔核": 1}'::jsonb);

-- ハーピー のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ハーピーの皮', 'MATERIAL', 'ハーピーから剥ぎ取った一般的な皮。', 40, 1),
  (gen_random_uuid(), 'ハーピーの骨', 'MATERIAL', 'ハーピーから剥ぎ取った一般的な骨。', 40, 1),
  (gen_random_uuid(), 'ハーピーの鋭牙', 'MATERIAL', 'ハーピーの稀少な部位。', 400, 1),
  (gen_random_uuid(), 'ハーピーの魔核', 'MATERIAL', 'ハーピーの体内にある幻の魔核。', 4000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ハーピーの武器', 'WEAPON', 'WEAPON_SWORD', 'ハーピーの素材で作られた強力な武器。', 1000, 5, '{"attack": 30, "elementalAttack": "WIND", "elementalAttackValue": 10}'::jsonb),
  (gen_random_uuid(), 'ハーピーの防具', 'ARMOR', NULL, 'ハーピーの素材で作られた堅牢な防具。', 1000, 8, '{"defense": 24, "elementalResistance": "THUNDER", "elementalResistanceValue": 10}'::jsonb),
  (gen_random_uuid(), 'ハーピーの装飾', 'ACCESSORY', NULL, 'ハーピーの魔核を用いた装飾品。', 1600, 1, '{"attack": 10, "defense": 8, "elementalAttack": "WIND", "elementalAttackValue": 4, "elementalResistance": "THUNDER", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ハーピーの武器' LIMIT 1), '{"ハーピーの皮": 5, "ハーピーの骨": 3, "ハーピーの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ハーピーの防具' LIMIT 1), '{"ハーピーの皮": 8, "ハーピーの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ハーピーの装飾' LIMIT 1), '{"ハーピーの骨": 3, "ハーピーの鋭牙": 2, "ハーピーの魔核": 1}'::jsonb);

-- 盗賊 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '盗賊の皮', 'MATERIAL', '盗賊から剥ぎ取った一般的な皮。', 40, 1),
  (gen_random_uuid(), '盗賊の骨', 'MATERIAL', '盗賊から剥ぎ取った一般的な骨。', 40, 1),
  (gen_random_uuid(), '盗賊の鋭牙', 'MATERIAL', '盗賊の稀少な部位。', 400, 1),
  (gen_random_uuid(), '盗賊の魔核', 'MATERIAL', '盗賊の体内にある幻の魔核。', 4000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '盗賊の武器', 'WEAPON', 'WEAPON_SWORD', '盗賊の素材で作られた強力な武器。', 1000, 5, '{"attack": 30, "elementalAttack": "DARK", "elementalAttackValue": 10}'::jsonb),
  (gen_random_uuid(), '盗賊の防具', 'ARMOR', NULL, '盗賊の素材で作られた堅牢な防具。', 1000, 8, '{"defense": 24, "elementalResistance": "EARTH", "elementalResistanceValue": 10}'::jsonb),
  (gen_random_uuid(), '盗賊の装飾', 'ACCESSORY', NULL, '盗賊の魔核を用いた装飾品。', 1600, 1, '{"attack": 10, "defense": 8, "elementalAttack": "DARK", "elementalAttackValue": 4, "elementalResistance": "EARTH", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '盗賊の武器' LIMIT 1), '{"盗賊の皮": 5, "盗賊の骨": 3, "盗賊の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '盗賊の防具' LIMIT 1), '{"盗賊の皮": 8, "盗賊の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '盗賊の装飾' LIMIT 1), '{"盗賊の骨": 3, "盗賊の鋭牙": 2, "盗賊の魔核": 1}'::jsonb);

-- リザードマン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'リザードマンの皮', 'MATERIAL', 'リザードマンから剥ぎ取った一般的な皮。', 44, 1),
  (gen_random_uuid(), 'リザードマンの骨', 'MATERIAL', 'リザードマンから剥ぎ取った一般的な骨。', 44, 1),
  (gen_random_uuid(), 'リザードマンの鋭牙', 'MATERIAL', 'リザードマンの稀少な部位。', 440, 1),
  (gen_random_uuid(), 'リザードマンの魔核', 'MATERIAL', 'リザードマンの体内にある幻の魔核。', 4400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'リザードマンの武器', 'WEAPON', 'WEAPON_SWORD', 'リザードマンの素材で作られた強力な武器。', 1100, 5, '{"attack": 33, "elementalAttack": "WATER", "elementalAttackValue": 11}'::jsonb),
  (gen_random_uuid(), 'リザードマンの防具', 'ARMOR', NULL, 'リザードマンの素材で作られた堅牢な防具。', 1100, 8, '{"defense": 26, "elementalResistance": "EARTH", "elementalResistanceValue": 11}'::jsonb),
  (gen_random_uuid(), 'リザードマンの装飾', 'ACCESSORY', NULL, 'リザードマンの魔核を用いた装飾品。', 1760, 1, '{"attack": 11, "defense": 8, "elementalAttack": "WATER", "elementalAttackValue": 4, "elementalResistance": "EARTH", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'リザードマンの武器' LIMIT 1), '{"リザードマンの皮": 5, "リザードマンの骨": 3, "リザードマンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'リザードマンの防具' LIMIT 1), '{"リザードマンの皮": 8, "リザードマンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'リザードマンの装飾' LIMIT 1), '{"リザードマンの骨": 3, "リザードマンの鋭牙": 2, "リザードマンの魔核": 1}'::jsonb);

-- ミイラ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ミイラの皮', 'MATERIAL', 'ミイラから剥ぎ取った一般的な皮。', 44, 1),
  (gen_random_uuid(), 'ミイラの骨', 'MATERIAL', 'ミイラから剥ぎ取った一般的な骨。', 44, 1),
  (gen_random_uuid(), 'ミイラの鋭牙', 'MATERIAL', 'ミイラの稀少な部位。', 440, 1),
  (gen_random_uuid(), 'ミイラの魔核', 'MATERIAL', 'ミイラの体内にある幻の魔核。', 4400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ミイラの武器', 'WEAPON', 'WEAPON_SWORD', 'ミイラの素材で作られた強力な武器。', 1100, 5, '{"attack": 33, "elementalAttack": "DARK", "elementalAttackValue": 11}'::jsonb),
  (gen_random_uuid(), 'ミイラの防具', 'ARMOR', NULL, 'ミイラの素材で作られた堅牢な防具。', 1100, 8, '{"defense": 26, "elementalResistance": "EARTH", "elementalResistanceValue": 11}'::jsonb),
  (gen_random_uuid(), 'ミイラの装飾', 'ACCESSORY', NULL, 'ミイラの魔核を用いた装飾品。', 1760, 1, '{"attack": 11, "defense": 8, "elementalAttack": "DARK", "elementalAttackValue": 4, "elementalResistance": "EARTH", "elementalResistanceValue": 4}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ミイラの武器' LIMIT 1), '{"ミイラの皮": 5, "ミイラの骨": 3, "ミイラの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ミイラの防具' LIMIT 1), '{"ミイラの皮": 8, "ミイラの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ミイラの装飾' LIMIT 1), '{"ミイラの骨": 3, "ミイラの鋭牙": 2, "ミイラの魔核": 1}'::jsonb);

-- オーク のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'オークの皮', 'MATERIAL', 'オークから剥ぎ取った一般的な皮。', 50, 1),
  (gen_random_uuid(), 'オークの骨', 'MATERIAL', 'オークから剥ぎ取った一般的な骨。', 50, 1),
  (gen_random_uuid(), 'オークの鋭牙', 'MATERIAL', 'オークの稀少な部位。', 500, 1),
  (gen_random_uuid(), 'オークの魔核', 'MATERIAL', 'オークの体内にある幻の魔核。', 5000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'オークの武器', 'WEAPON', 'WEAPON_SWORD', 'オークの素材で作られた強力な武器。', 1250, 5, '{"attack": 37, "elementalAttack": "EARTH", "elementalAttackValue": 12}'::jsonb),
  (gen_random_uuid(), 'オークの防具', 'ARMOR', NULL, 'オークの素材で作られた堅牢な防具。', 1250, 8, '{"defense": 30, "elementalResistance": "FIRE", "elementalResistanceValue": 12}'::jsonb),
  (gen_random_uuid(), 'オークの装飾', 'ACCESSORY', NULL, 'オークの魔核を用いた装飾品。', 2000, 1, '{"attack": 12, "defense": 10, "elementalAttack": "EARTH", "elementalAttackValue": 5, "elementalResistance": "FIRE", "elementalResistanceValue": 5}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'オークの武器' LIMIT 1), '{"オークの皮": 5, "オークの骨": 3, "オークの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'オークの防具' LIMIT 1), '{"オークの皮": 8, "オークの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'オークの装飾' LIMIT 1), '{"オークの骨": 3, "オークの鋭牙": 2, "オークの魔核": 1}'::jsonb);

-- 大蛇 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '大蛇の皮', 'MATERIAL', '大蛇から剥ぎ取った一般的な皮。', 50, 1),
  (gen_random_uuid(), '大蛇の骨', 'MATERIAL', '大蛇から剥ぎ取った一般的な骨。', 50, 1),
  (gen_random_uuid(), '大蛇の鋭牙', 'MATERIAL', '大蛇の稀少な部位。', 500, 1),
  (gen_random_uuid(), '大蛇の魔核', 'MATERIAL', '大蛇の体内にある幻の魔核。', 5000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '大蛇の武器', 'WEAPON', 'WEAPON_SWORD', '大蛇の素材で作られた強力な武器。', 1250, 5, '{"attack": 37, "elementalAttack": "WATER", "elementalAttackValue": 12}'::jsonb),
  (gen_random_uuid(), '大蛇の防具', 'ARMOR', NULL, '大蛇の素材で作られた堅牢な防具。', 1250, 8, '{"defense": 30, "elementalResistance": "DARK", "elementalResistanceValue": 12}'::jsonb),
  (gen_random_uuid(), '大蛇の装飾', 'ACCESSORY', NULL, '大蛇の魔核を用いた装飾品。', 2000, 1, '{"attack": 12, "defense": 10, "elementalAttack": "WATER", "elementalAttackValue": 5, "elementalResistance": "DARK", "elementalResistanceValue": 5}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '大蛇の武器' LIMIT 1), '{"大蛇の皮": 5, "大蛇の骨": 3, "大蛇の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '大蛇の防具' LIMIT 1), '{"大蛇の皮": 8, "大蛇の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '大蛇の装飾' LIMIT 1), '{"大蛇の骨": 3, "大蛇の鋭牙": 2, "大蛇の魔核": 1}'::jsonb);

-- 魔犬 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '魔犬の皮', 'MATERIAL', '魔犬から剥ぎ取った一般的な皮。', 56, 1),
  (gen_random_uuid(), '魔犬の骨', 'MATERIAL', '魔犬から剥ぎ取った一般的な骨。', 56, 1),
  (gen_random_uuid(), '魔犬の鋭牙', 'MATERIAL', '魔犬の稀少な部位。', 560, 1),
  (gen_random_uuid(), '魔犬の魔核', 'MATERIAL', '魔犬の体内にある幻の魔核。', 5600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '魔犬の武器', 'WEAPON', 'WEAPON_SWORD', '魔犬の素材で作られた強力な武器。', 1400, 5, '{"attack": 42, "elementalAttack": "FIRE", "elementalAttackValue": 14}'::jsonb),
  (gen_random_uuid(), '魔犬の防具', 'ARMOR', NULL, '魔犬の素材で作られた堅牢な防具。', 1400, 8, '{"defense": 33, "elementalResistance": "DARK", "elementalResistanceValue": 14}'::jsonb),
  (gen_random_uuid(), '魔犬の装飾', 'ACCESSORY', NULL, '魔犬の魔核を用いた装飾品。', 2240, 1, '{"attack": 14, "defense": 11, "elementalAttack": "FIRE", "elementalAttackValue": 5, "elementalResistance": "DARK", "elementalResistanceValue": 5}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '魔犬の武器' LIMIT 1), '{"魔犬の皮": 5, "魔犬の骨": 3, "魔犬の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '魔犬の防具' LIMIT 1), '{"魔犬の皮": 8, "魔犬の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '魔犬の装飾' LIMIT 1), '{"魔犬の骨": 3, "魔犬の鋭牙": 2, "魔犬の魔核": 1}'::jsonb);

-- アンデッド のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'アンデッドの皮', 'MATERIAL', 'アンデッドから剥ぎ取った一般的な皮。', 60, 1),
  (gen_random_uuid(), 'アンデッドの骨', 'MATERIAL', 'アンデッドから剥ぎ取った一般的な骨。', 60, 1),
  (gen_random_uuid(), 'アンデッドの鋭牙', 'MATERIAL', 'アンデッドの稀少な部位。', 600, 1),
  (gen_random_uuid(), 'アンデッドの魔核', 'MATERIAL', 'アンデッドの体内にある幻の魔核。', 6000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'アンデッドの武器', 'WEAPON', 'WEAPON_SWORD', 'アンデッドの素材で作られた強力な武器。', 1500, 5, '{"attack": 45, "elementalAttack": "DARK", "elementalAttackValue": 15}'::jsonb),
  (gen_random_uuid(), 'アンデッドの防具', 'ARMOR', NULL, 'アンデッドの素材で作られた堅牢な防具。', 1500, 8, '{"defense": 36, "elementalResistance": "ICE", "elementalResistanceValue": 15}'::jsonb),
  (gen_random_uuid(), 'アンデッドの装飾', 'ACCESSORY', NULL, 'アンデッドの魔核を用いた装飾品。', 2400, 1, '{"attack": 15, "defense": 12, "elementalAttack": "DARK", "elementalAttackValue": 6, "elementalResistance": "ICE", "elementalResistanceValue": 6}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'アンデッドの武器' LIMIT 1), '{"アンデッドの皮": 5, "アンデッドの骨": 3, "アンデッドの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'アンデッドの防具' LIMIT 1), '{"アンデッドの皮": 8, "アンデッドの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'アンデッドの装飾' LIMIT 1), '{"アンデッドの骨": 3, "アンデッドの鋭牙": 2, "アンデッドの魔核": 1}'::jsonb);

-- オーク戦士 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'オーク戦士の皮', 'MATERIAL', 'オーク戦士から剥ぎ取った一般的な皮。', 60, 1),
  (gen_random_uuid(), 'オーク戦士の骨', 'MATERIAL', 'オーク戦士から剥ぎ取った一般的な骨。', 60, 1),
  (gen_random_uuid(), 'オーク戦士の鋭牙', 'MATERIAL', 'オーク戦士の稀少な部位。', 600, 1),
  (gen_random_uuid(), 'オーク戦士の魔核', 'MATERIAL', 'オーク戦士の体内にある幻の魔核。', 6000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'オーク戦士の武器', 'WEAPON', 'WEAPON_SWORD', 'オーク戦士の素材で作られた強力な武器。', 1500, 5, '{"attack": 45, "elementalAttack": "EARTH", "elementalAttackValue": 15}'::jsonb),
  (gen_random_uuid(), 'オーク戦士の防具', 'ARMOR', NULL, 'オーク戦士の素材で作られた堅牢な防具。', 1500, 8, '{"defense": 36, "elementalResistance": "FIRE", "elementalResistanceValue": 15}'::jsonb),
  (gen_random_uuid(), 'オーク戦士の装飾', 'ACCESSORY', NULL, 'オーク戦士の魔核を用いた装飾品。', 2400, 1, '{"attack": 15, "defense": 12, "elementalAttack": "EARTH", "elementalAttackValue": 6, "elementalResistance": "FIRE", "elementalResistanceValue": 6}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'オーク戦士の武器' LIMIT 1), '{"オーク戦士の皮": 5, "オーク戦士の骨": 3, "オーク戦士の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'オーク戦士の防具' LIMIT 1), '{"オーク戦士の皮": 8, "オーク戦士の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'オーク戦士の装飾' LIMIT 1), '{"オーク戦士の骨": 3, "オーク戦士の鋭牙": 2, "オーク戦士の魔核": 1}'::jsonb);

-- ダークエルフ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ダークエルフの皮', 'MATERIAL', 'ダークエルフから剥ぎ取った一般的な皮。', 70, 1),
  (gen_random_uuid(), 'ダークエルフの骨', 'MATERIAL', 'ダークエルフから剥ぎ取った一般的な骨。', 70, 1),
  (gen_random_uuid(), 'ダークエルフの鋭牙', 'MATERIAL', 'ダークエルフの稀少な部位。', 700, 1),
  (gen_random_uuid(), 'ダークエルフの魔核', 'MATERIAL', 'ダークエルフの体内にある幻の魔核。', 7000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ダークエルフの武器', 'WEAPON', 'WEAPON_SWORD', 'ダークエルフの素材で作られた強力な武器。', 1750, 5, '{"attack": 52, "elementalAttack": "DARK", "elementalAttackValue": 17}'::jsonb),
  (gen_random_uuid(), 'ダークエルフの防具', 'ARMOR', NULL, 'ダークエルフの素材で作られた堅牢な防具。', 1750, 8, '{"defense": 42, "elementalResistance": "WIND", "elementalResistanceValue": 17}'::jsonb),
  (gen_random_uuid(), 'ダークエルフの装飾', 'ACCESSORY', NULL, 'ダークエルフの魔核を用いた装飾品。', 2800, 1, '{"attack": 17, "defense": 14, "elementalAttack": "DARK", "elementalAttackValue": 7, "elementalResistance": "WIND", "elementalResistanceValue": 7}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ダークエルフの武器' LIMIT 1), '{"ダークエルフの皮": 5, "ダークエルフの骨": 3, "ダークエルフの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ダークエルフの防具' LIMIT 1), '{"ダークエルフの皮": 8, "ダークエルフの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ダークエルフの装飾' LIMIT 1), '{"ダークエルフの骨": 3, "ダークエルフの鋭牙": 2, "ダークエルフの魔核": 1}'::jsonb);

-- トロル のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'トロルの皮', 'MATERIAL', 'トロルから剥ぎ取った一般的な皮。', 80, 1),
  (gen_random_uuid(), 'トロルの骨', 'MATERIAL', 'トロルから剥ぎ取った一般的な骨。', 80, 1),
  (gen_random_uuid(), 'トロルの鋭牙', 'MATERIAL', 'トロルの稀少な部位。', 800, 1),
  (gen_random_uuid(), 'トロルの魔核', 'MATERIAL', 'トロルの体内にある幻の魔核。', 8000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'トロルの武器', 'WEAPON', 'WEAPON_SWORD', 'トロルの素材で作られた強力な武器。', 2000, 5, '{"attack": 60, "elementalAttack": "EARTH", "elementalAttackValue": 20}'::jsonb),
  (gen_random_uuid(), 'トロルの防具', 'ARMOR', NULL, 'トロルの素材で作られた堅牢な防具。', 2000, 8, '{"defense": 48, "elementalResistance": "WATER", "elementalResistanceValue": 20}'::jsonb),
  (gen_random_uuid(), 'トロルの装飾', 'ACCESSORY', NULL, 'トロルの魔核を用いた装飾品。', 3200, 1, '{"attack": 20, "defense": 16, "elementalAttack": "EARTH", "elementalAttackValue": 8, "elementalResistance": "WATER", "elementalResistanceValue": 8}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'トロルの武器' LIMIT 1), '{"トロルの皮": 5, "トロルの骨": 3, "トロルの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'トロルの防具' LIMIT 1), '{"トロルの皮": 8, "トロルの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'トロルの装飾' LIMIT 1), '{"トロルの骨": 3, "トロルの鋭牙": 2, "トロルの魔核": 1}'::jsonb);

-- ゾンビナイト のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゾンビナイトの皮', 'MATERIAL', 'ゾンビナイトから剥ぎ取った一般的な皮。', 80, 1),
  (gen_random_uuid(), 'ゾンビナイトの骨', 'MATERIAL', 'ゾンビナイトから剥ぎ取った一般的な骨。', 80, 1),
  (gen_random_uuid(), 'ゾンビナイトの鋭牙', 'MATERIAL', 'ゾンビナイトの稀少な部位。', 800, 1),
  (gen_random_uuid(), 'ゾンビナイトの魔核', 'MATERIAL', 'ゾンビナイトの体内にある幻の魔核。', 8000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ゾンビナイトの武器', 'WEAPON', 'WEAPON_SWORD', 'ゾンビナイトの素材で作られた強力な武器。', 2000, 5, '{"attack": 60, "elementalAttack": "DARK", "elementalAttackValue": 20}'::jsonb),
  (gen_random_uuid(), 'ゾンビナイトの防具', 'ARMOR', NULL, 'ゾンビナイトの素材で作られた堅牢な防具。', 2000, 8, '{"defense": 48, "elementalResistance": "ICE", "elementalResistanceValue": 20}'::jsonb),
  (gen_random_uuid(), 'ゾンビナイトの装飾', 'ACCESSORY', NULL, 'ゾンビナイトの魔核を用いた装飾品。', 3200, 1, '{"attack": 20, "defense": 16, "elementalAttack": "DARK", "elementalAttackValue": 8, "elementalResistance": "ICE", "elementalResistanceValue": 8}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ゾンビナイトの武器' LIMIT 1), '{"ゾンビナイトの皮": 5, "ゾンビナイトの骨": 3, "ゾンビナイトの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゾンビナイトの防具' LIMIT 1), '{"ゾンビナイトの皮": 8, "ゾンビナイトの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゾンビナイトの装飾' LIMIT 1), '{"ゾンビナイトの骨": 3, "ゾンビナイトの鋭牙": 2, "ゾンビナイトの魔核": 1}'::jsonb);

-- ガーゴイル のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ガーゴイルの皮', 'MATERIAL', 'ガーゴイルから剥ぎ取った一般的な皮。', 84, 1),
  (gen_random_uuid(), 'ガーゴイルの骨', 'MATERIAL', 'ガーゴイルから剥ぎ取った一般的な骨。', 84, 1),
  (gen_random_uuid(), 'ガーゴイルの鋭牙', 'MATERIAL', 'ガーゴイルの稀少な部位。', 840, 1),
  (gen_random_uuid(), 'ガーゴイルの魔核', 'MATERIAL', 'ガーゴイルの体内にある幻の魔核。', 8400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ガーゴイルの武器', 'WEAPON', 'WEAPON_SWORD', 'ガーゴイルの素材で作られた強力な武器。', 2100, 5, '{"attack": 63, "elementalAttack": "EARTH", "elementalAttackValue": 21}'::jsonb),
  (gen_random_uuid(), 'ガーゴイルの防具', 'ARMOR', NULL, 'ガーゴイルの素材で作られた堅牢な防具。', 2100, 8, '{"defense": 50, "elementalResistance": "WIND", "elementalResistanceValue": 21}'::jsonb),
  (gen_random_uuid(), 'ガーゴイルの装飾', 'ACCESSORY', NULL, 'ガーゴイルの魔核を用いた装飾品。', 3360, 1, '{"attack": 21, "defense": 16, "elementalAttack": "EARTH", "elementalAttackValue": 8, "elementalResistance": "WIND", "elementalResistanceValue": 8}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ガーゴイルの武器' LIMIT 1), '{"ガーゴイルの皮": 5, "ガーゴイルの骨": 3, "ガーゴイルの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ガーゴイルの防具' LIMIT 1), '{"ガーゴイルの皮": 8, "ガーゴイルの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ガーゴイルの装飾' LIMIT 1), '{"ガーゴイルの骨": 3, "ガーゴイルの鋭牙": 2, "ガーゴイルの魔核": 1}'::jsonb);

-- グリフィン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'グリフィンの皮', 'MATERIAL', 'グリフィンから剥ぎ取った一般的な皮。', 90, 1),
  (gen_random_uuid(), 'グリフィンの骨', 'MATERIAL', 'グリフィンから剥ぎ取った一般的な骨。', 90, 1),
  (gen_random_uuid(), 'グリフィンの鋭牙', 'MATERIAL', 'グリフィンの稀少な部位。', 900, 1),
  (gen_random_uuid(), 'グリフィンの魔核', 'MATERIAL', 'グリフィンの体内にある幻の魔核。', 9000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'グリフィンの武器', 'WEAPON', 'WEAPON_SWORD', 'グリフィンの素材で作られた強力な武器。', 2250, 5, '{"attack": 67, "elementalAttack": "WIND", "elementalAttackValue": 22}'::jsonb),
  (gen_random_uuid(), 'グリフィンの防具', 'ARMOR', NULL, 'グリフィンの素材で作られた堅牢な防具。', 2250, 8, '{"defense": 54, "elementalResistance": "THUNDER", "elementalResistanceValue": 22}'::jsonb),
  (gen_random_uuid(), 'グリフィンの装飾', 'ACCESSORY', NULL, 'グリフィンの魔核を用いた装飾品。', 3600, 1, '{"attack": 22, "defense": 18, "elementalAttack": "WIND", "elementalAttackValue": 9, "elementalResistance": "THUNDER", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'グリフィンの武器' LIMIT 1), '{"グリフィンの皮": 5, "グリフィンの骨": 3, "グリフィンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'グリフィンの防具' LIMIT 1), '{"グリフィンの皮": 8, "グリフィンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'グリフィンの装飾' LIMIT 1), '{"グリフィンの骨": 3, "グリフィンの鋭牙": 2, "グリフィンの魔核": 1}'::jsonb);

-- オーガ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'オーガの皮', 'MATERIAL', 'オーガから剥ぎ取った一般的な皮。', 90, 1),
  (gen_random_uuid(), 'オーガの骨', 'MATERIAL', 'オーガから剥ぎ取った一般的な骨。', 90, 1),
  (gen_random_uuid(), 'オーガの鋭牙', 'MATERIAL', 'オーガの稀少な部位。', 900, 1),
  (gen_random_uuid(), 'オーガの魔核', 'MATERIAL', 'オーガの体内にある幻の魔核。', 9000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'オーガの武器', 'WEAPON', 'WEAPON_SWORD', 'オーガの素材で作られた強力な武器。', 2250, 5, '{"attack": 67, "elementalAttack": "EARTH", "elementalAttackValue": 22}'::jsonb),
  (gen_random_uuid(), 'オーガの防具', 'ARMOR', NULL, 'オーガの素材で作られた堅牢な防具。', 2250, 8, '{"defense": 54, "elementalResistance": "FIRE", "elementalResistanceValue": 22}'::jsonb),
  (gen_random_uuid(), 'オーガの装飾', 'ACCESSORY', NULL, 'オーガの魔核を用いた装飾品。', 3600, 1, '{"attack": 22, "defense": 18, "elementalAttack": "EARTH", "elementalAttackValue": 9, "elementalResistance": "FIRE", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'オーガの武器' LIMIT 1), '{"オーガの皮": 5, "オーガの骨": 3, "オーガの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'オーガの防具' LIMIT 1), '{"オーガの皮": 8, "オーガの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'オーガの装飾' LIMIT 1), '{"オーガの骨": 3, "オーガの鋭牙": 2, "オーガの魔核": 1}'::jsonb);

-- 闇魔法使い のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '闇魔法使いの皮', 'MATERIAL', '闇魔法使いから剥ぎ取った一般的な皮。', 90, 1),
  (gen_random_uuid(), '闇魔法使いの骨', 'MATERIAL', '闇魔法使いから剥ぎ取った一般的な骨。', 90, 1),
  (gen_random_uuid(), '闇魔法使いの鋭牙', 'MATERIAL', '闇魔法使いの稀少な部位。', 900, 1),
  (gen_random_uuid(), '闇魔法使いの魔核', 'MATERIAL', '闇魔法使いの体内にある幻の魔核。', 9000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '闇魔法使いの武器', 'WEAPON', 'WEAPON_SWORD', '闇魔法使いの素材で作られた強力な武器。', 2250, 5, '{"attack": 67, "elementalAttack": "DARK", "elementalAttackValue": 22}'::jsonb),
  (gen_random_uuid(), '闇魔法使いの防具', 'ARMOR', NULL, '闇魔法使いの素材で作られた堅牢な防具。', 2250, 8, '{"defense": 54, "elementalResistance": "FIRE", "elementalResistanceValue": 22}'::jsonb),
  (gen_random_uuid(), '闇魔法使いの装飾', 'ACCESSORY', NULL, '闇魔法使いの魔核を用いた装飾品。', 3600, 1, '{"attack": 22, "defense": 18, "elementalAttack": "DARK", "elementalAttackValue": 9, "elementalResistance": "FIRE", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '闇魔法使いの武器' LIMIT 1), '{"闇魔法使いの皮": 5, "闇魔法使いの骨": 3, "闇魔法使いの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '闇魔法使いの防具' LIMIT 1), '{"闇魔法使いの皮": 8, "闇魔法使いの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '闇魔法使いの装飾' LIMIT 1), '{"闇魔法使いの骨": 3, "闇魔法使いの鋭牙": 2, "闇魔法使いの魔核": 1}'::jsonb);

-- バジリスク のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'バジリスクの皮', 'MATERIAL', 'バジリスクから剥ぎ取った一般的な皮。', 96, 1),
  (gen_random_uuid(), 'バジリスクの骨', 'MATERIAL', 'バジリスクから剥ぎ取った一般的な骨。', 96, 1),
  (gen_random_uuid(), 'バジリスクの鋭牙', 'MATERIAL', 'バジリスクの稀少な部位。', 960, 1),
  (gen_random_uuid(), 'バジリスクの魔核', 'MATERIAL', 'バジリスクの体内にある幻の魔核。', 9600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'バジリスクの武器', 'WEAPON', 'WEAPON_SWORD', 'バジリスクの素材で作られた強力な武器。', 2400, 5, '{"attack": 72, "elementalAttack": "EARTH", "elementalAttackValue": 24}'::jsonb),
  (gen_random_uuid(), 'バジリスクの防具', 'ARMOR', NULL, 'バジリスクの素材で作られた堅牢な防具。', 2400, 8, '{"defense": 57, "elementalResistance": "POISON", "elementalResistanceValue": 24}'::jsonb),
  (gen_random_uuid(), 'バジリスクの装飾', 'ACCESSORY', NULL, 'バジリスクの魔核を用いた装飾品。', 3840, 1, '{"attack": 24, "defense": 19, "elementalAttack": "EARTH", "elementalAttackValue": 9, "elementalResistance": "POISON", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'バジリスクの武器' LIMIT 1), '{"バジリスクの皮": 5, "バジリスクの骨": 3, "バジリスクの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'バジリスクの防具' LIMIT 1), '{"バジリスクの皮": 8, "バジリスクの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'バジリスクの装飾' LIMIT 1), '{"バジリスクの骨": 3, "バジリスクの鋭牙": 2, "バジリスクの魔核": 1}'::jsonb);

-- ウェアウルフ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ウェアウルフの皮', 'MATERIAL', 'ウェアウルフから剥ぎ取った一般的な皮。', 96, 1),
  (gen_random_uuid(), 'ウェアウルフの骨', 'MATERIAL', 'ウェアウルフから剥ぎ取った一般的な骨。', 96, 1),
  (gen_random_uuid(), 'ウェアウルフの鋭牙', 'MATERIAL', 'ウェアウルフの稀少な部位。', 960, 1),
  (gen_random_uuid(), 'ウェアウルフの魔核', 'MATERIAL', 'ウェアウルフの体内にある幻の魔核。', 9600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ウェアウルフの武器', 'WEAPON', 'WEAPON_SWORD', 'ウェアウルフの素材で作られた強力な武器。', 2400, 5, '{"attack": 72, "elementalAttack": "WIND", "elementalAttackValue": 24}'::jsonb),
  (gen_random_uuid(), 'ウェアウルフの防具', 'ARMOR', NULL, 'ウェアウルフの素材で作られた堅牢な防具。', 2400, 8, '{"defense": 57, "elementalResistance": "DARK", "elementalResistanceValue": 24}'::jsonb),
  (gen_random_uuid(), 'ウェアウルフの装飾', 'ACCESSORY', NULL, 'ウェアウルフの魔核を用いた装飾品。', 3840, 1, '{"attack": 24, "defense": 19, "elementalAttack": "WIND", "elementalAttackValue": 9, "elementalResistance": "DARK", "elementalResistanceValue": 9}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ウェアウルフの武器' LIMIT 1), '{"ウェアウルフの皮": 5, "ウェアウルフの骨": 3, "ウェアウルフの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ウェアウルフの防具' LIMIT 1), '{"ウェアウルフの皮": 8, "ウェアウルフの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ウェアウルフの装飾' LIMIT 1), '{"ウェアウルフの骨": 3, "ウェアウルフの鋭牙": 2, "ウェアウルフの魔核": 1}'::jsonb);

-- サイクロプス のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'サイクロプスの皮', 'MATERIAL', 'サイクロプスから剥ぎ取った一般的な皮。', 100, 1),
  (gen_random_uuid(), 'サイクロプスの骨', 'MATERIAL', 'サイクロプスから剥ぎ取った一般的な骨。', 100, 1),
  (gen_random_uuid(), 'サイクロプスの鋭牙', 'MATERIAL', 'サイクロプスの稀少な部位。', 1000, 1),
  (gen_random_uuid(), 'サイクロプスの魔核', 'MATERIAL', 'サイクロプスの体内にある幻の魔核。', 10000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'サイクロプスの武器', 'WEAPON', 'WEAPON_SWORD', 'サイクロプスの素材で作られた強力な武器。', 2500, 5, '{"attack": 75, "elementalAttack": "EARTH", "elementalAttackValue": 25}'::jsonb),
  (gen_random_uuid(), 'サイクロプスの防具', 'ARMOR', NULL, 'サイクロプスの素材で作られた堅牢な防具。', 2500, 8, '{"defense": 60, "elementalResistance": "THUNDER", "elementalResistanceValue": 25}'::jsonb),
  (gen_random_uuid(), 'サイクロプスの装飾', 'ACCESSORY', NULL, 'サイクロプスの魔核を用いた装飾品。', 4000, 1, '{"attack": 25, "defense": 20, "elementalAttack": "EARTH", "elementalAttackValue": 10, "elementalResistance": "THUNDER", "elementalResistanceValue": 10}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'サイクロプスの武器' LIMIT 1), '{"サイクロプスの皮": 5, "サイクロプスの骨": 3, "サイクロプスの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'サイクロプスの防具' LIMIT 1), '{"サイクロプスの皮": 8, "サイクロプスの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'サイクロプスの装飾' LIMIT 1), '{"サイクロプスの骨": 3, "サイクロプスの鋭牙": 2, "サイクロプスの魔核": 1}'::jsonb);

-- ヴァンパイア のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ヴァンパイアの皮', 'MATERIAL', 'ヴァンパイアから剥ぎ取った一般的な皮。', 100, 1),
  (gen_random_uuid(), 'ヴァンパイアの骨', 'MATERIAL', 'ヴァンパイアから剥ぎ取った一般的な骨。', 100, 1),
  (gen_random_uuid(), 'ヴァンパイアの鋭牙', 'MATERIAL', 'ヴァンパイアの稀少な部位。', 1000, 1),
  (gen_random_uuid(), 'ヴァンパイアの魔核', 'MATERIAL', 'ヴァンパイアの体内にある幻の魔核。', 10000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ヴァンパイアの武器', 'WEAPON', 'WEAPON_SWORD', 'ヴァンパイアの素材で作られた強力な武器。', 2500, 5, '{"attack": 75, "elementalAttack": "DARK", "elementalAttackValue": 25}'::jsonb),
  (gen_random_uuid(), 'ヴァンパイアの防具', 'ARMOR', NULL, 'ヴァンパイアの素材で作られた堅牢な防具。', 2500, 8, '{"defense": 60, "elementalResistance": "ICE", "elementalResistanceValue": 25}'::jsonb),
  (gen_random_uuid(), 'ヴァンパイアの装飾', 'ACCESSORY', NULL, 'ヴァンパイアの魔核を用いた装飾品。', 4000, 1, '{"attack": 25, "defense": 20, "elementalAttack": "DARK", "elementalAttackValue": 10, "elementalResistance": "ICE", "elementalResistanceValue": 10}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ヴァンパイアの武器' LIMIT 1), '{"ヴァンパイアの皮": 5, "ヴァンパイアの骨": 3, "ヴァンパイアの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ヴァンパイアの防具' LIMIT 1), '{"ヴァンパイアの皮": 8, "ヴァンパイアの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ヴァンパイアの装飾' LIMIT 1), '{"ヴァンパイアの骨": 3, "ヴァンパイアの鋭牙": 2, "ヴァンパイアの魔核": 1}'::jsonb);

-- ドッペルゲンガー のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ドッペルゲンガーの皮', 'MATERIAL', 'ドッペルゲンガーから剥ぎ取った一般的な皮。', 104, 1),
  (gen_random_uuid(), 'ドッペルゲンガーの骨', 'MATERIAL', 'ドッペルゲンガーから剥ぎ取った一般的な骨。', 104, 1),
  (gen_random_uuid(), 'ドッペルゲンガーの鋭牙', 'MATERIAL', 'ドッペルゲンガーの稀少な部位。', 1040, 1),
  (gen_random_uuid(), 'ドッペルゲンガーの魔核', 'MATERIAL', 'ドッペルゲンガーの体内にある幻の魔核。', 10400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ドッペルゲンガーの武器', 'WEAPON', 'WEAPON_SWORD', 'ドッペルゲンガーの素材で作られた強力な武器。', 2600, 5, '{"attack": 78, "elementalAttack": "DARK", "elementalAttackValue": 26}'::jsonb),
  (gen_random_uuid(), 'ドッペルゲンガーの防具', 'ARMOR', NULL, 'ドッペルゲンガーの素材で作られた堅牢な防具。', 2600, 8, '{"defense": 62, "elementalResistance": "LIGHT", "elementalResistanceValue": 26}'::jsonb),
  (gen_random_uuid(), 'ドッペルゲンガーの装飾', 'ACCESSORY', NULL, 'ドッペルゲンガーの魔核を用いた装飾品。', 4160, 1, '{"attack": 26, "defense": 20, "elementalAttack": "DARK", "elementalAttackValue": 10, "elementalResistance": "LIGHT", "elementalResistanceValue": 10}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ドッペルゲンガーの武器' LIMIT 1), '{"ドッペルゲンガーの皮": 5, "ドッペルゲンガーの骨": 3, "ドッペルゲンガーの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ドッペルゲンガーの防具' LIMIT 1), '{"ドッペルゲンガーの皮": 8, "ドッペルゲンガーの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ドッペルゲンガーの装飾' LIMIT 1), '{"ドッペルゲンガーの骨": 3, "ドッペルゲンガーの鋭牙": 2, "ドッペルゲンガーの魔核": 1}'::jsonb);

-- 暗黒騎士 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '暗黒騎士の皮', 'MATERIAL', '暗黒騎士から剥ぎ取った一般的な皮。', 120, 1),
  (gen_random_uuid(), '暗黒騎士の骨', 'MATERIAL', '暗黒騎士から剥ぎ取った一般的な骨。', 120, 1),
  (gen_random_uuid(), '暗黒騎士の鋭牙', 'MATERIAL', '暗黒騎士の稀少な部位。', 1200, 1),
  (gen_random_uuid(), '暗黒騎士の魔核', 'MATERIAL', '暗黒騎士の体内にある幻の魔核。', 12000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '暗黒騎士の武器', 'WEAPON', 'WEAPON_SWORD', '暗黒騎士の素材で作られた強力な武器。', 3000, 5, '{"attack": 90, "elementalAttack": "DARK", "elementalAttackValue": 30}'::jsonb),
  (gen_random_uuid(), '暗黒騎士の防具', 'ARMOR', NULL, '暗黒騎士の素材で作られた堅牢な防具。', 3000, 8, '{"defense": 72, "elementalResistance": "FIRE", "elementalResistanceValue": 30}'::jsonb),
  (gen_random_uuid(), '暗黒騎士の装飾', 'ACCESSORY', NULL, '暗黒騎士の魔核を用いた装飾品。', 4800, 1, '{"attack": 30, "defense": 24, "elementalAttack": "DARK", "elementalAttackValue": 12, "elementalResistance": "FIRE", "elementalResistanceValue": 12}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '暗黒騎士の武器' LIMIT 1), '{"暗黒騎士の皮": 5, "暗黒騎士の骨": 3, "暗黒騎士の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '暗黒騎士の防具' LIMIT 1), '{"暗黒騎士の皮": 8, "暗黒騎士の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '暗黒騎士の装飾' LIMIT 1), '{"暗黒騎士の骨": 3, "暗黒騎士の鋭牙": 2, "暗黒騎士の魔核": 1}'::jsonb);

-- フェニックス のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'フェニックスの皮', 'MATERIAL', 'フェニックスから剥ぎ取った一般的な皮。', 140, 1),
  (gen_random_uuid(), 'フェニックスの骨', 'MATERIAL', 'フェニックスから剥ぎ取った一般的な骨。', 140, 1),
  (gen_random_uuid(), 'フェニックスの鋭牙', 'MATERIAL', 'フェニックスの稀少な部位。', 1400, 1),
  (gen_random_uuid(), 'フェニックスの魔核', 'MATERIAL', 'フェニックスの体内にある幻の魔核。', 14000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'フェニックスの武器', 'WEAPON', 'WEAPON_SWORD', 'フェニックスの素材で作られた強力な武器。', 3500, 5, '{"attack": 105, "elementalAttack": "FIRE", "elementalAttackValue": 35}'::jsonb),
  (gen_random_uuid(), 'フェニックスの防具', 'ARMOR', NULL, 'フェニックスの素材で作られた堅牢な防具。', 3500, 8, '{"defense": 84, "elementalResistance": "LIGHT", "elementalResistanceValue": 35}'::jsonb),
  (gen_random_uuid(), 'フェニックスの装飾', 'ACCESSORY', NULL, 'フェニックスの魔核を用いた装飾品。', 5600, 1, '{"attack": 35, "defense": 28, "elementalAttack": "FIRE", "elementalAttackValue": 14, "elementalResistance": "LIGHT", "elementalResistanceValue": 14}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'フェニックスの武器' LIMIT 1), '{"フェニックスの皮": 5, "フェニックスの骨": 3, "フェニックスの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'フェニックスの防具' LIMIT 1), '{"フェニックスの皮": 8, "フェニックスの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'フェニックスの装飾' LIMIT 1), '{"フェニックスの骨": 3, "フェニックスの鋭牙": 2, "フェニックスの魔核": 1}'::jsonb);

-- リッチ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'リッチの皮', 'MATERIAL', 'リッチから剥ぎ取った一般的な皮。', 160, 1),
  (gen_random_uuid(), 'リッチの骨', 'MATERIAL', 'リッチから剥ぎ取った一般的な骨。', 160, 1),
  (gen_random_uuid(), 'リッチの鋭牙', 'MATERIAL', 'リッチの稀少な部位。', 1600, 1),
  (gen_random_uuid(), 'リッチの魔核', 'MATERIAL', 'リッチの体内にある幻の魔核。', 16000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'リッチの武器', 'WEAPON', 'WEAPON_SWORD', 'リッチの素材で作られた強力な武器。', 4000, 5, '{"attack": 120, "elementalAttack": "DARK", "elementalAttackValue": 40}'::jsonb),
  (gen_random_uuid(), 'リッチの防具', 'ARMOR', NULL, 'リッチの素材で作られた堅牢な防具。', 4000, 8, '{"defense": 96, "elementalResistance": "ICE", "elementalResistanceValue": 40}'::jsonb),
  (gen_random_uuid(), 'リッチの装飾', 'ACCESSORY', NULL, 'リッチの魔核を用いた装飾品。', 6400, 1, '{"attack": 40, "defense": 32, "elementalAttack": "DARK", "elementalAttackValue": 16, "elementalResistance": "ICE", "elementalResistanceValue": 16}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'リッチの武器' LIMIT 1), '{"リッチの皮": 5, "リッチの骨": 3, "リッチの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'リッチの防具' LIMIT 1), '{"リッチの皮": 8, "リッチの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'リッチの装飾' LIMIT 1), '{"リッチの骨": 3, "リッチの鋭牙": 2, "リッチの魔核": 1}'::jsonb);

-- ヒュドラ のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ヒュドラの皮', 'MATERIAL', 'ヒュドラから剥ぎ取った一般的な皮。', 150, 1),
  (gen_random_uuid(), 'ヒュドラの骨', 'MATERIAL', 'ヒュドラから剥ぎ取った一般的な骨。', 150, 1),
  (gen_random_uuid(), 'ヒュドラの鋭牙', 'MATERIAL', 'ヒュドラの稀少な部位。', 1500, 1),
  (gen_random_uuid(), 'ヒュドラの魔核', 'MATERIAL', 'ヒュドラの体内にある幻の魔核。', 15000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ヒュドラの武器', 'WEAPON', 'WEAPON_SWORD', 'ヒュドラの素材で作られた強力な武器。', 3750, 5, '{"attack": 112, "elementalAttack": "WATER", "elementalAttackValue": 37}'::jsonb),
  (gen_random_uuid(), 'ヒュドラの防具', 'ARMOR', NULL, 'ヒュドラの素材で作られた堅牢な防具。', 3750, 8, '{"defense": 90, "elementalResistance": "DARK", "elementalResistanceValue": 37}'::jsonb),
  (gen_random_uuid(), 'ヒュドラの装飾', 'ACCESSORY', NULL, 'ヒュドラの魔核を用いた装飾品。', 6000, 1, '{"attack": 37, "defense": 30, "elementalAttack": "WATER", "elementalAttackValue": 15, "elementalResistance": "DARK", "elementalResistanceValue": 15}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ヒュドラの武器' LIMIT 1), '{"ヒュドラの皮": 5, "ヒュドラの骨": 3, "ヒュドラの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ヒュドラの防具' LIMIT 1), '{"ヒュドラの皮": 8, "ヒュドラの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ヒュドラの装飾' LIMIT 1), '{"ヒュドラの骨": 3, "ヒュドラの鋭牙": 2, "ヒュドラの魔核": 1}'::jsonb);

-- ミノタウロス のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ミノタウロスの皮', 'MATERIAL', 'ミノタウロスから剥ぎ取った一般的な皮。', 140, 1),
  (gen_random_uuid(), 'ミノタウロスの骨', 'MATERIAL', 'ミノタウロスから剥ぎ取った一般的な骨。', 140, 1),
  (gen_random_uuid(), 'ミノタウロスの鋭牙', 'MATERIAL', 'ミノタウロスの稀少な部位。', 1400, 1),
  (gen_random_uuid(), 'ミノタウロスの魔核', 'MATERIAL', 'ミノタウロスの体内にある幻の魔核。', 14000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ミノタウロスの武器', 'WEAPON', 'WEAPON_SWORD', 'ミノタウロスの素材で作られた強力な武器。', 3500, 5, '{"attack": 105, "elementalAttack": "EARTH", "elementalAttackValue": 35}'::jsonb),
  (gen_random_uuid(), 'ミノタウロスの防具', 'ARMOR', NULL, 'ミノタウロスの素材で作られた堅牢な防具。', 3500, 8, '{"defense": 84, "elementalResistance": "FIRE", "elementalResistanceValue": 35}'::jsonb),
  (gen_random_uuid(), 'ミノタウロスの装飾', 'ACCESSORY', NULL, 'ミノタウロスの魔核を用いた装飾品。', 5600, 1, '{"attack": 35, "defense": 28, "elementalAttack": "EARTH", "elementalAttackValue": 14, "elementalResistance": "FIRE", "elementalResistanceValue": 14}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ミノタウロスの武器' LIMIT 1), '{"ミノタウロスの皮": 5, "ミノタウロスの骨": 3, "ミノタウロスの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ミノタウロスの防具' LIMIT 1), '{"ミノタウロスの皮": 8, "ミノタウロスの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ミノタウロスの装飾' LIMIT 1), '{"ミノタウロスの骨": 3, "ミノタウロスの鋭牙": 2, "ミノタウロスの魔核": 1}'::jsonb);

-- ドラゴン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ドラゴンの皮', 'MATERIAL', 'ドラゴンから剥ぎ取った一般的な皮。', 200, 1),
  (gen_random_uuid(), 'ドラゴンの骨', 'MATERIAL', 'ドラゴンから剥ぎ取った一般的な骨。', 200, 1),
  (gen_random_uuid(), 'ドラゴンの鋭牙', 'MATERIAL', 'ドラゴンの稀少な部位。', 2000, 1),
  (gen_random_uuid(), 'ドラゴンの魔核', 'MATERIAL', 'ドラゴンの体内にある幻の魔核。', 20000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ドラゴンの武器', 'WEAPON', 'WEAPON_SWORD', 'ドラゴンの素材で作られた強力な武器。', 5000, 5, '{"attack": 150, "elementalAttack": "FIRE", "elementalAttackValue": 50}'::jsonb),
  (gen_random_uuid(), 'ドラゴンの防具', 'ARMOR', NULL, 'ドラゴンの素材で作られた堅牢な防具。', 5000, 8, '{"defense": 120, "elementalResistance": "WIND", "elementalResistanceValue": 50}'::jsonb),
  (gen_random_uuid(), 'ドラゴンの装飾', 'ACCESSORY', NULL, 'ドラゴンの魔核を用いた装飾品。', 8000, 1, '{"attack": 50, "defense": 40, "elementalAttack": "FIRE", "elementalAttackValue": 20, "elementalResistance": "WIND", "elementalResistanceValue": 20}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ドラゴンの武器' LIMIT 1), '{"ドラゴンの皮": 5, "ドラゴンの骨": 3, "ドラゴンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ドラゴンの防具' LIMIT 1), '{"ドラゴンの皮": 8, "ドラゴンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ドラゴンの装飾' LIMIT 1), '{"ドラゴンの骨": 3, "ドラゴンの鋭牙": 2, "ドラゴンの魔核": 1}'::jsonb);

-- ゴルゴン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ゴルゴンの皮', 'MATERIAL', 'ゴルゴンから剥ぎ取った一般的な皮。', 144, 1),
  (gen_random_uuid(), 'ゴルゴンの骨', 'MATERIAL', 'ゴルゴンから剥ぎ取った一般的な骨。', 144, 1),
  (gen_random_uuid(), 'ゴルゴンの鋭牙', 'MATERIAL', 'ゴルゴンの稀少な部位。', 1440, 1),
  (gen_random_uuid(), 'ゴルゴンの魔核', 'MATERIAL', 'ゴルゴンの体内にある幻の魔核。', 14400, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ゴルゴンの武器', 'WEAPON', 'WEAPON_SWORD', 'ゴルゴンの素材で作られた強力な武器。', 3600, 5, '{"attack": 108, "elementalAttack": "EARTH", "elementalAttackValue": 36}'::jsonb),
  (gen_random_uuid(), 'ゴルゴンの防具', 'ARMOR', NULL, 'ゴルゴンの素材で作られた堅牢な防具。', 3600, 8, '{"defense": 86, "elementalResistance": "DARK", "elementalResistanceValue": 36}'::jsonb),
  (gen_random_uuid(), 'ゴルゴンの装飾', 'ACCESSORY', NULL, 'ゴルゴンの魔核を用いた装飾品。', 5760, 1, '{"attack": 36, "defense": 28, "elementalAttack": "EARTH", "elementalAttackValue": 14, "elementalResistance": "DARK", "elementalResistanceValue": 14}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ゴルゴンの武器' LIMIT 1), '{"ゴルゴンの皮": 5, "ゴルゴンの骨": 3, "ゴルゴンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゴルゴンの防具' LIMIT 1), '{"ゴルゴンの皮": 8, "ゴルゴンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ゴルゴンの装飾' LIMIT 1), '{"ゴルゴンの骨": 3, "ゴルゴンの鋭牙": 2, "ゴルゴンの魔核": 1}'::jsonb);

-- ワイバーン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'ワイバーンの皮', 'MATERIAL', 'ワイバーンから剥ぎ取った一般的な皮。', 170, 1),
  (gen_random_uuid(), 'ワイバーンの骨', 'MATERIAL', 'ワイバーンから剥ぎ取った一般的な骨。', 170, 1),
  (gen_random_uuid(), 'ワイバーンの鋭牙', 'MATERIAL', 'ワイバーンの稀少な部位。', 1700, 1),
  (gen_random_uuid(), 'ワイバーンの魔核', 'MATERIAL', 'ワイバーンの体内にある幻の魔核。', 17000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'ワイバーンの武器', 'WEAPON', 'WEAPON_SWORD', 'ワイバーンの素材で作られた強力な武器。', 4250, 5, '{"attack": 127, "elementalAttack": "WIND", "elementalAttackValue": 42}'::jsonb),
  (gen_random_uuid(), 'ワイバーンの防具', 'ARMOR', NULL, 'ワイバーンの素材で作られた堅牢な防具。', 4250, 8, '{"defense": 102, "elementalResistance": "THUNDER", "elementalResistanceValue": 42}'::jsonb),
  (gen_random_uuid(), 'ワイバーンの装飾', 'ACCESSORY', NULL, 'ワイバーンの魔核を用いた装飾品。', 6800, 1, '{"attack": 42, "defense": 34, "elementalAttack": "WIND", "elementalAttackValue": 17, "elementalResistance": "THUNDER", "elementalResistanceValue": 17}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'ワイバーンの武器' LIMIT 1), '{"ワイバーンの皮": 5, "ワイバーンの骨": 3, "ワイバーンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ワイバーンの防具' LIMIT 1), '{"ワイバーンの皮": 8, "ワイバーンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'ワイバーンの装飾' LIMIT 1), '{"ワイバーンの骨": 3, "ワイバーンの鋭牙": 2, "ワイバーンの魔核": 1}'::jsonb);

-- 魔王の手下 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '魔王の手下の皮', 'MATERIAL', '魔王の手下から剥ぎ取った一般的な皮。', 176, 1),
  (gen_random_uuid(), '魔王の手下の骨', 'MATERIAL', '魔王の手下から剥ぎ取った一般的な骨。', 176, 1),
  (gen_random_uuid(), '魔王の手下の鋭牙', 'MATERIAL', '魔王の手下の稀少な部位。', 1760, 1),
  (gen_random_uuid(), '魔王の手下の魔核', 'MATERIAL', '魔王の手下の体内にある幻の魔核。', 17600, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '魔王の手下の武器', 'WEAPON', 'WEAPON_SWORD', '魔王の手下の素材で作られた強力な武器。', 4400, 5, '{"attack": 132, "elementalAttack": "DARK", "elementalAttackValue": 44}'::jsonb),
  (gen_random_uuid(), '魔王の手下の防具', 'ARMOR', NULL, '魔王の手下の素材で作られた堅牢な防具。', 4400, 8, '{"defense": 105, "elementalResistance": "FIRE", "elementalResistanceValue": 44}'::jsonb),
  (gen_random_uuid(), '魔王の手下の装飾', 'ACCESSORY', NULL, '魔王の手下の魔核を用いた装飾品。', 7040, 1, '{"attack": 44, "defense": 35, "elementalAttack": "DARK", "elementalAttackValue": 17, "elementalResistance": "FIRE", "elementalResistanceValue": 17}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '魔王の手下の武器' LIMIT 1), '{"魔王の手下の皮": 5, "魔王の手下の骨": 3, "魔王の手下の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '魔王の手下の防具' LIMIT 1), '{"魔王の手下の皮": 8, "魔王の手下の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '魔王の手下の装飾' LIMIT 1), '{"魔王の手下の骨": 3, "魔王の手下の鋭牙": 2, "魔王の手下の魔核": 1}'::jsonb);

-- 深淵の歩者 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '深淵の歩者の皮', 'MATERIAL', '深淵の歩者から剥ぎ取った一般的な皮。', 180, 1),
  (gen_random_uuid(), '深淵の歩者の骨', 'MATERIAL', '深淵の歩者から剥ぎ取った一般的な骨。', 180, 1),
  (gen_random_uuid(), '深淵の歩者の鋭牙', 'MATERIAL', '深淵の歩者の稀少な部位。', 1800, 1),
  (gen_random_uuid(), '深淵の歩者の魔核', 'MATERIAL', '深淵の歩者の体内にある幻の魔核。', 18000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '深淵の歩者の武器', 'WEAPON', 'WEAPON_SWORD', '深淵の歩者の素材で作られた強力な武器。', 4500, 5, '{"attack": 135, "elementalAttack": "DARK", "elementalAttackValue": 45}'::jsonb),
  (gen_random_uuid(), '深淵の歩者の防具', 'ARMOR', NULL, '深淵の歩者の素材で作られた堅牢な防具。', 4500, 8, '{"defense": 108, "elementalResistance": "ICE", "elementalResistanceValue": 45}'::jsonb),
  (gen_random_uuid(), '深淵の歩者の装飾', 'ACCESSORY', NULL, '深淵の歩者の魔核を用いた装飾品。', 7200, 1, '{"attack": 45, "defense": 36, "elementalAttack": "DARK", "elementalAttackValue": 18, "elementalResistance": "ICE", "elementalResistanceValue": 18}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '深淵の歩者の武器' LIMIT 1), '{"深淵の歩者の皮": 5, "深淵の歩者の骨": 3, "深淵の歩者の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '深淵の歩者の防具' LIMIT 1), '{"深淵の歩者の皮": 8, "深淵の歩者の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '深淵の歩者の装飾' LIMIT 1), '{"深淵の歩者の骨": 3, "深淵の歩者の鋭牙": 2, "深淵の歩者の魔核": 1}'::jsonb);

-- タイタン のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), 'タイタンの皮', 'MATERIAL', 'タイタンから剥ぎ取った一般的な皮。', 190, 1),
  (gen_random_uuid(), 'タイタンの骨', 'MATERIAL', 'タイタンから剥ぎ取った一般的な骨。', 190, 1),
  (gen_random_uuid(), 'タイタンの鋭牙', 'MATERIAL', 'タイタンの稀少な部位。', 1900, 1),
  (gen_random_uuid(), 'タイタンの魔核', 'MATERIAL', 'タイタンの体内にある幻の魔核。', 19000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), 'タイタンの武器', 'WEAPON', 'WEAPON_SWORD', 'タイタンの素材で作られた強力な武器。', 4750, 5, '{"attack": 142, "elementalAttack": "EARTH", "elementalAttackValue": 47}'::jsonb),
  (gen_random_uuid(), 'タイタンの防具', 'ARMOR', NULL, 'タイタンの素材で作られた堅牢な防具。', 4750, 8, '{"defense": 114, "elementalResistance": "THUNDER", "elementalResistanceValue": 47}'::jsonb),
  (gen_random_uuid(), 'タイタンの装飾', 'ACCESSORY', NULL, 'タイタンの魔核を用いた装飾品。', 7600, 1, '{"attack": 47, "defense": 38, "elementalAttack": "EARTH", "elementalAttackValue": 19, "elementalResistance": "THUNDER", "elementalResistanceValue": 19}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = 'タイタンの武器' LIMIT 1), '{"タイタンの皮": 5, "タイタンの骨": 3, "タイタンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'タイタンの防具' LIMIT 1), '{"タイタンの皮": 8, "タイタンの鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = 'タイタンの装飾' LIMIT 1), '{"タイタンの骨": 3, "タイタンの鋭牙": 2, "タイタンの魔核": 1}'::jsonb);

-- 古竜 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '古竜の皮', 'MATERIAL', '古竜から剥ぎ取った一般的な皮。', 300, 1),
  (gen_random_uuid(), '古竜の骨', 'MATERIAL', '古竜から剥ぎ取った一般的な骨。', 300, 1),
  (gen_random_uuid(), '古竜の鋭牙', 'MATERIAL', '古竜の稀少な部位。', 3000, 1),
  (gen_random_uuid(), '古竜の魔核', 'MATERIAL', '古竜の体内にある幻の魔核。', 30000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '古竜の武器', 'WEAPON', 'WEAPON_SWORD', '古竜の素材で作られた強力な武器。', 7500, 5, '{"attack": 225, "elementalAttack": "LIGHT", "elementalAttackValue": 75}'::jsonb),
  (gen_random_uuid(), '古竜の防具', 'ARMOR', NULL, '古竜の素材で作られた堅牢な防具。', 7500, 8, '{"defense": 180, "elementalResistance": "DARK", "elementalResistanceValue": 75}'::jsonb),
  (gen_random_uuid(), '古竜の装飾', 'ACCESSORY', NULL, '古竜の魔核を用いた装飾品。', 12000, 1, '{"attack": 75, "defense": 60, "elementalAttack": "LIGHT", "elementalAttackValue": 30, "elementalResistance": "DARK", "elementalResistanceValue": 30}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '古竜の武器' LIMIT 1), '{"古竜の皮": 5, "古竜の骨": 3, "古竜の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '古竜の防具' LIMIT 1), '{"古竜の皮": 8, "古竜の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '古竜の装飾' LIMIT 1), '{"古竜の骨": 3, "古竜の鋭牙": 2, "古竜の魔核": 1}'::jsonb);

-- 魔王 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '魔王の皮', 'MATERIAL', '魔王から剥ぎ取った一般的な皮。', 400, 1),
  (gen_random_uuid(), '魔王の骨', 'MATERIAL', '魔王から剥ぎ取った一般的な骨。', 400, 1),
  (gen_random_uuid(), '魔王の鋭牙', 'MATERIAL', '魔王の稀少な部位。', 4000, 1),
  (gen_random_uuid(), '魔王の魔核', 'MATERIAL', '魔王の体内にある幻の魔核。', 40000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '魔王の武器', 'WEAPON', 'WEAPON_SWORD', '魔王の素材で作られた強力な武器。', 10000, 5, '{"attack": 300, "elementalAttack": "DARK", "elementalAttackValue": 100}'::jsonb),
  (gen_random_uuid(), '魔王の防具', 'ARMOR', NULL, '魔王の素材で作られた堅牢な防具。', 10000, 8, '{"defense": 240, "elementalResistance": "FIRE", "elementalResistanceValue": 100}'::jsonb),
  (gen_random_uuid(), '魔王の装飾', 'ACCESSORY', NULL, '魔王の魔核を用いた装飾品。', 16000, 1, '{"attack": 100, "defense": 80, "elementalAttack": "DARK", "elementalAttackValue": 40, "elementalResistance": "FIRE", "elementalResistanceValue": 40}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '魔王の武器' LIMIT 1), '{"魔王の皮": 5, "魔王の骨": 3, "魔王の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '魔王の防具' LIMIT 1), '{"魔王の皮": 8, "魔王の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '魔王の装飾' LIMIT 1), '{"魔王の骨": 3, "魔王の鋭牙": 2, "魔王の魔核": 1}'::jsonb);

-- 死神 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '死神の皮', 'MATERIAL', '死神から剥ぎ取った一般的な皮。', 360, 1),
  (gen_random_uuid(), '死神の骨', 'MATERIAL', '死神から剥ぎ取った一般的な骨。', 360, 1),
  (gen_random_uuid(), '死神の鋭牙', 'MATERIAL', '死神の稀少な部位。', 3600, 1),
  (gen_random_uuid(), '死神の魔核', 'MATERIAL', '死神の体内にある幻の魔核。', 36000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '死神の武器', 'WEAPON', 'WEAPON_SWORD', '死神の素材で作られた強力な武器。', 9000, 5, '{"attack": 270, "elementalAttack": "DARK", "elementalAttackValue": 90}'::jsonb),
  (gen_random_uuid(), '死神の防具', 'ARMOR', NULL, '死神の素材で作られた堅牢な防具。', 9000, 8, '{"defense": 216, "elementalResistance": "ICE", "elementalResistanceValue": 90}'::jsonb),
  (gen_random_uuid(), '死神の装飾', 'ACCESSORY', NULL, '死神の魔核を用いた装飾品。', 14400, 1, '{"attack": 90, "defense": 72, "elementalAttack": "DARK", "elementalAttackValue": 36, "elementalResistance": "ICE", "elementalResistanceValue": 36}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '死神の武器' LIMIT 1), '{"死神の皮": 5, "死神の骨": 3, "死神の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '死神の防具' LIMIT 1), '{"死神の皮": 8, "死神の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '死神の装飾' LIMIT 1), '{"死神の骨": 3, "死神の鋭牙": 2, "死神の魔核": 1}'::jsonb);

-- 堕天使 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '堕天使の皮', 'MATERIAL', '堕天使から剥ぎ取った一般的な皮。', 340, 1),
  (gen_random_uuid(), '堕天使の骨', 'MATERIAL', '堕天使から剥ぎ取った一般的な骨。', 340, 1),
  (gen_random_uuid(), '堕天使の鋭牙', 'MATERIAL', '堕天使の稀少な部位。', 3400, 1),
  (gen_random_uuid(), '堕天使の魔核', 'MATERIAL', '堕天使の体内にある幻の魔核。', 34000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '堕天使の武器', 'WEAPON', 'WEAPON_SWORD', '堕天使の素材で作られた強力な武器。', 8500, 5, '{"attack": 255, "elementalAttack": "LIGHT", "elementalAttackValue": 85}'::jsonb),
  (gen_random_uuid(), '堕天使の防具', 'ARMOR', NULL, '堕天使の素材で作られた堅牢な防具。', 8500, 8, '{"defense": 204, "elementalResistance": "DARK", "elementalResistanceValue": 85}'::jsonb),
  (gen_random_uuid(), '堕天使の装飾', 'ACCESSORY', NULL, '堕天使の魔核を用いた装飾品。', 13600, 1, '{"attack": 85, "defense": 68, "elementalAttack": "LIGHT", "elementalAttackValue": 34, "elementalResistance": "DARK", "elementalResistanceValue": 34}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '堕天使の武器' LIMIT 1), '{"堕天使の皮": 5, "堕天使の骨": 3, "堕天使の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '堕天使の防具' LIMIT 1), '{"堕天使の皮": 8, "堕天使の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '堕天使の装飾' LIMIT 1), '{"堕天使の骨": 3, "堕天使の鋭牙": 2, "堕天使の魔核": 1}'::jsonb);

-- 混沌の神 のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '混沌の神の皮', 'MATERIAL', '混沌の神から剥ぎ取った一般的な皮。', 500, 1),
  (gen_random_uuid(), '混沌の神の骨', 'MATERIAL', '混沌の神から剥ぎ取った一般的な骨。', 500, 1),
  (gen_random_uuid(), '混沌の神の鋭牙', 'MATERIAL', '混沌の神の稀少な部位。', 5000, 1),
  (gen_random_uuid(), '混沌の神の魔核', 'MATERIAL', '混沌の神の体内にある幻の魔核。', 50000, 1);

INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '混沌の神の武器', 'WEAPON', 'WEAPON_SWORD', '混沌の神の素材で作られた強力な武器。', 12500, 5, '{"attack": 375, "elementalAttack": "DARK", "elementalAttackValue": 125}'::jsonb),
  (gen_random_uuid(), '混沌の神の防具', 'ARMOR', NULL, '混沌の神の素材で作られた堅牢な防具。', 12500, 8, '{"defense": 300, "elementalResistance": "LIGHT", "elementalResistanceValue": 125}'::jsonb),
  (gen_random_uuid(), '混沌の神の装飾', 'ACCESSORY', NULL, '混沌の神の魔核を用いた装飾品。', 20000, 1, '{"attack": 125, "defense": 100, "elementalAttack": "DARK", "elementalAttackValue": 50, "elementalResistance": "LIGHT", "elementalResistanceValue": 50}'::jsonb);

INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '混沌の神の武器' LIMIT 1), '{"混沌の神の皮": 5, "混沌の神の骨": 3, "混沌の神の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '混沌の神の防具' LIMIT 1), '{"混沌の神の皮": 8, "混沌の神の鋭牙": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '混沌の神の装飾' LIMIT 1), '{"混沌の神の骨": 3, "混沌の神の鋭牙": 2, "混沌の神の魔核": 1}'::jsonb);
