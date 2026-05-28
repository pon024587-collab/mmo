/**
 * レイドボスシステム
 * - レイドボス管理
 * - ダメージ計算（物理/魔法防御、貫通、クリティカル）
 * - ギルド合計ダメージ競争
 * - 閾値ごとの報酬配布（メールボックス経由）
 * - レイドガチャ
 */
import { sql } from '../db/client.js'
import { addGlobalLog } from './logService.js'

export type RaidElement = 'FIRE' | 'WATER' | 'WIND' | 'EARTH' | 'THUNDER' | 'ICE' | 'LIGHT' | 'DARK' | 'POISON'

const ELEMENT_NAMES: Record<string, string> = {
  FIRE: '炎', WATER: '水', WIND: '風', EARTH: '土',
  THUNDER: '雷', ICE: '氷', LIGHT: '光', DARK: '闇', POISON: '毒'
}

// 報酬閾値定義（ダメージ合計→{ガチャ券, ゴールド, パン}）
const RAID_MILESTONES: { dmg: number; tickets: number; gold: number; bread: number; label: string }[] = [
  { dmg:      100, tickets: 0, gold:    0, bread: 2, label: '参加報酬' },
  { dmg:     1000, tickets: 0, gold:  100, bread: 0, label: '勇者の証' },
  { dmg:    10000, tickets: 1, gold:    0, bread: 0, label: '討伐の功績' },
  { dmg:   100000, tickets: 5, gold:    0, bread: 0, label: '戦士の誉れ' },
  { dmg:   300000, tickets: 10, gold:   0, bread: 0, label: '英雄の証' },
  { dmg:   500000, tickets: 20, gold:   0, bread: 0, label: '伝説の戦士' },
  { dmg:  1000000, tickets: 30, gold:   0, bread: 0, label: 'レイド制覇者' },
]

/** レイドボスを新規スポーン */
export async function spawnRaidBoss(
  name: string,
  element: RaidElement,
  maxHp: bigint,
  physDef: number,
  magDef: number,
  durationHours: number = 72
): Promise<{ success: boolean; raidId?: string }> {
  // 既存アクティブなボスを終了
  await sql`UPDATE raid_bosses SET is_active = false WHERE is_active = true`

  const maxHpNum = Number(maxHp)
  const result = await sql<{ id: string }[]>`
    INSERT INTO raid_bosses (name, element, max_hp, current_hp, phys_def, mag_def, ends_at)
    VALUES (${name}, ${element}, ${maxHpNum}, ${maxHpNum}, ${physDef}, ${magDef}, NOW() + INTERVAL '${sql.unsafe(String(durationHours))} hours')
    RETURNING id
  `
  const raidId = result[0]?.id
  if (!raidId) return { success: false }

  await addGlobalLog(
    `🐲 強大なレイドボス【${name}】(${ELEMENT_NAMES[element] ?? element}属性) が現れた！ギルドの力を合わせて倒せ！`,
    'RAID'
  )
  return { success: true, raidId }
}

/** アクティブなレイドボスを取得 */
export async function getActiveRaidBoss() {
  const boss = await sql<{
    id: string; name: string; element: string
    maxHp: bigint; currentHp: bigint; physDef: number; magDef: number
    endsAt: Date
  }[]>`
    SELECT id, name, element, max_hp, current_hp, phys_def, mag_def, ends_at
    FROM raid_bosses WHERE is_active = true AND ends_at > NOW() LIMIT 1
  `
  if (!boss[0]) return null
  return boss[0]
}

/** ギルドごとのダメージランキング */
export async function getRaidGuildRanking(raidId: string) {
  const rows = await sql<{ guildId: string; guildName: string; totalDamage: bigint }[]>`
    SELECT rdl.guild_id, g.name as guild_name, SUM(rdl.damage) as total_damage
    FROM raid_damage_logs rdl
    JOIN guilds g ON rdl.guild_id = g.id
    WHERE rdl.raid_id = ${raidId} AND rdl.guild_id IS NOT NULL
    GROUP BY rdl.guild_id, g.name
    ORDER BY total_damage DESC
    LIMIT 10
  `
  return rows
}

/** プレイヤーのレイドボスへのダメージ（本格戦闘計算） */
export async function attackRaidBoss(
  characterId: string,
  raidId: string
): Promise<{ success: boolean; message?: string; damage?: number }> {
  const boss = await sql<{
    id: string; name: string; element: string; currentHp: bigint; physDef: number; magDef: number; endsAt: Date
  }[]>`
    SELECT id, name, element, current_hp, phys_def, mag_def, ends_at
    FROM raid_bosses WHERE id = ${raidId} AND is_active = true LIMIT 1
  `
  if (!boss[0]) return { success: false, message: 'このレイドボスはすでに倒されたか存在しません。' }
  if (new Date() > boss[0].endsAt) return { success: false, message: 'このレイドボスの討伐期限が切れました。' }
  if (Number(boss[0].currentHp) <= 0) return { success: false, message: 'このレイドボスはすでに倒されています。' }

  // プレイヤーステータス取得
  const char = await sql<{
    level: number; fatigueInternal: number; physPenetration: number; magPenetration: number; critRate: number
    equippedWeaponId: string | null; equippedArmorId: string | null; guildId: string | null
  }[]>`
    SELECT c.level, c.fatigue_internal, c.phys_penetration, c.mag_penetration, c.crit_rate,
           c.equipped_weapon_id, c.equipped_armor_id,
           gm.guild_id
    FROM characters c
    LEFT JOIN guild_memberships gm ON c.id = gm.character_id
    WHERE c.id = ${characterId} LIMIT 1
  `
  if (!char[0]) return { success: false, message: 'キャラクターが見つかりません。' }

  const fatigue = Math.max(0, Math.min(100, char[0].fatigueInternal))
  const fatigueMultiplier = 1.0 - (fatigue * 0.5 / 100)

  // 基礎攻撃力
  const baseAtk = char[0].level * 20 + Math.floor(Math.pow(char[0].level, 1.5) * 5)
  let physAtk = Math.floor(baseAtk * fatigueMultiplier)
  let magAtk = 0
  let weaponElement = ''
  let weaponElementValue = 0
  let critBonus = 0

  // 武器ステータス
  if (char[0].equippedWeaponId) {
    const w = await sql<{ attackPower: number; magicPower: number; properties: any; metadata: any }[]>`
      SELECT it.attack_power, it.magic_power, it.properties, i.metadata
      FROM items i JOIN item_templates it ON i.item_template_id = it.id
      WHERE i.id = ${char[0].equippedWeaponId}
    `
    if (w[0]) {
      physAtk += Math.floor((w[0].attackPower || 0) * fatigueMultiplier)
      magAtk += Math.floor((w[0].magicPower || 0) * fatigueMultiplier)
      weaponElement = w[0].properties?.elementalAttack || ''
      weaponElementValue = w[0].properties?.elementalAttackValue || 0

      const enhance = w[0].metadata?.enhance || 0
      physAtk += Math.floor(Math.pow(enhance, 2) * 15)
      magAtk += Math.floor(Math.pow(enhance, 2) * 15)
      if (weaponElement) weaponElementValue += enhance * 5

      const substats = w[0].metadata?.substats || []
      for (const s of substats) {
        if (s.type === 'ATK') physAtk += s.value
        if (s.type === 'MAG') magAtk += s.value
        if (s.type === 'CRIT') critBonus += s.value
      }
      const crystals = w[0].metadata?.crystals || []
      for (const c of crystals) {
        if (c.ATK) physAtk += c.ATK
        if (c.MP) magAtk += c.MP
        if (c.ATK_PERCENT) physAtk = Math.floor(physAtk * (1 + c.ATK_PERCENT / 100))
      }
    }
  }

  // 貫通率（0〜100%）でボスの防御を無視する割合を計算
  const physPenPct = Math.min(80, char[0].physPenetration) / 100
  const magPenPct = Math.min(80, char[0].magPenetration) / 100

  // 有効防御 = ボス防御 × (1 - 貫通率)
  const effectivePhysDef = Math.floor(boss[0].physDef * (1 - physPenPct))
  const effectiveMagDef = Math.floor(boss[0].magDef * (1 - magPenPct))

  // ダメージ計算（防御値との差分、最低1）
  let physDmg = Math.max(1, physAtk - effectivePhysDef)
  let magDmg = Math.max(1, magAtk - effectiveMagDef)

  // 属性一致ボーナス
  if (weaponElement === boss[0].element && weaponElementValue > 0) {
    const bonus = 1.0 + weaponElementValue / 100
    physDmg = Math.floor(physDmg * bonus)
    magDmg = Math.floor(magDmg * bonus)
  }

  // クリティカル判定（クリティカル率% の確率で2倍ダメージ）
  const critRateTotal = Math.min(60, char[0].critRate + critBonus)
  const isCrit = Math.random() * 100 < critRateTotal
  if (isCrit) {
    physDmg = Math.floor(physDmg * 2)
    magDmg = Math.floor(magDmg * 2)
  }

  const totalDamage = physDmg + magDmg

  // ダメージをDBに記録してボスHPを削る
  await sql.begin(async (tx) => {
    await tx`
      INSERT INTO raid_damage_logs (raid_id, character_id, guild_id, damage)
      VALUES (${raidId}, ${characterId}, ${char[0]!.guildId ?? null}, ${totalDamage})
    `
    await tx`
      UPDATE raid_bosses SET current_hp = GREATEST(0, current_hp - ${totalDamage})
      WHERE id = ${raidId}
    `
  })

  // ギルド貢献度を更新
  if (char[0].guildId) {
    await sql`
      INSERT INTO guild_contributions (guild_id, character_id, raid_damage_total)
      VALUES (${char[0].guildId}, ${characterId}, ${totalDamage})
      ON CONFLICT (guild_id, character_id)
      DO UPDATE SET raid_damage_total = guild_contributions.raid_damage_total + ${totalDamage},
                    updated_at = NOW()
    `
  }

  // ボスHPを最新確認
  const updatedBoss = await sql<{ currentHp: bigint }[]>`
    SELECT current_hp FROM raid_bosses WHERE id = ${raidId}
  `
  if (updatedBoss[0] && Number(updatedBoss[0].currentHp) <= 0) {
    await sql`UPDATE raid_bosses SET is_active = false WHERE id = ${raidId}`
    await addGlobalLog(`⚔️ レイドボス【${boss[0].name}】が討伐された！`, 'RAID')
  }

  // ギルドの累計ダメージで閾値報酬を確認・配布
  if (char[0].guildId) {
    await checkAndGrantMilestones(raidId, char[0].guildId, boss[0].name, boss[0].element)
  }

  const critMsg = isCrit ? '💥クリティカル！' : ''
  return {
    success: true,
    damage: totalDamage,
    message: `${critMsg} 【${boss[0].name}】に ${totalDamage} ダメージ！(物理:${physDmg} 魔法:${magDmg})`
  }
}

/** ギルドの閾値ダメージ達成チェックと報酬配布 */
async function checkAndGrantMilestones(raidId: string, guildId: string, bossName: string, bossElement: string) {
  // ギルドの累計ダメージ
  const totalRow = await sql<{ total: bigint }[]>`
    SELECT COALESCE(SUM(damage), 0) as total FROM raid_damage_logs
    WHERE raid_id = ${raidId} AND guild_id = ${guildId}
  `
  const guildTotal = Number(totalRow[0]?.total ?? 0)

  // ギルドメンバー取得
  const members = await sql<{ characterId: string }[]>`
    SELECT character_id FROM guild_memberships WHERE guild_id = ${guildId}
  `

  for (const milestone of RAID_MILESTONES) {
    if (guildTotal < milestone.dmg) continue

    // 達成済みチェック
    const already = await sql<{ id: string }[]>`
      SELECT id FROM raid_milestone_claims
      WHERE raid_id = ${raidId} AND guild_id = ${guildId} AND milestone = ${milestone.dmg}
    `
    if (already[0]) continue

    // 未達成→達成記録
    await sql`
      INSERT INTO raid_milestone_claims (raid_id, guild_id, milestone)
      VALUES (${raidId}, ${guildId}, ${milestone.dmg})
      ON CONFLICT DO NOTHING
    `

    // ギルドメンバー全員にメール送付
    for (const m of members) {
      const rewardItems: { name: string; qty: number }[] = []
      if (milestone.bread > 0) rewardItems.push({ name: 'パン', qty: milestone.bread })
      if (milestone.tickets > 0) rewardItems.push({ name: 'レイドガチャ券', qty: milestone.tickets })

      const body = `ギルドが【${bossName}】戦で合計 ${milestone.dmg.toLocaleString()} ダメージを達成しました！\n${milestone.label} の報酬をお届けします！`
      await sql`
        INSERT INTO player_mails (character_id, sender, subject, body, reward_gold, reward_items)
        VALUES (
          ${m.characterId},
          'レイドシステム',
          ${'🏆 ' + milestone.label + ' 達成報酬'},
          ${body},
          ${milestone.gold},
          ${JSON.stringify(rewardItems)}
        )
      `

      // ガチャ券をguild_contributionsに追加
      if (milestone.tickets > 0) {
        await sql`
          INSERT INTO guild_contributions (guild_id, character_id, raid_gacha_tickets)
          VALUES (${guildId}, ${m.characterId}, ${milestone.tickets})
          ON CONFLICT (guild_id, character_id)
          DO UPDATE SET raid_gacha_tickets = guild_contributions.raid_gacha_tickets + ${milestone.tickets},
                        updated_at = NOW()
        `
      }
    }

    await addGlobalLog(
      `🏆 ギルドがレイドボス【${bossName}】へ ${milestone.dmg.toLocaleString()} ダメージ達成！【${milestone.label}】報酬をゲット！`,
      'RAID'
    )
  }
}

/** レイドガチャを引く（1枚消費） */
export async function drawRaidGacha(
  characterId: string,
  guildId: string,
  bossElement: string
): Promise<{ success: boolean; message?: string; result?: string }> {
  const contrib = await sql<{ raidGachaTickets: number }[]>`
    SELECT raid_gacha_tickets FROM guild_contributions
    WHERE character_id = ${characterId} AND guild_id = ${guildId} LIMIT 1
  `
  const tickets = contrib[0]?.raidGachaTickets ?? 0
  if (tickets < 1) return { success: false, message: 'レイドガチャ券が足りません。' }

  // 券を1枚消費
  await sql`
    UPDATE guild_contributions SET raid_gacha_tickets = raid_gacha_tickets - 1
    WHERE character_id = ${characterId} AND guild_id = ${guildId}
  `

  // 抽選
  const roll = Math.random() * 100
  let resultText = ''

  if (roll < 0.1) {
    // 0.1%: レイドボス専用属性クリスタル
    const elName = ELEMENT_NAMES[bossElement] ?? bossElement
    const crystal = await sql<{ id: string }[]>`
      SELECT id FROM item_templates WHERE category = 'CRYSTAL' LIMIT 1
    `
    if (crystal[0]) {
      const meta = { bonus: { [`${bossElement}_PENETRATION`]: 15 }, element: bossElement, raidDrop: true }
      await sql`
        INSERT INTO items (owner_character_id, item_template_id, metadata)
        VALUES (${characterId}, ${crystal[0].id}, ${meta as any})
      `
    }
    resultText = `✨✨ 超激レア！【${elName}貫通クリスタル】を獲得！（貫通+15%）`
    await addGlobalLog(`🎊 ${resultText}`, 'RAID')
  } else if (roll < 1.0) {
    // 0.9%: Tier3クリスタル
    const tier3BonusTypes = ['ATK', 'DEF', 'MAG', 'HP', 'ATK_PERCENT', 'DEF_PERCENT']
    const t = tier3BonusTypes[Math.floor(Math.random() * tier3BonusTypes.length)]!
    const val = Math.floor(Math.random() * 20) + 20 // 20〜40
    const crystal = await sql<{ id: string }[]>`SELECT id FROM item_templates WHERE category = 'CRYSTAL' LIMIT 1`
    if (crystal[0]) {
      await sql`
        INSERT INTO items (owner_character_id, item_template_id, metadata)
        VALUES (${characterId}, ${crystal[0].id}, ${{ bonus: { [t]: val } } as any})
      `
    }
    resultText = `⭐⭐ Tier3クリスタル【${t}+${val}】を獲得！`
  } else if (roll < 5.0) {
    // 4%: 1000G
    await sql`UPDATE characters SET gold = gold + 1000 WHERE id = ${characterId}`
    resultText = `💰 1,000G を獲得！`
  } else if (roll < 10.0) {
    // 5%: Tier2クリスタル
    const tier2BonusTypes = ['ATK', 'DEF', 'MAG', 'HP']
    const t = tier2BonusTypes[Math.floor(Math.random() * tier2BonusTypes.length)]!
    const val = Math.floor(Math.random() * 10) + 8 // 8〜18
    const crystal = await sql<{ id: string }[]>`SELECT id FROM item_templates WHERE category = 'CRYSTAL' LIMIT 1`
    if (crystal[0]) {
      await sql`
        INSERT INTO items (owner_character_id, item_template_id, metadata)
        VALUES (${characterId}, ${crystal[0].id}, ${{ bonus: { [t]: val } } as any})
      `
    }
    resultText = `⭐ Tier2クリスタル【${t}+${val}】を獲得！`
  } else {
    // 90%: パン
    const bread = await sql<{ id: string }[]>`SELECT id FROM item_templates WHERE name = 'パン' LIMIT 1`
    if (bread[0]) {
      const existing = await sql<{ id: string; quantity: number }[]>`
        SELECT id, quantity FROM items WHERE owner_character_id = ${characterId} AND item_template_id = ${bread[0].id} LIMIT 1
      `
      if (existing[0]) {
        await sql`UPDATE items SET quantity = quantity + 1 WHERE id = ${existing[0].id}`
      } else {
        await sql`INSERT INTO items (owner_character_id, item_template_id, quantity) VALUES (${characterId}, ${bread[0].id}, 1)`
      }
    }
    resultText = '🍞 パンを獲得…（また今度がんばろう）'
  }

  return { success: true, result: resultText }
}

/** メールボックスの報酬を受け取る */
export async function claimMailReward(characterId: string, mailId: string) {
  const mail = await sql<{
    id: string; rewardGold: number; rewardItems: { name: string; qty: number }[]; isClaimed: boolean
  }[]>`
    SELECT id, reward_gold, reward_items, is_claimed FROM player_mails
    WHERE id = ${mailId} AND character_id = ${characterId} LIMIT 1
  `
  if (!mail[0]) return { success: false, message: 'メールが見つかりません。' }
  if (mail[0].isClaimed) return { success: false, message: 'すでに受け取り済みです。' }

  await sql.begin(async (tx) => {
    await tx`UPDATE player_mails SET is_claimed = true, is_read = true WHERE id = ${mailId}`
    if (mail[0]!.rewardGold > 0) {
      await tx`UPDATE characters SET gold = gold + ${mail[0]!.rewardGold} WHERE id = ${characterId}`
    }
    for (const item of mail[0]!.rewardItems) {
      if (item.name === 'レイドガチャ券') continue // 既にguild_contributionsに記録済み
      const tmpl = await tx<{ id: string }[]>`SELECT id FROM item_templates WHERE name = ${item.name} LIMIT 1`
      if (tmpl[0]) {
        const existing = await tx<{ id: string }[]>`
          SELECT id FROM items WHERE owner_character_id = ${characterId} AND item_template_id = ${tmpl[0].id} LIMIT 1
        `
        if (existing[0]) {
          await tx`UPDATE items SET quantity = quantity + ${item.qty} WHERE id = ${existing[0].id}`
        } else {
          await tx`INSERT INTO items (owner_character_id, item_template_id, quantity) VALUES (${characterId}, ${tmpl[0].id}, ${item.qty})`
        }
      }
    }
  })

  return { success: true, message: `報酬を受け取りました！` }
}

/** プレイヤーのメールボックスを取得 */
export async function getMailbox(characterId: string) {
  return sql<{
    id: string; sender: string; subject: string; body: string
    rewardGold: number; rewardItems: any; isRead: boolean; isClaimed: boolean; createdAt: Date
  }[]>`
    SELECT id, sender, subject, body, reward_gold, reward_items, is_read, is_claimed, created_at
    FROM player_mails WHERE character_id = ${characterId}
    ORDER BY created_at DESC LIMIT 50
  `
}

/** ギルドメンバーの貢献度一覧 */
export async function getGuildContributions(guildId: string) {
  return sql<{ characterName: string; raidDamageTotal: bigint; raidGachaTickets: number }[]>`
    SELECT c.name as character_name, gc.raid_damage_total, gc.raid_gacha_tickets
    FROM guild_contributions gc
    JOIN characters c ON gc.character_id = c.id
    WHERE gc.guild_id = ${guildId}
    ORDER BY gc.raid_damage_total DESC
  `
}
