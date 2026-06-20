-- PostgreSQL Schema for AI-Powered Email Management System
-- Phase 1: Core Tables

-- Users table for system authentication and user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'manager'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Emails table for storing and analyzing emails
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    external_id VARCHAR(500), -- Gmail/Outlook message ID
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- AI Analysis Fields
    ai_summary TEXT,
    category VARCHAR(50), -- 'business', 'personal', 'marketing', 'support'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
    sentiment_score INTEGER CHECK (sentiment_score >= -100 AND sentiment_score <= 100),
    urgency_score INTEGER CHECK (urgency_score >= 0 AND urgency_score <= 100),
    
    -- Email Metadata
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    has_attachments BOOLEAN DEFAULT false,
    
    -- Technical Fields
    email_provider VARCHAR(50), -- 'gmail', 'outlook', 'imap'
    thread_id VARCHAR(500),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_emails_user_id (user_id),
    INDEX idx_emails_received_at (received_at DESC),
    INDEX idx_emails_priority (priority),
    INDEX idx_emails_category (category),
    INDEX idx_emails_opportunity_score (opportunity_score DESC)
);

-- Opportunities table for tracking business opportunities identified in emails
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- 'partnership', 'sales', 'investment', 'collaboration'
    stage VARCHAR(50) DEFAULT 'identified', -- 'identified', 'contacted', 'negotiation', 'closed_won', 'closed_lost'
    
    -- Opportunity Metrics
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    estimated_value DECIMAL(12,2),
    expected_close_date DATE,
    
    -- Contact Information
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_name VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_opportunities_user_id (user_id),
    INDEX idx_opportunities_stage (stage),
    INDEX idx_opportunities_confidence_score (confidence_score DESC)
);

-- Tasks table for recommended actions from email analysis
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    
    -- Task Details
    due_date DATE,
    estimated_duration_minutes INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- AI Generated Fields
    is_ai_generated BOOLEAN DEFAULT true,
    ai_reasoning TEXT, -- Why AI recommended this task
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_priority (priority),
    INDEX idx_tasks_due_date (due_date)
);

-- Notifications table for system notifications and alerts
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email_id UUID REFERENCES emails(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'critical_email', 'opportunity', 'task_due', 'system'
    
    -- Notification Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- AI Analysis
    ai_priority_score INTEGER CHECK (ai_priority_score >= 0 AND ai_priority_score <= 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at DESC)
);

-- Email Categories table for AI classification training
CREATE TABLE email_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Models table for tracking different AI models used
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'classification', 'summarization', 'sentiment', 'opportunity'
    provider VARCHAR(50), -- 'openai', 'anthropic', 'bedrock', 'custom'
    
    -- Model Configuration
    is_active BOOLEAN DEFAULT true,
    accuracy_score DECIMAL(5,4), -- 0.0000 to 1.0000
    last_trained_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Analysis Log for tracking AI analysis history
CREATE TABLE email_analysis_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    ai_model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
    
    -- Analysis Results
    raw_analysis JSONB,
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_analysis_log_email_id (email_id),
    INDEX idx_analysis_log_created_at (created_at DESC)
);

-- Insert default email categories
INSERT INTO email_categories (name, description, color_code, is_default) VALUES
('Business', 'Business communications, partnerships, opportunities', '#3B82F6', true),
('Personal', 'Personal communications', '#10B981', true),
('Marketing', 'Marketing emails, newsletters, promotions', '#8B5CF6', true),
('Support', 'Support requests, technical issues', '#F59E0B', true),
('Finance', 'Financial communications, invoices, payments', '#EF4444', true),
('Legal', 'Legal documents, contracts, compliance', '#6B7280', true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for dashboard statistics
CREATE VIEW dashboard_stats AS
SELECT 
    COUNT(*) as total_emails,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_emails,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_emails,
    COUNT(CASE WHEN opportunity_score >= 70 THEN 1 END) as business_opportunities,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_emails_7d,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_emails
FROM emails;

-- Create view for email insights
CREATE VIEW email_insights AS
SELECT
    category,
    COUNT(*) as email_count,
    ROUND(AVG(opportunity_score), 2) as avg_opportunity_score,
    ROUND(AVG(sentiment_score), 2) as avg_sentiment_score,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical_count
FROM emails
GROUP BY category
ORDER BY email_count DESC;