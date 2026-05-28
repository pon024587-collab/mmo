-- Migration 025: 戦闘システム拡張（貫通・クリティカル）とレイドボス・メールボックス

-- キャラクターに貫通・クリティカルステータスを追加
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS phys_penetration INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mag_penetration INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crit_rate INTEGER NOT NULL DEFAULT 5;
-- crit_rate は % 単位（デフォルト5%）

-- プレイヤーメールボックス
CREATE TABLE IF NOT EXISTS player_mails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  sender VARCHAR(100) NOT NULL DEFAULT 'システム',
  subject VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  reward_gold INTEGER NOT NULL DEFAULT 0,
  reward_items JSONB NOT NULL DEFAULT '[]',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_player_mails_character ON player_mails(character_id, is_claimed);

-- レイドボステーブル
CREATE TABLE IF NOT EXISTS raid_bosses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  element VARCHAR(30) NOT NULL DEFAULT 'NONE',
  max_hp BIGINT NOT NULL,
  current_hp BIGINT NOT NULL,
  phys_def INTEGER NOT NULL DEFAULT 500,
  mag_def INTEGER NOT NULL DEFAULT 500,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  spawned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '3 days'
);

-- レイドボスへのダメージ記録（プレイヤーごと）
CREATE TABLE IF NOT EXISTS raid_damage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id UUID NOT NULL REFERENCES raid_bosses(id),
  character_id UUID NOT NULL REFERENCES characters(id),
  guild_id UUID REFERENCES guilds(id),
  damage BIGINT NOT NULL DEFAULT 0,
  dealt_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_raid_damage_character ON raid_damage_logs(raid_id, character_id);
CREATE INDEX IF NOT EXISTS idx_raid_damage_guild ON raid_damage_logs(raid_id, guild_id);

-- ギルド貢献度（レイドダメージ累計）
CREATE TABLE IF NOT EXISTS guild_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id),
  character_id UUID NOT NULL REFERENCES characters(id),
  raid_damage_total BIGINT NOT NULL DEFAULT 0,
  raid_gacha_tickets INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(guild_id, character_id)
);

-- レイドボスダメージ閾値報酬の達成記録
CREATE TABLE IF NOT EXISTS raid_milestone_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id UUID NOT NULL REFERENCES raid_bosses(id),
  guild_id UUID NOT NULL REFERENCES guilds(id),
  milestone BIGINT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(raid_id, guild_id, milestone)
);
