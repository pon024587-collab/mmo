-- Migration 019: キャラクターにレベルを追加
ALTER TABLE characters ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;
