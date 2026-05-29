-- Migration 019: カスタム魔物・アイテムテーブル

-- カスタム魔物定義
CREATE TABLE IF NOT EXISTS custom_monsters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    base_power INTEGER NOT NULL DEFAULT 10,
    min_count INTEGER NOT NULL DEFAULT 1,
    max_count INTEGER NOT NULL DEFAULT 1,
    elements TEXT[] NOT NULL DEFAULT '{}',
    terrains TEXT[] NOT NULL DEFAULT '{"PLAIN"}',
    drop_materials JSONB NOT NULL DEFAULT '[]',
    drop_items JSONB NOT NULL DEFAULT '[]',
    spawn_village_id UUID REFERENCES villages(id),
    spawn_start_hour INTEGER,
    spawn_end_hour INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- カスタムアイテムテンプレート（item_templatesに追加するだけでOK）
-- item_templatesテーブルに is_custom カラムを追加
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE item_templates ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN NOT NULL DEFAULT FALSE;
