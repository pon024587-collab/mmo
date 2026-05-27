/**
 * 行動タイプ定義
 * 各行動の所要時間（現実分）を定義する
 */

export type ActionType =
  // 農業
  | 'FARM_PLOW'        // 畑を耕す (120分)
  | 'FARM_SOW'         // 種をまく (60分)
  | 'FARM_WATER'       // 水やり (30分)
  | 'FARM_HARVEST'     // 収穫 (60分)
  // 戦闘
  | 'COMBAT_MONSTER'   // 魔物と戦う (3〜30分)
  | 'COMBAT_PRACTICE'  // 素振り (30分)
  // 移動
  | 'MOVE'             // 移動 (30〜360分)
  // 生存
  | 'EAT'              // 食事 (15〜30分)
  | 'DRINK'            // 水を飲む (5分)
  | 'SLEEP'            // 睡眠 (360〜480分)
  | 'NAP'              // 仮眠 (60〜120分)
  | 'REST'             // 休息 (30分)
  | 'CAMPFIRE'         // 焚き火 (15分)
  // 採集
  | 'MINE'             // 採掘 (60〜180分)
  | 'CHOP_WOOD'        // 木を切る (60〜180分)
  | 'GATHER_HERBS'     // 薬草を摘む (30〜90分)
  | 'FISH'             // 釣り (60〜120分)
  // 社会
  | 'TALK_NPC'         // NPCと話す (15分)
  | 'TRADE_MARKET'     // 市場で売買 (30分)
  | 'PRAY'             // 神殿に参拝 (30分)
  | 'STUDY_MAGIC'      // 魔法を学ぶ (120〜480分)
  | 'MENTOR_TEACH'     // 指導する (60〜240分)
  | 'MENTOR_LEARN'     // 指導を受ける (60〜240分)
  // 建設・生産
  | 'BUILD_HOUSE'      // 住居を建てる (480分)
  | 'BUILD_BRIDGE'     // 橋を架ける (720分)
  | 'COOK'             // 料理をする (30〜240分)
  | 'SMITH'            // 鍛冶屋 (60〜240分)
  // 探索
  | 'DUNGEON_EXPLORE'  // ダンジョン探索 (15〜60分/フロア)
  // その他
  | 'WRITE_BOOK'       // 本を書く (120〜480分)
  | 'MAKE_MAP'         // 地図を作る (60〜240分)
  | 'PROPOSE'          // 求婚する (30分)
  | 'TREAT'            // 治療を受ける (60〜240分)

/** 行動の基本所要時間（分）- 全体的に半減済み */
export const ACTION_DURATION_MINUTES: Record<ActionType, number> = {
  FARM_PLOW:       60,   // 120→60
  FARM_SOW:        30,   // 60→30
  FARM_WATER:      15,   // 30→15
  FARM_HARVEST:    30,   // 60→30
  COMBAT_MONSTER:  8,    // 15→8（魔物強度で変動）
  COMBAT_PRACTICE: 15,   // 30→15
  MOVE:            15,   // 30→15（距離で変動）
  EAT:             10,   // 20→10
  DRINK:           3,    // 5→3
  SLEEP:           210,  // 420→210（3.5時間）
  NAP:             45,   // 90→45
  REST:            15,   // 30→15
  CAMPFIRE:        8,    // 15→8
  MINE:            60,   // 120→60
  CHOP_WOOD:       45,   // 90→45
  GATHER_HERBS:    30,   // 60→30
  FISH:            45,   // 90→45
  TALK_NPC:        8,    // 15→8
  TRADE_MARKET:    15,   // 30→15
  PRAY:            15,   // 30→15
  STUDY_MAGIC:     120,  // 240→120
  MENTOR_TEACH:    60,   // 120→60
  MENTOR_LEARN:    60,   // 120→60
  BUILD_HOUSE:     240,  // 480→240
  BUILD_BRIDGE:    360,  // 720→360
  COOK:            30,   // 60→30
  SMITH:           60,   // 120→60
  DUNGEON_EXPLORE: 15,   // 30→15
  WRITE_BOOK:      120,  // 240→120
  MAKE_MAP:        60,   // 120→60
  PROPOSE:         15,   // 30→15
  TREAT:           60,   // 120→60
}
