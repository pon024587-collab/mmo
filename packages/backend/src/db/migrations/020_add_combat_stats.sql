-- Migration 020: 戦闘・剥ぎ取りのステータスカラム追加
ALTER TABLE characters ADD COLUMN IF NOT EXISTS strength_growth INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dexterity_growth INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS skill_skinning_growth INTEGER NOT NULL DEFAULT 0;
