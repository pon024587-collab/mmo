-- Migration 017: スタックしたキャラクターの救済
UPDATE characters SET status = 'IMPRISONED' WHERE is_imprisoned = true AND status != 'IMPRISONED';
UPDATE characters SET status = 'IDLE' WHERE status = 'ACTIVE_ACTION' AND id NOT IN (SELECT character_id FROM action_queue WHERE status = 'ACTIVE') AND is_imprisoned = false;
