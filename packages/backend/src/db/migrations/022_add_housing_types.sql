-- Migration 022: Add housing types and constraints

ALTER TABLE housings ADD COLUMN IF NOT EXISTS housing_type VARCHAR(20) NOT NULL DEFAULT 'SHACK';

-- 既存の家をボロ家（倉庫枠0）にする
UPDATE housings SET housing_type = 'SHACK', storage_slots_max = 0;
