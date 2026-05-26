-- Migration 001: コアテーブル作成
-- players, characters, villages, nations, system_config

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- システム設定（Real_Time_Clock エポック等）
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 国家
CREATE TABLE IF NOT EXISTS nations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    military_power INTEGER NOT NULL DEFAULT 50,
    economic_power INTEGER NOT NULL DEFAULT 50,
    diplomatic_skill INTEGER NOT NULL DEFAULT 50,
    tax_rate INTEGER NOT NULL DEFAULT 10,
    security_level INTEGER NOT NULL DEFAULT 50,
    version INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 村
CREATE TABLE IF NOT EXISTS villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nation_id UUID NOT NULL REFERENCES nations(id),
    name VARCHAR(100) NOT NULL,
    development_level INTEGER NOT NULL DEFAULT 1,
    population INTEGER NOT NULL DEFAULT 0,
    food_stock INTEGER NOT NULL DEFAULT 100,
    security_level INTEGER NOT NULL DEFAULT 50,
    economy_level INTEGER NOT NULL DEFAULT 50,
    terrain_type VARCHAR(20) NOT NULL DEFAULT 'PLAIN',
    current_weather VARCHAR(20) NOT NULL DEFAULT 'CLEAR',
    is_abandoned BOOLEAN NOT NULL DEFAULT FALSE,
    coordinates JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
    version INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_villages_nation_id ON villages(nation_id);

-- プレイヤー
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    device_fingerprint_hash VARCHAR(64) NOT NULL,
    device_fingerprint_data BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_fingerprint ON players(device_fingerprint_hash);

-- キャラクター
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id),
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IDLE',
    age INTEGER NOT NULL DEFAULT 18,
    health INTEGER NOT NULL DEFAULT 100,
    health_max INTEGER NOT NULL DEFAULT 100,
    mp INTEGER NOT NULL DEFAULT 100,
    mp_max INTEGER NOT NULL DEFAULT 100,
    gold INTEGER NOT NULL DEFAULT 50,
    village_id UUID NOT NULL REFERENCES villages(id),
    nation_id UUID NOT NULL REFERENCES nations(id),
    -- 内部パラメーター（プレイヤー非公開）
    hunger_internal INTEGER NOT NULL DEFAULT 100,
    thirst_internal INTEGER NOT NULL DEFAULT 100,
    fatigue_internal INTEGER NOT NULL DEFAULT 0,
    stress_internal INTEGER NOT NULL DEFAULT 0,
    body_temp_internal INTEGER NOT NULL DEFAULT 37,
    faith INTEGER NOT NULL DEFAULT 0,
    -- スキル成長値（プレイヤー非公開）
    skill_farming_growth INTEGER NOT NULL DEFAULT 0,
    skill_combat_growth INTEGER NOT NULL DEFAULT 0,
    skill_magic_growth INTEGER NOT NULL DEFAULT 0,
    skill_social_growth INTEGER NOT NULL DEFAULT 0,
    skill_crafting_growth INTEGER NOT NULL DEFAULT 0,
    skill_mining_growth INTEGER NOT NULL DEFAULT 0,
    skill_cooking_growth INTEGER NOT NULL DEFAULT 0,
    skill_trading_growth INTEGER NOT NULL DEFAULT 0,
    -- 状態フラグ
    is_injured BOOLEAN NOT NULL DEFAULT FALSE,
    is_sick BOOLEAN NOT NULL DEFAULT FALSE,
    is_imprisoned BOOLEAN NOT NULL DEFAULT FALSE,
    -- 楽観的ロック
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_village_id ON characters(village_id);
CREATE INDEX IF NOT EXISTS idx_characters_status ON characters(status);

-- エポック初期値
INSERT INTO system_config (key, value) VALUES
    ('game_epoch', NOW()::TEXT),
    ('world_initialized', 'false')
ON CONFLICT (key) DO NOTHING;
