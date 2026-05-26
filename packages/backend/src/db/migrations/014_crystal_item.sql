-- Migration 014: クリスタルアイテムの追加
INSERT INTO item_templates (name, category, base_price, weight, description)
VALUES ('CRYSTAL', 'MATERIAL', 500, 1, '不思議な力が宿るクリスタル。装備にはめ込むことができる。')
ON CONFLICT DO NOTHING;
