-- Migration: 0002_notification_tables.sql
-- Create user_devices and notification_logs tables for Notification Infrastructure

CREATE TABLE IF NOT EXISTS user_devices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    fcm_token TEXT NOT NULL UNIQUE,
    device_id TEXT,
    device_name TEXT,
    device_model TEXT,
    os_version TEXT,
    app_version TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_token ON user_devices(fcm_token);

CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY,
    recipient_id TEXT NOT NULL,
    notification_type TEXT,
    title TEXT,
    body TEXT,
    priority TEXT DEFAULT 'NORMAL',
    status TEXT DEFAULT 'PENDING',
    provider_type TEXT DEFAULT 'FCM',
    provider_message_id TEXT,
    error_message TEXT,
    retry_attempts INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivered_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON notification_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_status ON notification_logs(status);
