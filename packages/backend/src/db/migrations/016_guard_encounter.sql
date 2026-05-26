-- Migration 016: 衛兵遭遇ペンディングフラグ
ALTER TABLE characters ADD COLUMN IF NOT EXISTS guard_encounter_pending BOOLEAN NOT NULL DEFAULT false;
