-- Migration 021: 既存アイテムのスタック（おまとめ）処理
-- 同一キャラクター（またはハウジング）内で、メタデータ・耐久度などの特殊状態がない同種アイテムを合算し、重複レコードを削除します。

-- 1. まとめる対象の合計個数を計算し、残すレコード（MIN(id::text)::uuid）のquantityをアップデート
WITH stacked AS (
    SELECT 
        owner_character_id, 
        owner_housing_id, 
        item_template_id, 
        SUM(quantity)::integer as total_quantity, 
        MIN(id::text)::uuid as keep_id
    FROM items
    WHERE metadata = '{}'::jsonb AND durability IS NULL AND quality_internal = 50
    GROUP BY owner_character_id, owner_housing_id, item_template_id
    HAVING COUNT(id) > 1
)
UPDATE items
SET quantity = stacked.total_quantity
FROM stacked
WHERE items.id = stacked.keep_id;

-- 2. 合算し終わった後、残すレコード（MIN(id::text)::uuid）以外の重複レコードを削除
WITH stacked AS (
    SELECT 
        owner_character_id, 
        owner_housing_id, 
        item_template_id, 
        MIN(id::text)::uuid as keep_id
    FROM items
    WHERE metadata = '{}'::jsonb AND durability IS NULL AND quality_internal = 50
    GROUP BY owner_character_id, owner_housing_id, item_template_id
    HAVING COUNT(id) > 1
)
DELETE FROM items
USING stacked
WHERE items.metadata = '{}'::jsonb 
  AND items.durability IS NULL 
  AND items.quality_internal = 50
  AND items.item_template_id = stacked.item_template_id
  AND items.owner_character_id IS NOT DISTINCT FROM stacked.owner_character_id
  AND items.owner_housing_id IS NOT DISTINCT FROM stacked.owner_housing_id
  AND items.id != stacked.keep_id;
