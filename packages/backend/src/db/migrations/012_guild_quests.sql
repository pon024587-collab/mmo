-- Migration 012: ギルド納品クエストシステム

-- ギルド納品クエストテーブル
CREATE TABLE IF NOT EXISTS guild_daily_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL REFERENCES guilds(id),
    quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    required_quantity INTEGER NOT NULL DEFAULT 1,
    reward_gold INTEGER NOT NULL DEFAULT 50,
    reward_exp INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (guild_id, quest_date, title)
);

CREATE INDEX IF NOT EXISTS idx_guild_daily_quests_guild_date ON guild_daily_quests(guild_id, quest_date);

-- ギルドクエスト達成記録
CREATE TABLE IF NOT EXISTS guild_quest_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_id UUID NOT NULL REFERENCES guild_daily_quests(id),
    character_id UUID NOT NULL REFERENCES characters(id),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (quest_id, character_id)
);

-- 主要都市にギルドを設置（発展度が高い村）
INSERT INTO guilds (village_id, guild_type, name, rank, join_conditions)
SELECT v.id, 'ADVENTURER', v.name || '冒険者ギルド', 1, '{}'
FROM villages v
WHERE v.development_level >= 4
  AND v.is_abandoned = false
ON CONFLICT DO NOTHING;

-- 商人ギルドも設置
INSERT INTO guilds (village_id, guild_type, name, rank, join_conditions)
SELECT v.id, 'MERCHANT', v.name || '商人ギルド', 1, '{}'
FROM villages v
WHERE v.development_level >= 5
  AND v.is_abandoned = false
ON CONFLICT DO NOTHING;
