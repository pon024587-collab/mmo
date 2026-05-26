-- Migration 011: キャラクターの装備スロット追加

ALTER TABLE characters ADD COLUMN IF NOT EXISTS equipped_weapon_id UUID REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS equipped_armor_id UUID REFERENCES items(id) ON DELETE SET NULL;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS equipped_accessory_id UUID REFERENCES items(id) ON DELETE SET NULL;
