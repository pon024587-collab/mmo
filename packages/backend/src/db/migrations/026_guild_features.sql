-- Migration 026: プレイヤーギルドの管理機能（オーナー、申請制、メンバー管理）

ALTER TABLE guilds
  ADD COLUMN IF NOT EXISTS owner_character_id UUID REFERENCES characters(id),
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT FALSE;

-- 既存のプレイヤーギルドに対して、一番最初に加入したメンバーをオーナーにする
UPDATE guilds g
SET owner_character_id = (
  SELECT gm.character_id FROM guild_memberships gm
  WHERE gm.guild_id = g.id
  ORDER BY gm.joined_at ASC
  LIMIT 1
)
WHERE g.guild_type = 'PLAYER' AND g.owner_character_id IS NULL;

-- 加入申請テーブル
CREATE TABLE IF NOT EXISTS guild_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id),
  character_id UUID NOT NULL REFERENCES characters(id),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(guild_id, character_id, status)
);
