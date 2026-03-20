
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height_cm numeric NULL,
  ADD COLUMN IF NOT EXISTS weight_kg numeric NULL,
  ADD COLUMN IF NOT EXISTS equipment text[] NULL DEFAULT '{}'::text[];
