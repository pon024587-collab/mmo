-- Migration 011: 魔物素材・装備品を全村の市場に追加

-- 魔物素材を全村の市場に追加
INSERT INTO market_listings (village_id, item_template_id, stock_quantity, current_price, base_price)
SELECT v.id, it.id, 0, it.base_price, it.base_price
FROM villages v
CROSS JOIN item_templates it
WHERE it.name IN (
  'ゴブリンの耳', 'オークの牙', '狼の毛皮', '盗賊のナイフ',
  'トロルの皮', 'ダークエルフの弓', '竜の鱗', 'アンデッドの骨',
  '魔石', '毒の牙'
)
AND v.is_abandoned = false
ON CONFLICT (village_id, item_template_id) DO NOTHING;

-- 装備品を全村の市場に追加（在庫は少なめ）
INSERT INTO market_listings (village_id, item_template_id, stock_quantity, current_price, base_price)
SELECT v.id, it.id, 3, it.base_price, it.base_price
FROM villages v
CROSS JOIN item_templates it
WHERE it.category IN ('WEAPON', 'ARMOR')
AND v.is_abandoned = false
ON CONFLICT (village_id, item_template_id) DO NOTHING;

-- 素材も市場に追加
INSERT INTO market_listings (village_id, item_template_id, stock_quantity, current_price, base_price)
SELECT v.id, it.id, 10, it.base_price, it.base_price
FROM villages v
CROSS JOIN item_templates it
WHERE it.name IN ('鉄鉱石', '木材', '石材', '燃料')
AND v.is_abandoned = false
ON CONFLICT (village_id, item_template_id) DO NOTHING;
