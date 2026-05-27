-- Migration 014: 市場から魔物素材を削除
-- 魔物素材はギルド納品専用にする

DELETE FROM market_listings
WHERE item_template_id IN (
  SELECT id FROM item_templates
  WHERE name IN (
    'ゴブリンの耳', 'オークの牙', '狼の毛皮', '盗賊のナイフ',
    'トロルの皮', 'ダークエルフの弓', '竜の鱗', 'アンデッドの骨',
    '魔石', '毒の牙'
  )
);
