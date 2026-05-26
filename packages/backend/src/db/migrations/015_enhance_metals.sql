-- Migration 015: 強化用金属アイテムとシステム追加

-- 強化用金属素材
INSERT INTO item_templates (name, category, base_price, weight, description) VALUES
  ('COPPER_ORE',  'MATERIAL', 80,   2, '銅鉱石。山岳地帯で採掘できる。装備の+3〜+4強化に使う。'),
  ('SILVER_ORE',  'MATERIAL', 300,  2, '銀鉱石。森林地帯の鉱脈から採れる。装備の+5〜+6強化に使う。'),
  ('GOLD_ORE',    'MATERIAL', 1200, 2, '金鉱石。川床や河川で採掘できる。装備の+7〜+8強化に使う。'),
  ('MITHRIL_ORE', 'MATERIAL', 8000, 2, 'ミスリル鉱石。極寒や砂漠の奥地にしか存在しない幻の鉱石。+9強化に必要。')
ON CONFLICT DO NOTHING;
