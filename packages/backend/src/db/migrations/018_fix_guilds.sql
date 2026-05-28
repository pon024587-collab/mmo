-- Migration 018: guildsテーブルの不足カラムを追加

ALTER TABLE guilds ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE guilds ADD COLUMN IF NOT EXISTS nation_id UUID REFERENCES nations(id);
