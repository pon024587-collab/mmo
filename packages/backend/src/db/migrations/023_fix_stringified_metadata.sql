-- Migration 023: JSON.stringify で二重エンコードされた metadata を修正する
-- postgres.js は JSONB を自動でシリアライズするため、JSON.stringify は不要だった
-- 文字列として保存された metadata を正しい JSONB オブジェクトに変換する

UPDATE items
SET metadata = metadata::text::jsonb
WHERE jsonb_typeof(metadata) = 'string';
