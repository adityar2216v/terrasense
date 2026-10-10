CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    air_result JSONB,
    water_result JSONB,
    waste_result JSONB,
    final_score INTEGER,
    final_risk_level TEXT,
    coordinator_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    dominant_risk_contributor TEXT,
    execution_status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying history by incident
CREATE INDEX IF NOT EXISTS idx_analyses_incident_id ON public.analyses(incident_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Assuming there is already an authenticated policy or anon policy, we can add a basic anon select/insert for development
CREATE POLICY "Allow public select on analyses" ON public.analyses
    FOR SELECT USING (true);
    
CREATE POLICY "Allow public insert on analyses" ON public.analyses
    FOR INSERT WITH CHECK (true);
