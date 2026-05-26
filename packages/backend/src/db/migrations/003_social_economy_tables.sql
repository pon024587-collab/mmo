-- Migration 003: 社会・経済関連テーブル

-- NPC
CREATE TABLE IF NOT EXISTS npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES villages(id),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    personality_params JSONB NOT NULL DEFAULT '{}',
    is_alive BOOLEAN NOT NULL DEFAULT TRUE,
    is_sick BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_npcs_village ON npcs(village_id);

-- Character-NPC関係値
CREATE TABLE IF NOT EXISTS character_npc_relations (
    character_id UUID NOT NULL REFERENCES characters(id),
    npc_id UUID NOT NULL REFERENCES npcs(id),
    relation_value INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (character_id, npc_id)
);

-- 市場価格
CREATE TABLE IF NOT EXISTS market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES villages(id),
    item_template_id UUID NOT NULL REFERENCES item_templates(id),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    current_price INTEGER NOT NULL,
    base_price INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (village_id, item_template_id)
);

-- 市場価格履歴
CREATE TABLE IF NOT EXISTS market_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES villages(id),
    item_template_id UUID NOT NULL REFERENCES item_templates(id),
    price INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_history_village_item ON market_price_history(village_id, item_template_id);
CREATE INDEX IF NOT EXISTS idx_market_history_recorded ON market_price_history(recorded_at);

-- 土地
CREATE TABLE IF NOT EXISTS lands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES villages(id),
    land_type VARCHAR(20) NOT NULL,
    owner_character_id UUID REFERENCES characters(id),
    renter_character_id UUID REFERENCES characters(id),
    purchase_price INTEGER NOT NULL,
    rent_price_per_day INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'UNOWNED'
);

CREATE INDEX IF NOT EXISTS idx_lands_village ON lands(village_id);

-- 住居
CREATE TABLE IF NOT EXISTS housings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id),
    village_id UUID NOT NULL REFERENCES villages(id),
    land_id UUID NOT NULL REFERENCES lands(id),
    storage_slots_used INTEGER NOT NULL DEFAULT 0,
    storage_slots_max INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 外交状態
CREATE TABLE IF NOT EXISTS diplomacy_states (
    nation_a_id UUID NOT NULL REFERENCES nations(id),
    nation_b_id UUID NOT NULL REFERENCES nations(id),
    state VARCHAR(20) NOT NULL DEFAULT 'NEUTRAL',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (nation_a_id, nation_b_id)
);
