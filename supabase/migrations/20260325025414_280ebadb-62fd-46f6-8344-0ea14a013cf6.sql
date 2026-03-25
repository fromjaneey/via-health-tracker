CREATE TABLE public.workout_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER,
  notes TEXT
);

ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout history" ON public.workout_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout history" ON public.workout_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout history" ON public.workout_history FOR DELETE TO authenticated USING (auth.uid() = user_id);