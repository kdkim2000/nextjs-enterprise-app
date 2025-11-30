-- ==========================================
-- APP SETTINGS TABLE
-- Application configuration management
-- Key-Value based flexible settings storage
-- ==========================================

-- Drop table if exists
DROP TABLE IF EXISTS app_settings CASCADE;

-- Create app_settings table
CREATE TABLE app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    value_type VARCHAR(20) NOT NULL DEFAULT 'string',  -- string, number, boolean, json
    category VARCHAR(50) NOT NULL,                      -- basic, branding, localization, security, etc.
    is_ready BOOLEAN NOT NULL DEFAULT false,           -- Whether this setting is ready to be applied
    description_en TEXT,
    description_ko TEXT,
    description_zh TEXT,
    description_vi TEXT,
    display_order INTEGER DEFAULT 0,
    is_sensitive BOOLEAN DEFAULT false,                -- For passwords, API keys, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(50)
);

-- Create indexes
CREATE INDEX idx_app_settings_category ON app_settings(category);
CREATE INDEX idx_app_settings_is_ready ON app_settings(is_ready);
CREATE INDEX idx_app_settings_value_type ON app_settings(value_type);

-- Add comments
COMMENT ON TABLE app_settings IS 'Application settings with Key-Value storage and multi-language support';
COMMENT ON COLUMN app_settings.key IS 'Unique setting key (e.g., app_name, primary_color)';
COMMENT ON COLUMN app_settings.value IS 'Setting value stored as text';
COMMENT ON COLUMN app_settings.value_type IS 'Data type: string, number, boolean, json';
COMMENT ON COLUMN app_settings.category IS 'Setting category: basic, branding, localization, security, authentication, notification, file_upload, operations, feature_flags, organization';
COMMENT ON COLUMN app_settings.is_ready IS 'Whether this setting is implemented and ready to be applied';
COMMENT ON COLUMN app_settings.is_sensitive IS 'Whether this setting contains sensitive information (passwords, keys)';
