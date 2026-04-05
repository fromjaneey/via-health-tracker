import { useState, useEffect, useMemo } from "react";
import { Droplets, Dumbbell, TrendingUp, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Flame, Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCycleTracking } from "@/hooks/useCycleTracking";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

interface WorkoutRecord {
  id: string;
  completed_at: string;
  exercises: any[];
  duration_minutes: number | null;
}

interface SymptomRecord {
  id: string;
  log_date: string;
  symptom: string;
  intensity: number;
}

interface MedicationLogRecord {
  id: string;
  log_date: string;
  taken: boolean;
  medication_id: string;
  medications?: { name: string; amount: string } | null;
}

interface PeriodRecord {
  id: string;
  start_date: string;
  end_date: string | null;
}

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { user } = useAuth();
  const { cycleInfo, recommendations, loading } = useCycleTracking();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [latestWorkout, setLatestWorkout] = useState<any>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Data for calendar
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [medLogs, setMedLogs] = useState<MedicationLogRecord[]>([]);
  const [periods, setPeriods] = useState<PeriodRecord[]>([]);

  const phaseName = cycleInfo.currentPhase ?? "Not tracked";
  const dayLabel = cycleInfo.currentDay ? `Day ${cycleInfo.currentDay}` : "—";

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count } = await supabase
        .from("workout_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", weekAgo.toISOString());
      setWorkoutCount(count ?? 0);

      const { data } = await supabase
        .from("workout_history")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setLatestWorkout(data[0]);

      // Load all calendar data
      const [wRes, sRes, mRes, pRes] = await Promise.all([
        supabase.from("workout_history").select("id, completed_at, exercises, duration_minutes").eq("user_id", user.id).order("completed_at", { ascending: false }),
        supabase.from("menopause_symptoms").select("id, log_date, symptom, intensity").eq("user_id", user.id),
        supabase.from("medication_logs").select("id, log_date, taken, medication_id, medications(name, amount)").eq("user_id", user.id),
        supabase.from("cycle_periods").select("id, start_date, end_date").eq("user_id", user.id),
      ]);
      if (wRes.data) setWorkoutHistory(wRes.data as WorkoutRecord[]);
      if (sRes.data) setSymptoms(sRes.data as SymptomRecord[]);
      if (mRes.data) setMedLogs(mRes.data as MedicationLogRecord[]);
      if (pRes.data) setPeriods(pRes.data as PeriodRecord[]);
    };
    load();
  }, [user]);

  // Calendar logic
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const dayData = useMemo(() => {
    const map = new Map<string, { workouts: WorkoutRecord[]; symptoms: SymptomRecord[]; meds: MedicationLogRecord[]; period: boolean }>();

    const getEntry = (key: string) => {
      if (!map.has(key)) map.set(key, { workouts: [], symptoms: [], meds: [], period: false });
      return map.get(key)!;
    };

    workoutHistory.forEach((w) => {
      const key = format(new Date(w.completed_at), "yyyy-MM-dd");
      getEntry(key).workouts.push(w);
    });
    symptoms.forEach((s) => getEntry(s.log_date).symptoms.push(s));
    medLogs.forEach((m) => getEntry(m.log_date).meds.push(m));
    periods.forEach((p) => {
      const start = new Date(p.start_date);
      const end = p.end_date ? new Date(p.end_date) : start;
      const periodDays = eachDayOfInterval({ start, end });
      periodDays.forEach((d) => { getEntry(format(d, "yyyy-MM-dd")).period = true; });
    });

    return map;
  }, [workoutHistory, symptoms, medLogs, periods]);

  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const selectedData = selectedKey ? dayData.get(selectedKey) : null;

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">Good morning,</p>
        <h1 className="text-2xl font-display font-semibold text-foreground">Welcome back 💪</h1>
      </div>

      {/* Daily Pulse */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="gradient-primary rounded-2xl p-5 text-primary-foreground"
      >
        <h2 className="font-display font-semibold text-lg mb-3">Daily Pulse</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1" />
            <p className="text-sm font-display font-semibold">{phaseName}</p>
            <p className="text-[10px] opacity-80">{dayLabel}</p>
          </div>
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-display font-semibold">{workoutCount}</p>
            <p className="text-[10px] opacity-80">Workouts this week</p>
          </div>
        </div>
      </motion.div>

      {/* Phase Training Recommendations */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-card rounded-2xl p-5 border border-border"
        >
          <p className="text-xs font-display font-semibold text-primary mb-2">{recommendations.title}</p>
          <p className="text-xs text-muted-foreground mb-2">Training recommendations for this phase:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {recommendations.tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Consolidated Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-3"
      >
        <h2 className="font-display font-semibold text-foreground text-base">Your Calendar</h2>

        {/* Month nav */}
        <div className="flex items-center justify-between bg-card rounded-xl border border-border px-4 py-3">
          <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="font-display font-semibold text-sm text-foreground">
            {format(calendarMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Grid */}
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-[10px] text-muted-foreground text-center font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const entry = dayData.get(key);
              const hasWorkout = (entry?.workouts.length ?? 0) > 0;
              const hasSymptom = (entry?.symptoms.length ?? 0) > 0;
              const hasMed = (entry?.meds.length ?? 0) > 0;
              const isPeriod = entry?.period ?? false;
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentMonth = isSameMonth(day, calendarMonth);
              const isToday = isSameDay(day, new Date());
              const hasAny = hasWorkout || hasSymptom || hasMed || isPeriod;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                    !isCurrentMonth
                      ? "text-muted-foreground/30"
                      : isPeriod && !isSelected
                      ? "bg-red-100 dark:bg-red-950/30 text-foreground"
                      : isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : isToday
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {format(day, "d")}
                  {hasAny && !isSelected && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {hasWorkout && <span className="w-1 h-1 rounded-full bg-primary" />}
                      {hasSymptom && <span className="w-1 h-1 rounded-full bg-orange-400" />}
                      {hasMed && <span className="w-1 h-1 rounded-full bg-blue-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] text-muted-foreground">Workout</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-[10px] text-muted-foreground">Symptom</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-[10px] text-muted-foreground">Meds</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300" /><span className="text-[10px] text-muted-foreground">Period</span></div>
          </div>
        </div>

        {/* Selected day detail */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <p className="font-display font-semibold text-sm text-foreground">
                  {format(selectedDay, "EEEE, MMM d")}
                </p>

                {!selectedData || (!selectedData.workouts.length && !selectedData.symptoms.length && !selectedData.meds.length && !selectedData.period) ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nothing logged this day</p>
                ) : (
                  <>
                    {selectedData.period && (
                      <div className="flex items-center gap-2 text-xs text-red-400">
                        <Droplets className="w-3.5 h-3.5" /> Period day
                      </div>
                    )}

                    {selectedData.workouts.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Dumbbell className="w-3 h-3" /> Workouts
                        </p>
                        {selectedData.workouts.map((w) => (
                          <div key={w.id} className="bg-muted/50 rounded-lg p-2.5 space-y-1 mb-1.5">
                            {w.duration_minutes && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {w.duration_minutes} min
                              </span>
                            )}
                            {(w.exercises as any[]).map((ex: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-foreground">{ex.name}</span>
                                <span className="text-muted-foreground">
                                  {ex.sets?.length} sets · {ex.sets?.map((s: any) => `${s.weight}×${s.reps}`).join(", ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedData.symptoms.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Symptoms
                        </p>
                        {selectedData.symptoms.map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-2.5 py-1.5 mb-1">
                            <span className="text-foreground">{s.symptom}</span>
                            <span className="text-orange-400 font-medium">{s.intensity}/10</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedData.meds.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Pill className="w-3 h-3" /> Medications
                        </p>
                        {selectedData.meds.map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-2.5 py-1.5 mb-1">
                            <span className="text-foreground">{(m as any).medications?.name ?? "Medication"}</span>
                            <span className={`font-medium ${m.taken ? "text-green-500" : "text-muted-foreground"}`}>
                              {m.taken ? "✓ Taken" : "Missed"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground">Ready to train?</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" /> Today
          </span>
        </div>
        {latestWorkout ? (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Last workout:</p>
            <div className="space-y-1">
              {(latestWorkout.exercises as any[]).slice(0, 4).map((ex: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{ex.name}</span>
                  <span className="text-muted-foreground ml-auto text-xs">{ex.sets?.length} sets</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">Start your first workout to track progress</p>
        )}
        <Button variant="hero" className="w-full h-12 text-base font-display" onClick={() => onNavigate("workout")}>
          Start Workout
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-muted-foreground text-xs mb-1">This Week</p>
          <p className="text-2xl font-display font-semibold text-foreground">{workoutCount}</p>
          <p className="text-xs text-primary">workouts completed</p>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
