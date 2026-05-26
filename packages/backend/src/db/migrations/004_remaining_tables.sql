-- Migration 004: 残りの全テーブル

-- クエスト
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    npc_id UUID REFERENCES npcs(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '{}',
    reward JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    deadline_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quests_character ON quests(character_id);

-- 人生記録
CREATE TABLE IF NOT EXISTS life_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id),
    character_name VARCHAR(100) NOT NULL,
    birth_date TIMESTAMPTZ NOT NULL,
    death_date TIMESTAMPTZ NOT NULL,
    final_age INTEGER NOT NULL,
    cause_of_death VARCHAR(100) NOT NULL,
    nation_history JSONB NOT NULL DEFAULT '[]',
    village_history JSONB NOT NULL DEFAULT '[]',
    achievements JSONB NOT NULL DEFAULT '[]',
    total_gold_earned INTEGER NOT NULL DEFAULT 0,
    monsters_killed INTEGER NOT NULL DEFAULT 0,
    crops_harvested INTEGER NOT NULL DEFAULT 0,
    summary_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_records_player ON life_records(player_id);

-- 墓
CREATE TABLE IF NOT EXISTS graves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    village_id UUID REFERENCES villages(id),
    epitaph VARCHAR(200),
    character_name VARCHAR(100) NOT NULL,
    birth_year INTEGER NOT NULL,
    death_year INTEGER NOT NULL,
    cause_of_death VARCHAR(100) NOT NULL,
    coordinates JSONB,
    is_in_ruins BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 噂
CREATE TABLE IF NOT EXISTS rumors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_village_id UUID NOT NULL REFERENCES villages(id),
    current_village_id UUID NOT NULL REFERENCES villages(id),
    content TEXT NOT NULL,
    original_content TEXT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    propagation_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 遺言
CREATE TABLE IF NOT EXISTS wills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    beneficiaries JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 借金
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    moneylender_npc_id UUID NOT NULL REFERENCES npcs(id),
    principal INTEGER NOT NULL,
    current_balance INTEGER NOT NULL,
    interest_rate INTEGER NOT NULL,
    last_interest_applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ギルド
CREATE TABLE IF NOT EXISTS guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID REFERENCES villages(id),
    nation_id UUID REFERENCES nations(id),
    guild_type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    rank INTEGER NOT NULL DEFAULT 1,
    contribution_points INTEGER NOT NULL DEFAULT 0,
    join_conditions JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS guild_memberships (
    guild_id UUID NOT NULL REFERENCES guilds(id),
    character_id UUID NOT NULL REFERENCES characters(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (guild_id, character_id)
);

-- 師匠・弟子関係
CREATE TABLE IF NOT EXISTS mentor_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_character_id UUID REFERENCES characters(id),
    mentor_npc_id UUID REFERENCES npcs(id),
    apprentice_character_id UUID NOT NULL REFERENCES characters(id),
    skill_type VARCHAR(30) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT mentor_must_exist CHECK (
        mentor_character_id IS NOT NULL OR mentor_npc_id IS NOT NULL
    )
);

-- 家畜・ペット
CREATE TABLE IF NOT EXISTS livestock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    animal_type VARCHAR(20) NOT NULL,
    health_internal INTEGER NOT NULL DEFAULT 100,
    last_fed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 生態系
CREATE TABLE IF NOT EXISTS ecosystem_states (
    region_id UUID NOT NULL,
    monster_type VARCHAR(50) NOT NULL,
    population INTEGER NOT NULL DEFAULT 0,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (region_id, monster_type)
);

-- 結婚
CREATE TABLE IF NOT EXISTS marriages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    spouse_npc_id UUID NOT NULL REFERENCES npcs(id),
    married_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
