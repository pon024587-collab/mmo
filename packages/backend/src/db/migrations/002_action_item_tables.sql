-- Migration 002: 行動・アイテム関連テーブル

-- 行動キュー
CREATE TABLE IF NOT EXISTS action_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    action_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_completion_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    result_text TEXT,
    bullmq_job_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_action_queue_character_id ON action_queue(character_id);
CREATE INDEX IF NOT EXISTS idx_action_queue_status ON action_queue(status);
CREATE INDEX IF NOT EXISTS idx_action_queue_scheduled ON action_queue(scheduled_completion_at);

-- アイテムテンプレート
CREATE TABLE IF NOT EXISTS item_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    base_price INTEGER NOT NULL DEFAULT 10,
    max_durability INTEGER,
    weight INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    properties JSONB NOT NULL DEFAULT '{}'
);

-- アイテム（インスタンス）
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_character_id UUID REFERENCES characters(id),
    owner_housing_id UUID,
    item_template_id UUID NOT NULL REFERENCES item_templates(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    durability INTEGER,
    quality_internal INTEGER DEFAULT 50,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_owner_character ON items(owner_character_id);
CREATE INDEX IF NOT EXISTS idx_items_template ON items(item_template_id);

-- イベントログ（監査・差分記録）
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id UUID NOT NULL,
    field_name VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_logs_character ON event_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_recorded ON event_logs(recorded_at);
