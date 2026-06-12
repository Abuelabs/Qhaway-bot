-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES Table (Caregivers / Administrators)
-- Extends the auth.users table in Supabase Auth
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    notifications JSONB DEFAULT '{"sos": true, "dailySummary": true, "sounds": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up in Supabase Auth
-- Note: This is an optional helper, but since we collect full_name and phone during Register,
-- we will insert into profiles directly from our Register React component. So this trigger is simple:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario'),
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. ELDERS Table (Monitored elderly profiles)
CREATE TABLE public.elders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    sex TEXT NOT NULL,
    blood_type TEXT DEFAULT 'No especificado',
    condition TEXT DEFAULT 'Sin condiciones registradas',
    conditions TEXT,
    allergies TEXT DEFAULT 'Ninguna registrada',
    has_insurance BOOLEAN DEFAULT false,
    insurance TEXT DEFAULT 'Sin seguro de salud',
    room TEXT DEFAULT 'Sin asignar',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    device_status TEXT DEFAULT 'Conectado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for elders
ALTER TABLE public.elders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers can view their own elders"
    ON public.elders FOR SELECT
    USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can insert their own elders"
    ON public.elders FOR INSERT
    WITH CHECK (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can update their own elders"
    ON public.elders FOR UPDATE
    USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can delete their own elders"
    ON public.elders FOR DELETE
    USING (auth.uid() = caregiver_id);


-- 3. ROUTINES Table
CREATE TABLE public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID REFERENCES public.elders(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    repeat BOOLEAN DEFAULT true,
    recurrence_rule JSONB DEFAULT '{"frequency": "daily", "interval": 1, "end": {"type": "never"}}'::jsonb,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    time TEXT NOT NULL, -- e.g. '08:30'
    status TEXT DEFAULT 'pending', -- 'completed', 'pending', 'missed'
    urgency TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    category TEXT DEFAULT 'general', -- 'medicina', 'ejercicio', 'alimentacion', 'social', 'general'
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage routines for their elders"
    ON public.routines FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.elders
            WHERE elders.id = routines.elder_id
            AND elders.caregiver_id = auth.uid()
        )
    );


-- 4. VITALS Table (Health metrics)
CREATE TABLE public.vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID REFERENCES public.elders(id) ON DELETE CASCADE NOT NULL,
    heart_rate INTEGER,
    blood_pressure TEXT,
    spo2 INTEGER,
    temperature NUMERIC(4,2),
    sleep_hours NUMERIC(4,2),
    steps INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for vitals
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage vitals for their elders"
    ON public.vitals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.elders
            WHERE elders.id = vitals.elder_id
            AND elders.caregiver_id = auth.uid()
        )
    );

-- Trigger to automatically create vitals row when a new elder is inserted
CREATE OR REPLACE FUNCTION public.handle_new_elder_vitals()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.vitals (elder_id, heart_rate, blood_pressure, spo2, temperature, sleep_hours, steps)
  VALUES (new.id, 72, '120/80', 98, 36.5, 7.0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_elder_created_vitals
  AFTER INSERT ON public.elders
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_elder_vitals();


-- 5. SOS_CONTACTS Table (Emergency contacts)
CREATE TABLE public.sos_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID REFERENCES public.elders(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relation TEXT,
    phone TEXT NOT NULL,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for SOS contacts
ALTER TABLE public.sos_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage SOS contacts for their elders"
    ON public.sos_contacts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.elders
            WHERE elders.id = sos_contacts.elder_id
            AND elders.caregiver_id = auth.uid()
        )
    );


-- 6. NOTIFICATIONS Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT DEFAULT 'info', -- 'alert', 'warning', 'success', 'info'
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = caregiver_id);


-- 7. ACTIVITY_LOGS Table (Robot logs)
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID REFERENCES public.elders(id) ON DELETE CASCADE NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'alert'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs for their elders"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.elders
            WHERE elders.id = activity_logs.elder_id
            AND elders.caregiver_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage activity logs for their elders"
    ON public.activity_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.elders
            WHERE elders.id = activity_logs.elder_id
            AND elders.caregiver_id = auth.uid()
        )
    );


-- 8. MESSAGES Table (Chat / messaging history)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caregiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender TEXT NOT NULL, -- 'caregiver', 'robot'
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their messaging history"
    ON public.messages FOR ALL
    USING (auth.uid() = caregiver_id);
