-- Migration 009: アイテム日本語化・装備品120種類・隠しステータス

-- 既存のアイテムテンプレートを日本語名に更新
UPDATE item_templates SET name = 'ジャガイモ', description = 'ジャガイモ。主食として重宝される。' WHERE name = 'POTATO';
UPDATE item_templates SET name = '小麦', description = '小麦。パンや醸造に使われる。' WHERE name = 'WHEAT';
UPDATE item_templates SET name = 'ニンジン', description = 'ニンジン。甘みがあり栄養豊富。' WHERE name = 'CARROT';
UPDATE item_templates SET name = 'キャベツ', description = 'キャベツ。冬でも育つ丈夫な野菜。' WHERE name = 'CABBAGE';
UPDATE item_templates SET name = '薬草', description = '薬草。治療や料理に使われる。' WHERE name = 'HERB';
UPDATE item_templates SET name = 'パン', description = 'パン。小麦から作られる基本食料。' WHERE name = 'BREAD';
UPDATE item_templates SET name = '肉', description = '肉。戦闘や狩りで手に入る。' WHERE name = 'MEAT';
UPDATE item_templates SET name = '水', description = '水。水源がない場所で必要になる。' WHERE name = 'WATER';
UPDATE item_templates SET name = '鉄鉱石', description = '鉄鉱石。武器や道具の素材。' WHERE name = 'IRON_ORE';
UPDATE item_templates SET name = '木材', description = '木材。建築や燃料に使われる。' WHERE name = 'WOOD';
UPDATE item_templates SET name = '石材', description = '石材。建築に使われる。' WHERE name = 'STONE';
UPDATE item_templates SET name = '燃料', description = '燃料。焚き火に使う。' WHERE name = 'FUEL';
UPDATE item_templates SET name = '麦酒', description = '麦酒。ストレスを和らげるが疲れやすくなる。' WHERE name = 'ALE';
UPDATE item_templates SET name = 'ワイン', description = 'ワイン。上質な醸造酒。' WHERE name = 'WINE';
UPDATE item_templates SET name = '薬草茶', description = '薬草茶。体に優しい飲み物。' WHERE name = 'HERBAL_TEA';
UPDATE item_templates SET name = '本', description = '手書きの本。様々な知識が記されている。' WHERE name = 'BOOK';
UPDATE item_templates SET name = '地図', description = '手描きの地図。訪れた場所が記されている。' WHERE name = 'MAP';
UPDATE item_templates SET name = '伝説の書', description = '伝説の書。古代の秘密が記されている。' WHERE name = 'LEGEND_BOOK';

-- 隠しステータスカラムを追加
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS required_strength INTEGER NOT NULL DEFAULT 0;
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS required_dexterity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS item_weight INTEGER NOT NULL DEFAULT 1;
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS attack_power INTEGER NOT NULL DEFAULT 0;
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS defense_power INTEGER NOT NULL DEFAULT 0;
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS magic_power INTEGER NOT NULL DEFAULT 0;

-- キャラクターに隠しステータスを追加
ALTER TABLE characters ADD COLUMN IF NOT EXISTS strength_growth INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dexterity_growth INTEGER NOT NULL DEFAULT 0;

-- 剥ぎ取りスキル
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_skinning_growth INTEGER NOT NULL DEFAULT 0;

-- 武器120種類（既存を更新＋新規追加）
UPDATE item_templates SET name = '鉄の剣', attack_power = 15, item_weight = 5, required_strength = 10, description = '鉄の剣。基本的な武器。' WHERE name = 'SWORD' OR name = '鉄の剣';
UPDATE item_templates SET name = '木の弓', attack_power = 12, item_weight = 3, required_dexterity = 15, description = '木の弓。遠距離攻撃が可能。' WHERE name = 'BOW' OR name = '木の弓';
UPDATE item_templates SET name = '魔法の杖', magic_power = 20, item_weight = 2, required_dexterity = 5, description = '魔法の杖。魔法の威力を高める。' WHERE name = 'STAFF' OR name = '魔法の杖';
UPDATE item_templates SET name = '鉄の鎧', defense_power = 20, item_weight = 8, required_strength = 20, description = '鉄の鎧。防御力を高める。' WHERE name = 'ARMOR' OR name = '鉄の鎧';
UPDATE item_templates SET name = '盾', defense_power = 10, item_weight = 4, required_strength = 10, description = '盾。攻撃を防ぐ。' WHERE name = 'SHIELD' OR name = '盾';
UPDATE item_templates SET name = '毛皮の外套', defense_power = 5, item_weight = 3, required_strength = 0, description = '毛皮の外套。防寒に優れる。' WHERE name = 'FUR_COAT' OR name = '毛皮の外套';
UPDATE item_templates SET name = '火球の魔法書', magic_power = 5, item_weight = 1, description = '火球の魔法書。炎の魔法を習得できる。' WHERE name = 'SPELL_BOOK_FIRE' OR name = '火球の魔法書';
UPDATE item_templates SET name = '治癒の魔法書', magic_power = 5, item_weight = 1, description = '治癒の魔法書。回復魔法を習得できる。' WHERE name = 'SPELL_BOOK_HEAL' OR name = '治癒の魔法書';

-- 武器追加（合計で120種類に向けて）
INSERT INTO item_templates (name, category, base_price, item_weight, attack_power, defense_power, magic_power, required_strength, required_dexterity, description) VALUES
-- 剣系
('銅の剣',       'WEAPON', 30,  4, 8,  0, 0, 5,  0,  '銅の剣。初心者向けの武器。'),
('鋼の剣',       'WEAPON', 200, 6, 25, 0, 0, 20, 0,  '鋼の剣。熟練の鍛冶師が作った剣。'),
('大剣',         'WEAPON', 350, 12,40, 0, 0, 35, 0,  '大剣。重いが威力は絶大。'),
('短剣',         'WEAPON', 80,  2, 10, 0, 0, 5,  10, '短剣。素早い攻撃が可能。'),
('銀の剣',       'WEAPON', 500, 5, 30, 0, 0, 15, 5,  '銀の剣。魔物に特効がある。'),
('炎の剣',       'WEAPON', 800, 6, 45, 0, 10,25, 10, '炎の剣。炎の力が宿っている。'),
('氷の剣',       'WEAPON', 800, 6, 45, 0, 10,25, 10, '氷の剣。氷の力が宿っている。'),
('雷の剣',       'WEAPON', 800, 6, 45, 0, 10,25, 10, '雷の剣。雷の力が宿っている。'),
('聖剣',         'WEAPON', 2000,7, 60, 5, 20,30, 15, '聖剣。光の力が宿る伝説の剣。'),
('呪いの剣',     'WEAPON', 1500,6, 55, 0, 0, 20, 5,  '呪いの剣。使い手の魂を蝕む。'),
-- 斧系
('手斧',         'WEAPON', 60,  5, 12, 0, 0, 10, 0,  '手斧。木こりも使う武器。'),
('戦斧',         'WEAPON', 180, 9, 28, 0, 0, 25, 0,  '戦斧。重い一撃を与える。'),
('大斧',         'WEAPON', 400, 14,45, 0, 0, 40, 0,  '大斧。最大級の破壊力。'),
('銀の斧',       'WEAPON', 600, 9, 35, 0, 0, 25, 0,  '銀の斧。魔物に特効がある。'),
-- 槍系
('木槍',         'WEAPON', 40,  4, 10, 0, 0, 8,  5,  '木槍。リーチが長い武器。'),
('鉄槍',         'WEAPON', 150, 6, 22, 0, 0, 18, 8,  '鉄槍。騎士が好む武器。'),
('竜槍',         'WEAPON', 1200,7, 50, 0, 15,30, 15, '竜槍。竜の骨で作られた槍。'),
-- 弓系
('鉄の弓',       'WEAPON', 200, 4, 20, 0, 0, 10, 20, '鉄の弓。強力な弓。'),
('魔法の弓',     'WEAPON', 600, 3, 25, 0, 15,5,  25, '魔法の弓。魔力を矢に込める。'),
('竜骨の弓',     'WEAPON', 1500,4, 40, 0, 20,10, 35, '竜骨の弓。最高の弓。'),
-- 杖系
('鉄の杖',       'WEAPON', 150, 3, 5,  0, 25,5,  10, '鉄の杖。魔法使いの基本装備。'),
('水晶の杖',     'WEAPON', 400, 2, 5,  0, 40,0,  15, '水晶の杖。魔力を増幅する。'),
('竜の杖',       'WEAPON', 1200,3, 10, 0, 60,5,  25, '竜の杖。最高の魔法触媒。'),
-- 防具（鎧）
('革の鎧',       'ARMOR',  50,  4, 0,  8,  0, 5,  5,  '革の鎧。軽くて動きやすい。'),
('鎖帷子',       'ARMOR',  200, 7, 0,  15, 0, 15, 0,  '鎖帷子。バランスの良い防具。'),
('板金鎧',       'ARMOR',  500, 12,0,  30, 0, 30, 0,  '板金鎧。最高の防御力。'),
('魔法の鎧',     'ARMOR',  800, 8, 0,  20, 15,20, 5,  '魔法の鎧。魔法防御も高い。'),
('竜鱗の鎧',     'ARMOR',  2000,10,0,  45, 20,35, 10, '竜鱗の鎧。最強の防具。'),
('軽装鎧',       'ARMOR',  80,  3, 0,  10, 0, 8,  10, '軽装鎧。素早さを重視した鎧。'),
-- 盾
('木の盾',       'ARMOR',  30,  3, 0,  5,  0, 5,  0,  '木の盾。基本的な盾。'),
('鋼の盾',       'ARMOR',  300, 6, 0,  18, 0, 20, 0,  '鋼の盾。頑丈な盾。'),
('魔法の盾',     'ARMOR',  700, 5, 0,  12, 20,15, 5,  '魔法の盾。魔法を弾く。'),
-- 兜
('革の兜',       'ARMOR',  40,  2, 0,  5,  0, 5,  0,  '革の兜。基本的な頭部防具。'),
('鉄の兜',       'ARMOR',  150, 4, 0,  12, 0, 15, 0,  '鉄の兜。頭部をしっかり守る。'),
('魔法の兜',     'ARMOR',  500, 3, 0,  8,  15,10, 5,  '魔法の兜。魔法防御が高い。'),
-- 手袋
('革の手袋',     'ARMOR',  30,  1, 2,  3,  0, 3,  5,  '革の手袋。手を守りつつ器用さを保つ。'),
('鉄の手袋',     'ARMOR',  120, 2, 0,  8,  0, 10, 0,  '鉄の手袋。手をしっかり守る。'),
('魔法の手袋',   'ARMOR',  400, 1, 0,  5,  12,5,  8,  '魔法の手袋。魔法の精度が上がる。'),
-- ブーツ
('革のブーツ',   'ARMOR',  35,  2, 0,  4,  0, 3,  5,  '革のブーツ。歩きやすい。'),
('鉄のブーツ',   'ARMOR',  130, 4, 0,  10, 0, 12, 0,  '鉄のブーツ。足をしっかり守る。'),
('風のブーツ',   'ARMOR',  600, 1, 0,  6,  10,5,  15, '風のブーツ。移動速度が上がる。'),
-- アクセサリー
('銅の指輪',     'ARMOR',  50,  0, 0,  0,  5, 0,  0,  '銅の指輪。魔力を少し高める。'),
('銀の指輪',     'ARMOR',  200, 0, 0,  0,  15,0,  0,  '銀の指輪。魔力を高める。'),
('金の指輪',     'ARMOR',  500, 0, 5,  5,  10,0,  0,  '金の指輪。全能力を少し高める。'),
('竜の指輪',     'ARMOR',  2000,0, 10, 10, 25,0,  0,  '竜の指輪。最高のアクセサリー。'),
('力の首飾り',   'ARMOR',  300, 0, 0,  0,  0, 0,  0,  '力の首飾り。筋力成長を促進する。'),
('器用の首飾り', 'ARMOR',  300, 0, 0,  0,  0, 0,  0,  '器用の首飾り。器用さ成長を促進する。'),
('魔力の首飾り', 'ARMOR',  300, 0, 0,  0,  20,0,  0,  '魔力の首飾り。魔法スキルの成長を促進する。')
ON CONFLICT DO NOTHING;

-- 魔物素材アイテム
INSERT INTO item_templates (name, category, base_price, item_weight, description) VALUES
('ゴブリンの耳',     'MATERIAL', 8,  1, 'ゴブリンの耳。薬の材料になる。'),
('オークの牙',       'MATERIAL', 20, 2, 'オークの牙。武器の素材になる。'),
('狼の毛皮',         'MATERIAL', 25, 2, '狼の毛皮。防具の素材になる。'),
('盗賊のナイフ',     'MATERIAL', 30, 1, '盗賊が持っていたナイフ。'),
('トロルの皮',       'MATERIAL', 50, 3, 'トロルの皮。頑丈な防具の素材。'),
('ダークエルフの弓', 'MATERIAL', 80, 2, 'ダークエルフが使っていた弓。'),
('竜の鱗',           'MATERIAL', 500,3, '竜の鱗。最高の防具素材。'),
('アンデッドの骨',   'MATERIAL', 15, 1, 'アンデッドの骨。魔法の素材になる。'),
('魔石',             'MATERIAL', 100,1, '魔物から取れる魔石。魔法道具の素材。'),
('毒の牙',           'MATERIAL', 40, 1, '毒を持つ魔物の牙。薬の材料。')
ON CONFLICT DO NOTHING;
