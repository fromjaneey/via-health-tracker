import { useState, useEffect } from "react";
import { Droplets, Dumbbell, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCycleTracking } from "@/hooks/useCycleTracking";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { user } = useAuth();
  const { cycleInfo, recommendations, loading } = useCycleTracking();
  const [workoutCount, setWorkoutCount] = useState(0);
  const [latestWorkout, setLatestWorkout] = useState<any>(null);

  const phaseName = cycleInfo.currentPhase ?? "Not tracked";
  const dayLabel = cycleInfo.currentDay ? `Day ${cycleInfo.currentDay}` : "—";

  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      // Count workouts this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count } = await supabase
        .from("workout_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("completed_at", weekAgo.toISOString());
      setWorkoutCount(count ?? 0);

      // Get latest workout
      const { data } = await supabase
        .from("workout_history")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) setLatestWorkout(data[0]);
    };
    loadStats();
  }, [user]);

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

      {/* Start Workout CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground">Ready to train?</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Today
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
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-muted-foreground text-xs mb-1">This Week</p>
          <p className="text-2xl font-display font-semibold text-foreground">{workoutCount}</p>
          <p className="text-xs text-success">workouts completed</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border cursor-pointer" onClick={() => onNavigate("meals")}>
          <p className="text-muted-foreground text-xs mb-1">Nutrition</p>
          <p className="text-lg font-display font-semibold text-foreground">🥗</p>
          <p className="text-xs text-primary">Track meals →</p>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
