-- Migration 017: クラフトに金コストを追加

-- crafting_recipesにgold_costカラムを追加
ALTER TABLE crafting_recipes ADD COLUMN IF NOT EXISTS gold_cost INTEGER NOT NULL DEFAULT 0;

-- required_crafting_skillに応じた金コストを設定
-- スキル0（Tier1）: 50G
-- スキル100〜: 200G
-- スキル500〜: 1000G
-- スキル1000〜: 5000G
UPDATE crafting_recipes SET gold_cost = CASE
  WHEN required_crafting_skill = 0    THEN 50
  WHEN required_crafting_skill < 100  THEN 100
  WHEN required_crafting_skill < 300  THEN 300
  WHEN required_crafting_skill < 500  THEN 800
  WHEN required_crafting_skill < 800  THEN 2000
  WHEN required_crafting_skill < 1200 THEN 5000
  WHEN required_crafting_skill < 2000 THEN 15000
  ELSE 50000
END;
