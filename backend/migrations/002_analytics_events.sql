-- GUMÜÇ ROYAL — migration analytics_events (PostgreSQL)
-- Exécuter si Alembic 002 n'a pas été appliqué (ex. déploiement manuel EasyPanel)
-- Prérequis : extension pgcrypto pour gen_random_uuid() (souvent déjà activée)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(30) NOT NULL,
    path VARCHAR(500) NOT NULL,
    product_slug VARCHAR(120),
    client_ip VARCHAR(45),
    country_code VARCHAR(2),
    user_agent TEXT,
    is_counted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_analytics_events_event_type ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS ix_analytics_events_product_slug ON analytics_events (product_slug);
CREATE INDEX IF NOT EXISTS ix_analytics_events_country_code ON analytics_events (country_code);
CREATE INDEX IF NOT EXISTS ix_analytics_events_is_counted ON analytics_events (is_counted);
CREATE INDEX IF NOT EXISTS ix_analytics_events_created_at ON analytics_events (created_at);
