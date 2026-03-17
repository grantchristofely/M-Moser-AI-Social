-- Migrations for storing platforms (tools), roles, ecosystems, and use cases dynamically.

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  order_idx integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.platforms (
  id text PRIMARY KEY, -- using the string IDs like 'chatgpt' to match existing code
  name text NOT NULL,
  avatar text,
  mental_model text,
  best_for text,
  think_of_it_as text,
  where_it_fits_best text[],
  caveat text,
  order_idx integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ecosystems (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id text REFERENCES public.platforms(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_idx integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ecosystem_features (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ecosystem_id uuid REFERENCES public.ecosystems(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  order_idx integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.use_cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name text REFERENCES public.roles(name) ON DELETE CASCADE,
  platform_id text REFERENCES public.platforms(id) ON DELETE CASCADE,
  headline text NOT NULL,
  description text NOT NULL,
  order_idx integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for these tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;

-- Allow public read access to these tables
CREATE POLICY "Allow public read access to roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Allow public read access to platforms" ON public.platforms FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ecosystems" ON public.ecosystems FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ecosystem_features" ON public.ecosystem_features FOR SELECT USING (true);
CREATE POLICY "Allow public read access to use_cases" ON public.use_cases FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (or restrict to admins if needed, but keeping it open to auth for now based on current app style, or we can restrict it later. Actually, better yet: only allow authenticated users to modify).
CREATE POLICY "Allow authenticated full access to roles" ON public.roles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated full access to platforms" ON public.platforms FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated full access to ecosystems" ON public.ecosystems FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated full access to ecosystem_features" ON public.ecosystem_features FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated full access to use_cases" ON public.use_cases FOR ALL USING (auth.uid() IS NOT NULL);
