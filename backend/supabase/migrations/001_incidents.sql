CREATE TABLE IF NOT EXISTS public.incidents (
    incident_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    source_type TEXT NOT NULL,
    source_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on incidents" ON public.incidents
    FOR SELECT USING (true);
    
CREATE POLICY "Allow public insert on incidents" ON public.incidents
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Allow public update on incidents" ON public.incidents
    FOR UPDATE USING (true) WITH CHECK (true);
