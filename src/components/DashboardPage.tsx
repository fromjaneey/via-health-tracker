import { Moon, Sun, Droplets, Dumbbell, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCycleTracking } from "@/hooks/useCycleTracking";

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { cycleInfo, recommendations, loading } = useCycleTracking();

  const phaseName = cycleInfo.currentPhase ?? "Not tracked";
  const dayLabel = cycleInfo.currentDay ? `Day ${cycleInfo.currentDay}` : "—";

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
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
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Moon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-display font-semibold">7.5</p>
            <p className="text-[10px] opacity-80">Sleep Score</p>
          </div>
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1" />
            <p className="text-sm font-display font-semibold">{phaseName}</p>
            <p className="text-[10px] opacity-80">{dayLabel}</p>
          </div>
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-display font-semibold">3</p>
            <p className="text-[10px] opacity-80">Day Streak</p>
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

      {/* Today's Workout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground">Today's Workout</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Upper Body
          </span>
        </div>
        <div className="space-y-2 mb-4">
          {["Dumbbell Bench Press", "Seated Row", "Shoulder Press", "Bicep Curls"].map((ex, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <Dumbbell className="w-4 h-4 text-primary" />
              <span className="text-foreground">{ex}</span>
              <span className="text-muted-foreground ml-auto text-xs">3 × 12</span>
            </div>
          ))}
        </div>
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
          <p className="text-2xl font-display font-semibold text-foreground">4</p>
          <p className="text-xs text-success">workouts completed</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <p className="text-muted-foreground text-xs mb-1">Personal Best</p>
          <p className="text-2xl font-display font-semibold text-foreground">65 kg</p>
          <p className="text-xs text-primary">Hip Thrust</p>
        </div>
      </motion.div>

      {/* Meal Tracking CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-card rounded-2xl p-5 border border-border text-center"
      >
        <h3 className="font-display font-semibold text-foreground mb-2">Track your meals 🥗</h3>
        <p className="text-sm text-muted-foreground mb-4">Log nutrition and discover high-protein recipes</p>
        <Button variant="outline" className="font-display" onClick={() => onNavigate("meals")}>
          Go to Meals
        </Button>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
