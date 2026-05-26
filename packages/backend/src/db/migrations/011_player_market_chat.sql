-- Migration 011: プレイヤーマーケット・村チャット

-- プレイヤーマーケット（露店）
CREATE TABLE IF NOT EXISTS player_market_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_character_id UUID NOT NULL REFERENCES characters(id),
    village_id UUID NOT NULL REFERENCES villages(id),
    item_id UUID NOT NULL REFERENCES items(id), -- 出品中アイテムの実体
    price INTEGER NOT NULL CHECK (price >= 0),
    is_sold BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_player_market_village ON player_market_listings(village_id);
CREATE INDEX IF NOT EXISTS idx_player_market_seller ON player_market_listings(seller_character_id);

-- 村チャット（ローカルチャット）
CREATE TABLE IF NOT EXISTS village_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id UUID NOT NULL REFERENCES villages(id),
    sender_character_id UUID REFERENCES characters(id),
    sender_name VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_village_chat_village ON village_chat_messages(village_id, created_at DESC);
