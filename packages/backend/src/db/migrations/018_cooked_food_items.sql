-- Migration 018: 料理済み専用アイテムの追加
-- 素材とは別に「料理済み食品」を専用アイテムとして登録する

INSERT INTO item_templates (name, category, base_price, weight, description)
VALUES
  ('焼きたてのパン',    'FOOD', 8,  0.3, '小麦から焼いた温かいパン。空腹を大きく回復する。'),
  ('肉シチュー',        'FOOD', 25, 0.8, '肉とニンジンで作った濃厚なシチュー。空腹と体力を大きく回復する。'),
  ('薬草茶',            'FOOD', 15, 0.2, '薬草を煎じた温かいお茶。喉の渇きを癒し、ストレスを軽減する。')
ON CONFLICT (name) DO NOTHING;
