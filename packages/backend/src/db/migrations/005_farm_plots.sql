-- Migration 005: 農地テーブル

CREATE TABLE IF NOT EXISTS farm_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id),
    land_id UUID REFERENCES lands(id),
    step VARCHAR(20) NOT NULL DEFAULT 'EMPTY',
    crop_type VARCHAR(20),
    water_count INTEGER NOT NULL DEFAULT 0,
    planted_season VARCHAR(10),
    planted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (character_id)
);

-- アイテムテンプレート初期データ
INSERT INTO item_templates (name, category, base_price, weight, description) VALUES
  ('POTATO',   'CROP',      5,  1, 'ジャガイモ。主食として重宝される。'),
  ('WHEAT',    'CROP',      4,  1, '小麦。パンや醸造に使われる。'),
  ('CARROT',   'CROP',      6,  1, 'ニンジン。甘みがあり栄養豊富。'),
  ('CABBAGE',  'CROP',      5,  2, 'キャベツ。冬でも育つ丈夫な野菜。'),
  ('HERB',     'CROP',      15, 1, '薬草。治療や料理に使われる。'),
  ('BREAD',    'CONSUMABLE', 8, 1, 'パン。小麦から作られる基本食料。'),
  ('MEAT',     'CONSUMABLE', 20, 2, '肉。戦闘や狩りで手に入る。'),
  ('WATER',    'CONSUMABLE', 2,  1, '水。水源がない場所で必要になる。'),
  ('IRON_ORE', 'MATERIAL',  10, 3, '鉄鉱石。武器や道具の素材。'),
  ('WOOD',     'MATERIAL',   5, 3, '木材。建築や燃料に使われる。'),
  ('STONE',    'MATERIAL',   3, 3, '石材。建築に使われる。'),
  ('SWORD',    'WEAPON',   100, 5, '鉄の剣。基本的な武器。'),
  ('BOW',      'WEAPON',    80, 3, '弓。遠距離攻撃が可能。'),
  ('STAFF',    'WEAPON',    90, 3, '魔法の杖。魔法の威力を高める。'),
  ('ARMOR',    'ARMOR',    120, 8, '鉄の鎧。防御力を高める。'),
  ('SHIELD',   'ARMOR',     60, 4, '盾。攻撃を防ぐ。'),
  ('FUR_COAT', 'ARMOR',     50, 3, '毛皮の外套。防寒に優れる。'),
  ('SPELL_BOOK_FIRE', 'MAGIC_TOOL', 200, 1, '火球の魔法書。炎の魔法を習得できる。'),
  ('SPELL_BOOK_HEAL', 'MAGIC_TOOL', 180, 1, '治癒の魔法書。回復魔法を習得できる。'),
  ('FUEL',     'MATERIAL',   3, 2, '燃料。焚き火に使う。')
ON CONFLICT DO NOTHING;
