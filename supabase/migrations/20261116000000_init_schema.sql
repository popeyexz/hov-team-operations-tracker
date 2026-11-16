-- HOV Team Operations & Personal Work Tracker Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('founder', 'member')),
    lead_title TEXT DEFAULT 'Team Member',
    email TEXT DEFAULT '',
    avatar_color TEXT DEFAULT '#3b82f6',
    avatar_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ventures Table
CREATE TABLE IF NOT EXISTS public.ventures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    code TEXT NOT NULL,
    lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    lead_title TEXT DEFAULT 'Venture Lead',
    description TEXT DEFAULT '',
    health TEXT DEFAULT 'green' CHECK (health IN ('green', 'amber', 'red')),
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Objectives Table
CREATE TABLE IF NOT EXISTS public.objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
    sl_no INT NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'no_krs' CHECK (status IN ('no_krs', 'pending', 'on_hold', 'blocker', 'completed', 'dropped')),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    comments TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Key Results Table
CREATE TABLE IF NOT EXISTS public.key_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
    venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
    kr_code TEXT NOT NULL,
    title TEXT NOT NULL,
    target_measure TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'on_hold', 'blocker', 'completed', 'dropped')),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    comments TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Action Items Table
CREATE TABLE IF NOT EXISTS public.action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
    key_result_id UUID REFERENCES public.key_results(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    date DATE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted_for_review', 'needs_work', 'completed', 'on_hold', 'blocker', 'dropped')),
    is_member_completed BOOLEAN DEFAULT false,
    is_founder_confirmed BOOLEAN DEFAULT false,
    outcome_achieved TEXT DEFAULT '',
    is_planned BOOLEAN DEFAULT false,
    comments TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Venture Documents Table
CREATE TABLE IF NOT EXISTS public.venture_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venture_id UUID NOT NULL REFERENCES public.ventures(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT '',
    file_size BIGINT DEFAULT 0,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Task Activity Log Table (Threaded Feedback & Auditing)
CREATE TABLE IF NOT EXISTS public.task_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID NOT NULL REFERENCES public.action_items(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT UNIQUE NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_item_id UUID REFERENCES public.action_items(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable Row Level Security for open team collaboration or enable with public access policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venture_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Create open access policies for internal team operations
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public full access on profiles" ON public.profiles;
    CREATE POLICY "Public full access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on ventures" ON public.ventures;
    CREATE POLICY "Public full access on ventures" ON public.ventures FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on objectives" ON public.objectives;
    CREATE POLICY "Public full access on objectives" ON public.objectives FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on key_results" ON public.key_results;
    CREATE POLICY "Public full access on key_results" ON public.key_results FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on action_items" ON public.action_items;
    CREATE POLICY "Public full access on action_items" ON public.action_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on venture_documents" ON public.venture_documents;
    CREATE POLICY "Public full access on venture_documents" ON public.venture_documents FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on task_activity_log" ON public.task_activity_log;
    CREATE POLICY "Public full access on task_activity_log" ON public.task_activity_log FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on push_subscriptions" ON public.push_subscriptions;
    CREATE POLICY "Public full access on push_subscriptions" ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on in_app_notifications" ON public.in_app_notifications;
    CREATE POLICY "Public full access on in_app_notifications" ON public.in_app_notifications FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Create Storage bucket for venture documents if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('venture-documents', 'venture-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for venture-documents
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'venture-documents') WITH CHECK (bucket_id = 'venture-documents');
