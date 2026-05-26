-- Migration 006: 魔法・土地関連テーブル

-- 習得魔法リスト
CREATE TABLE IF NOT EXISTS learned_spells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    spell_name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    mp_cost INTEGER NOT NULL DEFAULT 10,
    learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id, spell_name)
);

CREATE INDEX IF NOT EXISTS idx_learned_spells_character ON learned_spells(character_id);

-- 犯罪記録
CREATE TABLE IF NOT EXISTS crime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    nation_id UUID NOT NULL REFERENCES nations(id),
    crime_type VARCHAR(30) NOT NULL,
    severity INTEGER NOT NULL DEFAULT 1,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crime_records_character ON crime_records(character_id);

-- 税金負債
CREATE TABLE IF NOT EXISTS tax_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    nation_id UUID NOT NULL REFERENCES nations(id),
    amount INTEGER NOT NULL DEFAULT 0,
    last_collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id, nation_id)
);

-- ダンジョン
CREATE TABLE IF NOT EXISTS dungeons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    region_id UUID REFERENCES villages(id),
    max_floors INTEGER NOT NULL DEFAULT 5,
    difficulty INTEGER NOT NULL DEFAULT 1,
    coordinates JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'
);

-- ダンジョン探索状態
CREATE TABLE IF NOT EXISTS dungeon_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    dungeon_id UUID NOT NULL REFERENCES dungeons(id),
    current_floor INTEGER NOT NULL DEFAULT 1,
    entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id, dungeon_id)
);

-- 建築物
CREATE TABLE IF NOT EXISTS structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES villages(id),
    structure_type VARCHAR(30) NOT NULL,
    built_by UUID REFERENCES characters(id),
    is_destroyed BOOLEAN NOT NULL DEFAULT FALSE,
    coordinates JSONB,
    built_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 家畜
ALTER TABLE livestock ADD COLUMN IF NOT EXISTS village_id UUID REFERENCES villages(id);
