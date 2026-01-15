-- Inspection Service Database Schema
-- Checksheet Templates, Items, Inspections, Results, and Sync Queue

-- ==========================================
-- Checksheet Templates Table
-- ==========================================
CREATE TABLE IF NOT EXISTS checksheet_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for checksheet_templates
CREATE INDEX IF NOT EXISTS idx_checksheet_templates_code ON checksheet_templates(code);
CREATE INDEX IF NOT EXISTS idx_checksheet_templates_status ON checksheet_templates(status);
CREATE INDEX IF NOT EXISTS idx_checksheet_templates_category ON checksheet_templates(category);
CREATE INDEX IF NOT EXISTS idx_checksheet_templates_created_by ON checksheet_templates(created_by);

-- ==========================================
-- Checksheet Items Table
-- ==========================================
CREATE TABLE IF NOT EXISTS checksheet_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES checksheet_templates(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES checksheet_items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    item_code VARCHAR(50),
    item_name VARCHAR(200) NOT NULL,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('checkbox', 'text', 'number', 'select', 'photo', 'signature', 'date', 'time')),
    options JSONB,
    required BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for checksheet_items
CREATE INDEX IF NOT EXISTS idx_checksheet_items_template_id ON checksheet_items(template_id);
CREATE INDEX IF NOT EXISTS idx_checksheet_items_parent_id ON checksheet_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_checksheet_items_sort_order ON checksheet_items(template_id, sort_order);

-- ==========================================
-- Inspections Table
-- ==========================================
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES checksheet_templates(id) ON DELETE RESTRICT,
    inspection_code VARCHAR(50) UNIQUE NOT NULL,
    target_name VARCHAR(200),
    target_id VARCHAR(100),
    inspector_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    location VARCHAR(200),
    notes TEXT,
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
    client_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for inspections
CREATE INDEX IF NOT EXISTS idx_inspections_template_id ON inspections(template_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_sync_status ON inspections(sync_status);
CREATE INDEX IF NOT EXISTS idx_inspections_client_id ON inspections(client_id);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_inspection_code ON inspections(inspection_code);

-- ==========================================
-- Inspection Results Table
-- ==========================================
CREATE TABLE IF NOT EXISTS inspection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES checksheet_items(id) ON DELETE RESTRICT,
    value TEXT,
    value_type VARCHAR(30) DEFAULT 'text' CHECK (value_type IN ('text', 'number', 'boolean', 'json')),
    is_passed BOOLEAN,
    remarks TEXT,
    photo_urls JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    offline_created_at TIMESTAMP WITH TIME ZONE,
    sync_version INTEGER DEFAULT 1,
    UNIQUE(inspection_id, item_id)
);

-- Indexes for inspection_results
CREATE INDEX IF NOT EXISTS idx_inspection_results_inspection_id ON inspection_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_results_item_id ON inspection_results(item_id);
CREATE INDEX IF NOT EXISTS idx_inspection_results_recorded_at ON inspection_results(recorded_at);

-- ==========================================
-- Sync Queue Table
-- ==========================================
CREATE TABLE IF NOT EXISTS sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Indexes for sync_queue
CREATE INDEX IF NOT EXISTS idx_sync_queue_client_id ON sync_queue(client_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_sync_status ON sync_queue(sync_status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entity_type ON sync_queue(entity_type);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);

-- ==========================================
-- Trigger for updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to checksheet_templates
DROP TRIGGER IF EXISTS update_checksheet_templates_updated_at ON checksheet_templates;
CREATE TRIGGER update_checksheet_templates_updated_at
    BEFORE UPDATE ON checksheet_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to inspections
DROP TRIGGER IF EXISTS update_inspections_updated_at ON inspections;
CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Comments
-- ==========================================
COMMENT ON TABLE checksheet_templates IS '검사 체크시트 템플릿';
COMMENT ON TABLE checksheet_items IS '체크시트 항목 (검사 항목 정의)';
COMMENT ON TABLE inspections IS '검사 실시 기록';
COMMENT ON TABLE inspection_results IS '검사 결과 (각 항목별)';
COMMENT ON TABLE sync_queue IS '오프라인 동기화 큐';

COMMENT ON COLUMN checksheet_items.item_type IS 'checkbox: 체크박스, text: 텍스트, number: 숫자, select: 선택, photo: 사진, signature: 서명, date: 날짜, time: 시간';
COMMENT ON COLUMN inspections.sync_status IS 'synced: 동기화됨, pending: 대기중, conflict: 충돌';
COMMENT ON COLUMN inspection_results.value_type IS 'text: 문자열, number: 숫자, boolean: 불리언, json: JSON 객체';
