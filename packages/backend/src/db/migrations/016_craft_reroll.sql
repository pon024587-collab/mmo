-- Migration 016: クラフト・サブステータスリロールシステム

-- 装備のサブステータスをitemsのmetadataで管理
-- metadata: { substats: [{type: 'ATK', value: 10}, ...], rerollCount: 0 }

-- クラフトレシピテーブル
CREATE TABLE IF NOT EXISTS craft_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_item_template_id UUID NOT NULL REFERENCES item_templates(id),
    gold_cost INTEGER NOT NULL DEFAULT 0,
    required_materials JSONB NOT NULL DEFAULT '[]',
    required_skill_growth INTEGER NOT NULL DEFAULT 0,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_craft_recipes_result ON craft_recipes(result_item_template_id);

-- クラフトレシピ初期データ
INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 50, '[{"name":"鉄鉱石","qty":3},{"name":"木材","qty":1}]', 0, '基本的な鉄の剣を作る'
FROM item_templates it WHERE it.name = '鉄の剣' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 30, '[{"name":"木材","qty":2}]', 0, '木の弓を作る'
FROM item_templates it WHERE it.name = '木の弓' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 80, '[{"name":"鉄鉱石","qty":5},{"name":"石材","qty":2}]', 50, '鉄の鎧を作る'
FROM item_templates it WHERE it.name = '鉄の鎧' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 60, '[{"name":"鉄鉱石","qty":3}]', 30, '盾を作る'
FROM item_templates it WHERE it.name = '盾' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 150, '[{"name":"鉄鉱石","qty":8},{"name":"魔石","qty":1}]', 100, '鋼の剣を作る'
FROM item_templates it WHERE it.name = '鋼の剣' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 200, '[{"name":"鉄鉱石","qty":10},{"name":"石材","qty":5}]', 150, '板金鎧を作る'
FROM item_templates it WHERE it.name = '板金鎧' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 500, '[{"name":"竜の鱗","qty":3},{"name":"鉄鉱石","qty":10}]', 300, '竜鱗の鎧を作る'
FROM item_templates it WHERE it.name = '竜鱗の鎧' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 400, '[{"name":"竜の鱗","qty":2},{"name":"魔石","qty":3}]', 300, '竜の杖を作る'
FROM item_templates it WHERE it.name = '竜の杖' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 20, '[{"name":"小麦","qty":3}]', 0, 'パンを焼く'
FROM item_templates it WHERE it.name = 'パン' LIMIT 1;

INSERT INTO craft_recipes (result_item_template_id, gold_cost, required_materials, required_skill_growth, description)
SELECT it.id, 30, '[{"name":"肉","qty":2},{"name":"ニンジン","qty":2}]', 0, 'シチューを作る'
FROM item_templates it WHERE it.name = '肉' LIMIT 1;
