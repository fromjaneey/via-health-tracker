
-- Add start_date and end_date to medications, drop frequency
ALTER TABLE public.medications ADD COLUMN start_date date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.medications ADD COLUMN end_date date;
ALTER TABLE public.medications DROP COLUMN frequency;

-- Create side_effect_logs table
CREATE TABLE public.side_effect_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  side_effect text NOT NULL,
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.side_effect_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own side effect logs" ON public.side_effect_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own side effect logs" ON public.side_effect_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own side effect logs" ON public.side_effect_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own side effect logs" ON public.side_effect_logs FOR DELETE USING (auth.uid() = user_id);
