-- Migration 007: 知識・書物・プレイヤー間インタラクション関連テーブル

-- キャラクター知識
CREATE TABLE IF NOT EXISTS character_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    knowledge_type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id, content)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_character ON character_knowledge(character_id);

-- プレイヤー間メッセージ
CREATE TABLE IF NOT EXISTS player_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_character_id UUID NOT NULL REFERENCES characters(id),
    receiver_character_id UUID NOT NULL REFERENCES characters(id),
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON player_messages(receiver_character_id);

-- プレイヤー間取引リクエスト
CREATE TABLE IF NOT EXISTS trade_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_character_id UUID NOT NULL REFERENCES characters(id),
    target_character_id UUID NOT NULL REFERENCES characters(id),
    offer_items JSONB NOT NULL DEFAULT '[]',
    offer_gold INTEGER NOT NULL DEFAULT 0,
    request_items JSONB NOT NULL DEFAULT '[]',
    request_gold INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

-- 書物Itemテンプレート追加
INSERT INTO item_templates (name, category, base_price, weight, description) VALUES
  ('BOOK',       'BOOK', 50,  1, '手書きの本。様々な知識が記されている。'),
  ('MAP',        'BOOK', 30,  1, '手描きの地図。訪れた場所が記されている。'),
  ('LEGEND_BOOK','BOOK', 200, 1, '伝説の書。古代の秘密が記されている。')
ON CONFLICT DO NOTHING;

-- 建築物テーブルに追加データ
INSERT INTO item_templates (name, category, base_price, weight, description) VALUES
  ('ALE',        'CONSUMABLE', 12, 1, '麦酒。ストレスを和らげるが疲れやすくなる。'),
  ('WINE',       'CONSUMABLE', 20, 1, 'ワイン。上質な醸造酒。'),
  ('HERBAL_TEA', 'CONSUMABLE', 8,  1, '薬草茶。体に優しい飲み物。')
ON CONFLICT DO NOTHING;
