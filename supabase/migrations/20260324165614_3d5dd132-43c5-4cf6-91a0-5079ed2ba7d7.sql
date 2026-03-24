
-- Track period start/end dates for cycle tracking
CREATE TABLE public.cycle_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cycle_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own periods" ON public.cycle_periods
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own periods" ON public.cycle_periods
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own periods" ON public.cycle_periods
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own periods" ON public.cycle_periods
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
