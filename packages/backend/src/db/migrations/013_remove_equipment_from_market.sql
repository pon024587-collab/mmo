-- Migration 013: 市場から装備品を削除
-- 装備品はドロップ・クラフトのみで入手可能にする

DELETE FROM market_listings
WHERE item_template_id IN (
  SELECT id FROM item_templates WHERE category IN ('WEAPON', 'ARMOR')
);
