-- Migration 010: PvP・商隊・賞金首・道中システム

-- 賞金首テーブル
CREATE TABLE IF NOT EXISTS bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    nation_id UUID NOT NULL REFERENCES nations(id),
    amount INTEGER NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bounties_character ON bounties(character_id);

-- 囚人テーブル（捕まえたキャラクター）
CREATE TABLE IF NOT EXISTS prisoners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prisoner_character_id UUID NOT NULL REFERENCES characters(id),
    captor_character_id UUID NOT NULL REFERENCES characters(id),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_released BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (prisoner_character_id)
);

-- 商隊テーブル
CREATE TABLE IF NOT EXISTS caravans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_village_id UUID NOT NULL REFERENCES villages(id),
    destination_village_id UUID NOT NULL REFERENCES villages(id),
    departure_at TIMESTAMPTZ NOT NULL,
    arrival_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    passenger_fee INTEGER NOT NULL DEFAULT 20,
    guard_reward INTEGER NOT NULL DEFAULT 50,
    max_passengers INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_caravans_origin ON caravans(origin_village_id);
CREATE INDEX IF NOT EXISTS idx_caravans_status ON caravans(status);

-- 商隊参加テーブル
CREATE TABLE IF NOT EXISTS caravan_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caravan_id UUID NOT NULL REFERENCES caravans(id),
    character_id UUID NOT NULL REFERENCES characters(id),
    role VARCHAR(20) NOT NULL, -- PASSENGER | GUARD
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (caravan_id, character_id)
);

-- 道中潜伏テーブル
CREATE TABLE IF NOT EXISTS ambush_setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    route_village_a UUID NOT NULL REFERENCES villages(id),
    route_village_b UUID NOT NULL REFERENCES villages(id),
    max_attacks INTEGER NOT NULL DEFAULT 3,
    attacks_done INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- キャラクターに拘束状態を追加
ALTER TABLE characters ADD COLUMN IF NOT EXISTS is_captured BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS captured_by UUID REFERENCES characters(id);
ALTER TABLE characters ADD COLUMN IF NOT EXISTS imprisonment_ends_at TIMESTAMPTZ;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS bounty_amount INTEGER NOT NULL DEFAULT 0;
