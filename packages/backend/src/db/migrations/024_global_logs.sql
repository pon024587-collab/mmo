-- Migration 024: グローバルシステムログ
CREATE TABLE IF NOT EXISTS global_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_global_logs_created_at ON global_logs(created_at DESC);
