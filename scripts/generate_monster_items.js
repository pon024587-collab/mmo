import fs from 'fs'

const MONSTERS = [
  { id: 'SLIME', name: 'スライム', power: 5, el: ['WATER','ICE'], t: ['RIVER','FOREST','PLAIN'] },
  { id: 'BAT', name: 'コウモリ', power: 8, el: ['WIND','DARK'], t: ['MOUNTAIN','FOREST'] },
  { id: 'GIANT_RAT', name: '大ネズミ', power: 8, el: ['EARTH','DARK'], t: ['PLAIN','FOREST','DESERT'] },
  { id: 'GOBLIN', name: 'ゴブリン', power: 10, el: ['EARTH','FIRE'], t: ['FOREST','MOUNTAIN'] },
  { id: 'SKELETON', name: 'スケルトン', power: 10, el: ['DARK','EARTH'], t: ['SNOWFIELD','DESERT'] },
  { id: 'ZOMBIE', name: 'ゾンビ', power: 10, el: ['DARK','WATER'], t: ['FOREST','RIVER'] },
  { id: 'POISON_SPIDER', name: '毒蜘蛛', power: 12, el: ['DARK','EARTH'], t: ['FOREST','MOUNTAIN'] },
  { id: 'KOBOLD', name: 'コボルト', power: 12, el: ['EARTH','WIND'], t: ['MOUNTAIN','PLAIN'] },
  { id: 'HOBGOBLIN', name: 'ホブゴブリン', power: 13, el: ['EARTH','FIRE','THUNDER'], t: ['FOREST','MOUNTAIN'] },
  { id: 'WOLF', name: '狼', power: 15, el: ['WIND','ICE'], t: ['SNOWFIELD','FOREST','PLAIN'] },

  { id: 'GREMLIN', name: 'グレムリン', power: 18, el: ['THUNDER','WIND'], t: ['MOUNTAIN','DESERT'] },
  { id: 'HARPY', name: 'ハーピー', power: 20, el: ['WIND','THUNDER'], t: ['MOUNTAIN','PLAIN'] },
  { id: 'BANDIT', name: '盗賊', power: 20, el: ['DARK','EARTH'], t: ['FOREST','DESERT','PLAIN'] },
  { id: 'LIZARDMAN', name: 'リザードマン', power: 22, el: ['WATER','EARTH'], t: ['RIVER','PLAIN'] },
  { id: 'MUMMY', name: 'ミイラ', power: 22, el: ['DARK','EARTH','FIRE'], t: ['DESERT'] },
  { id: 'ORC', name: 'オーク', power: 25, el: ['EARTH','FIRE'], t: ['MOUNTAIN','PLAIN'] },
  { id: 'GIANT_SNAKE', name: '大蛇', power: 25, el: ['WATER','DARK'], t: ['FOREST','RIVER'] },
  { id: 'HELLHOUND', name: '魔犬', power: 28, el: ['FIRE','DARK'], t: ['MOUNTAIN','DESERT'] },
  { id: 'UNDEAD', name: 'アンデッド', power: 30, el: ['DARK','ICE'], t: ['SNOWFIELD','FOREST'] },
  { id: 'ORC_WARRIOR', name: 'オーク戦士', power: 30, el: ['EARTH','FIRE'], t: ['MOUNTAIN','PLAIN'] },

  { id: 'DARK_ELF', name: 'ダークエルフ', power: 35, el: ['DARK','WIND','ICE'], t: ['FOREST','SNOWFIELD'] },
  { id: 'TROLL', name: 'トロル', power: 40, el: ['EARTH','WATER'], t: ['MOUNTAIN','RIVER'] },
  { id: 'ZOMBIE_KNIGHT', name: 'ゾンビナイト', power: 40, el: ['DARK','ICE'], t: ['SNOWFIELD','DESERT'] },
  { id: 'GARGOYLE', name: 'ガーゴイル', power: 42, el: ['EARTH','WIND'], t: ['MOUNTAIN'] },
  { id: 'GRIFFIN', name: 'グリフィン', power: 45, el: ['WIND','THUNDER','LIGHT'], t: ['MOUNTAIN','PLAIN'] },
  { id: 'OGRE', name: 'オーガ', power: 45, el: ['EARTH','FIRE'], t: ['MOUNTAIN','DESERT'] },
  { id: 'DARK_MAGE', name: '闇魔法使い', power: 45, el: ['DARK','FIRE','ICE'], t: ['FOREST','DESERT'] },
  { id: 'BASILISK', name: 'バジリスク', power: 48, el: ['EARTH','POISON','DARK'], t: ['DESERT','MOUNTAIN'] },
  { id: 'WEREWOLF', name: 'ウェアウルフ', power: 48, el: ['WIND','DARK','ICE'], t: ['FOREST','SNOWFIELD'] },
  { id: 'CYCLOPS', name: 'サイクロプス', power: 50, el: ['EARTH','THUNDER'], t: ['MOUNTAIN','DESERT'] },
  { id: 'VAMPIRE', name: 'ヴァンパイア', power: 50, el: ['DARK','ICE','WIND'], t: ['FOREST','SNOWFIELD'] },
  { id: 'DOPPELGANGER', name: 'ドッペルゲンガー', power: 52, el: ['DARK','LIGHT'], t: ['PLAIN','FOREST'] },
  { id: 'DARK_KNIGHT', name: '暗黒騎士', power: 60, el: ['DARK','FIRE','ICE'], t: ['MOUNTAIN','SNOWFIELD'] },

  { id: 'PHOENIX', name: 'フェニックス', power: 70, el: ['FIRE','LIGHT'], t: ['MOUNTAIN','DESERT'] },
  { id: 'LICH', name: 'リッチ', power: 80, el: ['DARK','ICE','EARTH'], t: ['SNOWFIELD','DESERT'] },
  { id: 'HYDRA', name: 'ヒュドラ', power: 75, el: ['WATER','DARK','POISON'], t: ['RIVER'] },
  { id: 'MINOTAUR', name: 'ミノタウロス', power: 70, el: ['EARTH','FIRE'], t: ['MOUNTAIN'] },
  { id: 'DRAGON', name: 'ドラゴン', power: 100, el: ['FIRE','WIND','EARTH'], t: ['MOUNTAIN','DESERT'] },
  { id: 'GORGON', name: 'ゴルゴン', power: 72, el: ['EARTH','DARK','WATER'], t: ['RIVER','MOUNTAIN'] },
  { id: 'WYVERN', name: 'ワイバーン', power: 85, el: ['WIND','THUNDER'], t: ['MOUNTAIN','PLAIN'] },
  { id: 'DEMON_MINION', name: '魔王の手下', power: 88, el: ['DARK','FIRE'], t: ['MOUNTAIN','SNOWFIELD','DESERT'] },
  { id: 'ABYSS_WALKER', name: '深淵の歩者', power: 90, el: ['DARK','ICE','WATER'], t: ['SNOWFIELD','RIVER'] },
  { id: 'TITAN', name: 'タイタン', power: 95, el: ['EARTH','THUNDER'], t: ['MOUNTAIN'] },

  { id: 'ANCIENT_DRAGON', name: '古竜', power: 150, el: ['LIGHT','DARK','FIRE'], t: ['MOUNTAIN'] },
  { id: 'DEMON_KING', name: '魔王', power: 200, el: ['DARK','FIRE','ICE'], t: ['DESERT','MOUNTAIN'] },
  { id: 'DEATH_GOD', name: '死神', power: 180, el: ['DARK','ICE'], t: ['SNOWFIELD'] },
  { id: 'FALLEN_ANGEL', name: '堕天使', power: 170, el: ['LIGHT','DARK','WIND'], t: ['MOUNTAIN','PLAIN'] },
  { id: 'CHAOS_GOD', name: '混沌の神', power: 250, el: ['DARK','LIGHT','FIRE'], t: ['MOUNTAIN','DESERT','SNOWFIELD'] },
]

let sql = `-- Migration 013: 全魔物の素材と装備一式
`

for (const m of MONSTERS) {
  // 素材
  const c1 = `${m.name}の皮`
  const c2 = `${m.name}の骨`
  const r1 = `${m.name}の鋭牙`
  const ur1 = `${m.name}の魔核`

  sql += `
-- ${m.name} のアイテム
INSERT INTO item_templates (id, name, category, description, base_price, weight) VALUES
  (gen_random_uuid(), '${c1}', 'MATERIAL', '${m.name}から剥ぎ取った一般的な皮。', ${m.power * 2}, 1),
  (gen_random_uuid(), '${c2}', 'MATERIAL', '${m.name}から剥ぎ取った一般的な骨。', ${m.power * 2}, 1),
  (gen_random_uuid(), '${r1}', 'MATERIAL', '${m.name}の稀少な部位。', ${m.power * 20}, 1),
  (gen_random_uuid(), '${ur1}', 'MATERIAL', '${m.name}の体内にある幻の魔核。', ${m.power * 200}, 1);
`

  // 装備
  const wp = `${m.name}の武器`
  const ar = `${m.name}の防具`
  const ac = `${m.name}の装飾`
  
  const atk = Math.floor(m.power * 1.5)
  const def = Math.floor(m.power * 1.2)
  const atkEl = m.el[0]
  const defEl = m.el[1] || m.el[0]

  sql += `
INSERT INTO item_templates (id, name, category, weapon_category, description, base_price, weight, sub_parameters) VALUES
  (gen_random_uuid(), '${wp}', 'WEAPON', 'WEAPON_SWORD', '${m.name}の素材で作られた強力な武器。', ${m.power * 50}, 5, '{"attack": ${atk}, "elementalAttack": "${atkEl}", "elementalAttackValue": ${Math.floor(m.power * 0.5)}}'::jsonb),
  (gen_random_uuid(), '${ar}', 'ARMOR', NULL, '${m.name}の素材で作られた堅牢な防具。', ${m.power * 50}, 8, '{"defense": ${def}, "elementalResistance": "${defEl}", "elementalResistanceValue": ${Math.floor(m.power * 0.5)}}'::jsonb),
  (gen_random_uuid(), '${ac}', 'ACCESSORY', NULL, '${m.name}の魔核を用いた装飾品。', ${m.power * 80}, 1, '{"attack": ${Math.floor(atk/3)}, "defense": ${Math.floor(def/3)}, "elementalAttack": "${atkEl}", "elementalAttackValue": ${Math.floor(m.power * 0.2)}, "elementalResistance": "${defEl}", "elementalResistanceValue": ${Math.floor(m.power * 0.2)}}'::jsonb);
`

  // レシピ
  sql += `
INSERT INTO recipes (item_template_id, requirements) VALUES
  ((SELECT id FROM item_templates WHERE name = '${wp}' LIMIT 1), '{"${c1}": 5, "${c2}": 3, "${r1}": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '${ar}' LIMIT 1), '{"${c1}": 8, "${r1}": 1}'::jsonb),
  ((SELECT id FROM item_templates WHERE name = '${ac}' LIMIT 1), '{"${c2}": 3, "${r1}": 2, "${ur1}": 1}'::jsonb);
`
}

fs.writeFileSync('d:/mmo/packages/backend/src/db/migrations/013_monster_equipment_overhaul.sql', sql)
console.log('Migration generated.')
