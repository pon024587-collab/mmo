-- Migration 010: 魔物素材・クラフト装備・クラフトレシピ

-- クラフトレシピテーブル
CREATE TABLE IF NOT EXISTS crafting_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    result_item_template_id UUID NOT NULL REFERENCES item_templates(id),
    materials JSONB NOT NULL DEFAULT '[]',
    required_crafting_skill INTEGER NOT NULL DEFAULT 0,
    description TEXT
);

-- 新規魔物素材アイテム
INSERT INTO item_templates (name, category, base_price, description) VALUES
-- Tier1素材
('スライムの核',       'MATERIAL', 5,   'スライムの中心にある核。不思議な弾力がある。'),
('コウモリの翼',       'MATERIAL', 6,   'コウモリの翼膜。薄くて丈夫。'),
('ネズミの毛皮',       'MATERIAL', 4,   '大ネズミの毛皮。細かい毛が密集している。'),
('古びた骨',           'MATERIAL', 3,   'スケルトンの骨。魔力が抜けかけている。'),
('腐敗した肉',         'MATERIAL', 2,   'ゾンビの肉。強烈な悪臭がする。'),
('ホブゴブリンの牙',   'MATERIAL', 12,  'ホブゴブリンの鋭い牙。ゴブリンより大きい。'),
('コボルトの鱗',       'MATERIAL', 10,  'コボルトの体を覆う小さな鱗。'),
('蜘蛛の糸',           'MATERIAL', 15,  '毒蜘蛛の糸。非常に丈夫で軽い。'),
-- Tier2素材
('リザードの鱗',       'MATERIAL', 18,  'リザードマンの鱗。防御力が高い。'),
('ハーピーの羽根',     'MATERIAL', 22,  'ハーピーの羽根。風の魔力が宿る。'),
('蛇の皮',             'MATERIAL', 20,  '大蛇の皮。なめらかで丈夫。'),
('蛇の毒腺',           'MATERIAL', 35,  '大蛇の毒腺。強力な毒が詰まっている。希少。'),
('魔犬の牙',           'MATERIAL', 30,  '魔犬の牙。魔力が宿っている。'),
('グレムリンの爪',     'MATERIAL', 14,  'グレムリンの爪。金属を傷つけるほど硬い。'),
('包帯布',             'MATERIAL', 8,   'ミイラを包んでいた布。魔力が染み込んでいる。'),
('呪いの砂',           'MATERIAL', 25,  'ミイラから採れる砂。呪いの力が宿る。'),
('魔法の石',           'MATERIAL', 40,  'ゴーレムの核。魔力が凝縮されている。'),
('オークの角',         'MATERIAL', 28,  'オーク戦士の角飾り。力の象徴。'),
-- Tier3素材
('グリフィンの羽根',   'MATERIAL', 80,  'グリフィンの羽根。風と雷の力が宿る。'),
('グリフィンの爪',     'MATERIAL', 100, 'グリフィンの爪。鋼鉄をも引き裂く。'),
('バジリスクの石眼',   'MATERIAL', 150, 'バジリスクの眼。石化の魔力が宿る。非常に希少。'),
('石化の体液',         'MATERIAL', 60,  'バジリスクの体液。触れると固まる。'),
('ヴァンパイアの血',   'MATERIAL', 90,  'ヴァンパイアの血。命を吸う力が宿る。'),
('ヴァンパイアの牙',   'MATERIAL', 120, 'ヴァンパイアの牙。鮮血に飢えた鋭い牙。'),
('オーガの角',         'MATERIAL', 70,  'オーガの角。破壊力の象徴。'),
('キマイラの角',       'MATERIAL', 110, 'キマイラの角。炎・氷・雷の力が混在する。'),
('キマイラの爪',       'MATERIAL', 95,  'キマイラの爪。三つの力を持つ。'),
('銀の毛皮',           'MATERIAL', 200, 'ウェアウルフの毛皮。純銀のような輝きを持つ。希少。'),
('ガーゴイルの翼',     'MATERIAL', 85,  'ガーゴイルの翼。石でできているが軽い。'),
('サイクロプスの目',   'MATERIAL', 180, 'サイクロプスの大きな目。全てを見通す力がある。希少。'),
('死者の魂石',         'MATERIAL', 130, 'ゾンビナイトから採れる魂の結晶。'),
('闇の魔石',           'MATERIAL', 140, '闇魔法使いが持つ魔石。禁断の力が宿る。'),
('禁書の欠片',         'MATERIAL', 160, '禁断の魔法書の断片。読めば呪われる。'),
('古代石',             'MATERIAL', 75,  'ストーンゴーレムの古代の石。歴史を刻んでいる。'),
('幻影の結晶',         'MATERIAL', 200, 'ドッペルゲンガーの結晶。あらゆる形に変わる。'),
('暗黒の鎧片',         'MATERIAL', 220, '暗黒騎士の鎧の欠片。絶望の力が宿る。'),
('呪われた剣の欠片',   'MATERIAL', 180, '暗黒騎士の剣の破片。持つ者を呪う。'),
-- Tier4素材
('不死鳥の羽根',       'MATERIAL', 400, 'フェニックスの羽根。炎の中でも燃えない。非常に希少。'),
('炎の心臓',           'MATERIAL', 500, 'フェニックスの心臓。永遠に燃え続ける。'),
('リッチの杖',         'MATERIAL', 350, 'リッチが持つ杖の残骸。強大な魔力が宿る。'),
('死の魔石',           'MATERIAL', 450, 'リッチの核となる魔石。死の力が凝縮。'),
('ヒュドラの頭',       'MATERIAL', 380, 'ヒュドラの頭。切っても再生する力の源。'),
('再生の血',           'MATERIAL', 300, 'ヒュドラの血。飲めば傷が癒えるという。'),
('ミノタウロスの角',   'MATERIAL', 320, 'ミノタウロスの角。迷宮の主の証。'),
('迷宮の牛革',         'MATERIAL', 250, 'ミノタウロスの革。迷宮の魔力が宿る。'),
('ゴルゴンの蛇髪',     'MATERIAL', 360, 'ゴルゴンの蛇の髪。見る者を石に変える力。'),
('石化の瞳',           'MATERIAL', 420, 'ゴルゴンの瞳。石化魔法の源。極めて希少。'),
('ワイバーンの翼',     'MATERIAL', 500, 'ワイバーンの翼。風を切る力がある。'),
('竜の血',             'MATERIAL', 600, 'ドラゴン系の血。鍛冶に使うと武器が強化される。'),
('悪魔の角',           'MATERIAL', 550, '魔王の手下の角。魔界の力が宿る。'),
('魔界の石',           'MATERIAL', 480, '魔界から持ち込まれた石。禍々しい力を持つ。'),
('深淵の結晶',         'MATERIAL', 700, '深淵の歩者から採れる結晶。虚無の力が凝縮。'),
('タイタンの骨',       'MATERIAL', 800, 'タイタンの骨。神話時代の巨人の骨。'),
('巨人の心臓',         'MATERIAL', 900, 'タイタンの心臓。鼓動が止まっても動き続ける。'),
-- Tier5素材（ボス専用）
('古竜の鱗',           'MATERIAL', 1500,'古竜の鱗。現代の竜の鱗より遥かに硬い。伝説級。'),
('古竜の心臓',         'MATERIAL', 3000,'古竜の心臓。世界最強の魔力の源。極めて希少。'),
('魔王の核',           'MATERIAL', 5000,'魔王の力の核。この世の全ての邪悪が凝縮されている。'),
('魔界の王冠',         'MATERIAL', 4000,'魔王が被っていた王冠の欠片。支配の力が宿る。'),
('死の結晶',           'MATERIAL', 2000,'死神から採れる結晶。死そのものが形になったもの。'),
('堕天使の翼',         'MATERIAL', 2500,'堕天使の翼。天上の力と闇の力が混ざり合う。'),
('聖なる羽根',         'MATERIAL', 1800,'堕天使の翼から採れる羽根。まだ神聖さが残る。'),
('混沌の欠片',         'MATERIAL', 6000,'混沌の神から採れる欠片。この世の理を超えた力。'),
('世界樹の欠片',       'MATERIAL', 8000,'混沌の神が持つ世界樹の断片。世界創造の力。'),
('神の眼',             'MATERIAL', 10000,'混沌の神の眼。全知全能の力が宿る。最高の素材。')
ON CONFLICT DO NOTHING;

-- クラフト専用装備（武器）
INSERT INTO item_templates (name, category, base_price, item_weight, attack_power, defense_power, magic_power, required_strength, required_dexterity, description) VALUES
('狼牙の短剣',       'WEAPON', 0, 2, 18, 0, 0,  5,  15, '狼の毛皮と毒牙で作った短剣。素早い連撃が得意。クラフト専用。'),
('蜘蛛毒の弓',       'WEAPON', 0, 3, 22, 0, 5,  0,  20, '蜘蛛の糸と毒腺で作った弓。毒の矢を放つ。クラフト専用。'),
('コボルトの刃',     'WEAPON', 0, 2, 14, 0, 0,  8,  8,  'コボルトの鱗で作った刃。軽くて扱いやすい。クラフト専用。'),
('ヴァンパイアブレード','WEAPON', 0, 5, 42, 0, 10, 20, 10, 'ヴァンパイアの血と牙で作った剣。命を吸う。クラフト専用。'),
('グリフィン爪の剣', 'WEAPON', 0, 5, 50, 0, 15, 25, 15, 'グリフィンの爪で作った剣。風を纏う。クラフト専用。'),
('キマイラの魔剣',   'WEAPON', 0, 6, 58, 0, 20, 30, 10, 'キマイラの素材で作った剣。炎・氷・雷を宿す。クラフト専用。'),
('石化の杖',         'WEAPON', 0, 2, 5,  0, 55, 5,  20, 'バジリスクの眼で作った杖。石化魔法が使える。クラフト専用。'),
('リッチの呪杖',     'WEAPON', 0, 3, 8,  0, 75, 5,  25, 'リッチの杖と死の魔石で作った呪杖。クラフト専用。'),
('古竜の大剣',       'WEAPON', 0, 10, 85, 5, 20, 50, 15, '古竜の鱗と心臓で作った最強クラスの大剣。クラフト専用。'),
('死神の大鎌',       'WEAPON', 0, 8, 95, 0, 30, 45, 20, '死者の魂石と死の結晶で作った大鎌。クラフト専用。'),
('魔王の破壊剣',     'WEAPON', 0, 8, 110,0, 40, 60, 20, '魔王の核と悪魔の角で作った終焉の剣。クラフト専用。'),
('混沌の神器',       'WEAPON', 0, 5, 130,10, 60, 50, 30, '混沌の欠片と神の眼で作った神話級の武器。クラフト専用。')
ON CONFLICT DO NOTHING;

-- クラフト専用装備（防具）
INSERT INTO item_templates (name, category, base_price, item_weight, attack_power, defense_power, magic_power, required_strength, required_dexterity, description) VALUES
('蜘蛛の糸の鎧',     'ARMOR', 0, 2, 0, 12, 8,  5,  10, '蜘蛛の糸で編んだ軽鎧。魔法耐性もある。クラフト専用。'),
('ハーピーのマント', 'ARMOR', 0, 1, 0, 8,  12, 5,  15, 'ハーピーの羽根で作ったマント。風の加護。クラフト専用。'),
('トロルの皮鎧',     'ARMOR', 0, 8, 0, 28, 0,  15, 0,  'トロルの皮で作った鎧。高い防御力。クラフト専用。'),
('銀狼の外套',       'ARMOR', 0, 3, 0, 22, 10, 10, 20, '銀の毛皮と狼の毛皮で作った外套。クラフト専用。'),
('ガーゴイルの盾',   'ARMOR', 0, 5, 0, 32, 15, 20, 5,  'ガーゴイルの翼で作った盾。魔法を弾く。クラフト専用。'),
('ミノタウロスの角兜','ARMOR', 0, 4, 0, 32, 0,  30, 0,  'ミノタウロスの角を使った兜。力の象徴。クラフト専用。'),
('不死鳥の羽根鎧',  'ARMOR', 0, 4, 0, 38, 25, 25, 10, '不死鳥の羽根で作った鎧。炎の守護。クラフト専用。'),
('ワイバーンの鎧',   'ARMOR', 0, 7, 0, 45, 20, 35, 10, 'ワイバーンの翼と竜の血で作った鎧。クラフト専用。'),
('堕天使の翼鎧',     'ARMOR', 0, 5, 0, 60, 35, 40, 15, '堕天使の翼で作った鎧。天と魔の力。クラフト専用。'),
('古竜の鱗鎧',       'ARMOR', 0, 9, 0, 72, 25, 50, 10, '古竜の鱗で作った鎧。究極の防御。クラフト専用。'),
('混沌の鎧',         'ARMOR', 0, 7, 0, 80, 40, 45, 15, '混沌の欠片で作った鎧。世界の理を超える。クラフト専用。')
ON CONFLICT DO NOTHING;

-- クラフトレシピを登録
INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '狼牙の短剣', id,
  '[{"name":"狼の毛皮","quantity":2},{"name":"毒の牙","quantity":1}]',
  0, '狼素材から作る軽量短剣。'
FROM item_templates WHERE name = '狼牙の短剣' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '蜘蛛毒の弓', id,
  '[{"name":"蜘蛛の糸","quantity":3},{"name":"蛇の毒腺","quantity":2}]',
  10, '毒素材から作る弓。毒の矢を放つ。'
FROM item_templates WHERE name = '蜘蛛毒の弓' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'コボルトの刃', id,
  '[{"name":"コボルトの鱗","quantity":4}]',
  0, 'コボルトの鱗から作る入門者向けの刃。'
FROM item_templates WHERE name = 'コボルトの刃' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ヴァンパイアブレード', id,
  '[{"name":"ヴァンパイアの血","quantity":2},{"name":"ヴァンパイアの牙","quantity":1}]',
  50, '吸血素材から作る命吸いの剣。'
FROM item_templates WHERE name = 'ヴァンパイアブレード' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'グリフィン爪の剣', id,
  '[{"name":"グリフィンの爪","quantity":2},{"name":"グリフィンの羽根","quantity":1}]',
  80, 'グリフィン素材から作る風の剣。'
FROM item_templates WHERE name = 'グリフィン爪の剣' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'キマイラの魔剣', id,
  '[{"name":"キマイラの角","quantity":1},{"name":"キマイラの爪","quantity":2}]',
  100, 'キマイラの素材から作る三属性の剣。'
FROM item_templates WHERE name = 'キマイラの魔剣' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '石化の杖', id,
  '[{"name":"バジリスクの石眼","quantity":1},{"name":"魔法の石","quantity":2}]',
  80, 'バジリスク素材から作る石化の杖。'
FROM item_templates WHERE name = '石化の杖' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'リッチの呪杖', id,
  '[{"name":"リッチの杖","quantity":1},{"name":"死の魔石","quantity":2}]',
  150, 'リッチ素材から作る最強クラスの呪杖。'
FROM item_templates WHERE name = 'リッチの呪杖' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '古竜の大剣', id,
  '[{"name":"古竜の鱗","quantity":3},{"name":"古竜の心臓","quantity":1},{"name":"竜の血","quantity":2}]',
  250, '古竜の素材から作る伝説の大剣。'
FROM item_templates WHERE name = '古竜の大剣' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '死神の大鎌', id,
  '[{"name":"死者の魂石","quantity":2},{"name":"死の結晶","quantity":1}]',
  200, '死素材から作る魂を刈り取る大鎌。'
FROM item_templates WHERE name = '死神の大鎌' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '魔王の破壊剣', id,
  '[{"name":"魔王の核","quantity":1},{"name":"悪魔の角","quantity":2},{"name":"魔界の石","quantity":3}]',
  300, '魔王素材から作る終焉の剣。世界最強クラス。'
FROM item_templates WHERE name = '魔王の破壊剣' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '混沌の神器', id,
  '[{"name":"混沌の欠片","quantity":2},{"name":"神の眼","quantity":1},{"name":"世界樹の欠片","quantity":1}]',
  500, '混沌の神素材から作る神話級の武器。この世界で最強。'
FROM item_templates WHERE name = '混沌の神器' LIMIT 1;

-- 防具レシピ
INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '蜘蛛の糸の鎧', id,
  '[{"name":"蜘蛛の糸","quantity":5}]',
  0, '蜘蛛の糸で編んだ軽くて丈夫な鎧。'
FROM item_templates WHERE name = '蜘蛛の糸の鎧' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ハーピーのマント', id,
  '[{"name":"ハーピーの羽根","quantity":3}]',
  10, 'ハーピーの羽根で作ったマント。'
FROM item_templates WHERE name = 'ハーピーのマント' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'トロルの皮鎧', id,
  '[{"name":"トロルの皮","quantity":2}]',
  30, 'トロルの皮で作った頑丈な鎧。'
FROM item_templates WHERE name = 'トロルの皮鎧' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '銀狼の外套', id,
  '[{"name":"銀の毛皮","quantity":2},{"name":"狼の毛皮","quantity":2}]',
  60, 'ウェアウルフと狼の毛皮で作った外套。'
FROM item_templates WHERE name = '銀狼の外套' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ガーゴイルの盾', id,
  '[{"name":"ガーゴイルの翼","quantity":2},{"name":"魔法の石","quantity":1}]',
  70, 'ガーゴイル素材から作った魔法を弾く盾。'
FROM item_templates WHERE name = 'ガーゴイルの盾' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ミノタウロスの角兜', id,
  '[{"name":"ミノタウロスの角","quantity":1},{"name":"迷宮の牛革","quantity":2}]',
  120, 'ミノタウロス素材で作った力の兜。'
FROM item_templates WHERE name = 'ミノタウロスの角兜' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '不死鳥の羽根鎧', id,
  '[{"name":"不死鳥の羽根","quantity":3},{"name":"炎の心臓","quantity":1}]',
  180, 'フェニックス素材で作った炎の守護鎧。'
FROM item_templates WHERE name = '不死鳥の羽根鎧' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT 'ワイバーンの鎧', id,
  '[{"name":"ワイバーンの翼","quantity":2},{"name":"竜の血","quantity":2}]',
  200, 'ワイバーン素材で作った竜系の鎧。'
FROM item_templates WHERE name = 'ワイバーンの鎧' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '堕天使の翼鎧', id,
  '[{"name":"堕天使の翼","quantity":2},{"name":"聖なる羽根","quantity":3}]',
  280, '堕天使素材で作った天魔の鎧。'
FROM item_templates WHERE name = '堕天使の翼鎧' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '古竜の鱗鎧', id,
  '[{"name":"古竜の鱗","quantity":4},{"name":"古竜の心臓","quantity":1}]',
  300, '古竜素材で作った究極の防御鎧。'
FROM item_templates WHERE name = '古竜の鱗鎧' LIMIT 1;

INSERT INTO crafting_recipes (name, result_item_template_id, materials, required_crafting_skill, description)
SELECT '混沌の鎧', id,
  '[{"name":"混沌の欠片","quantity":3},{"name":"世界樹の欠片","quantity":1}]',
  500, '混沌の神素材で作った神話級の鎧。'
FROM item_templates WHERE name = '混沌の鎧' LIMIT 1;
