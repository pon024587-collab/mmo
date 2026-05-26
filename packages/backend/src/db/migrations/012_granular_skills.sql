-- Migration 012: 詳細スキルシステム（武器・魔法10種）

-- キャラクター詳細スキル
CREATE TABLE IF NOT EXISTS character_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    skill_category VARCHAR(50) NOT NULL,
    exp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id, skill_category)
);

CREATE INDEX IF NOT EXISTS idx_character_skills_character ON character_skills(character_id);

-- アイテムテンプレートに武器のスキルカテゴリを追加（剣、槍、斧など）
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS weapon_category VARCHAR(30);

UPDATE item_templates SET weapon_category = 'SWORD' WHERE name LIKE '%剣%';
UPDATE item_templates SET weapon_category = 'AXE' WHERE name LIKE '%斧%';
UPDATE item_templates SET weapon_category = 'SPEAR' WHERE name LIKE '%槍%';
UPDATE item_templates SET weapon_category = 'BOW' WHERE name LIKE '%弓%';
UPDATE item_templates SET weapon_category = 'STAFF' WHERE name LIKE '%杖%';
UPDATE item_templates SET weapon_category = 'DAGGER' WHERE name LIKE '%短剣%' OR name LIKE '%ナイフ%' OR name LIKE '%刃%';

-- 魔法の習得方法変更に伴い、既存の魔法書（SPELL_BOOK_〜）の用途を変更または保持
-- 今回は戦闘による自動成長を主とするため、このまま進める。
