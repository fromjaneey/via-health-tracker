import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Droplets, Heart, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cycleData = [
  { day: 1, phase: "Menstrual", length: 5 },
  { day: 6, phase: "Follicular", length: 8 },
  { day: 14, phase: "Ovulation", length: 2 },
  { day: 16, phase: "Luteal", length: 12 },
];

const sleepHistory = [
  { day: "Mon", score: 82, hours: 7.5 },
  { day: "Tue", score: 68, hours: 6.2 },
  { day: "Wed", score: 91, hours: 8.1 },
  { day: "Thu", score: 75, hours: 7.0 },
  { day: "Fri", score: 88, hours: 7.8 },
  { day: "Sat", score: 95, hours: 8.5 },
  { day: "Sun", score: 79, hours: 7.2 },
];

const HealthInsightsPage = () => {
  const [showCycleDetail, setShowCycleDetail] = useState(false);
  const currentCycleDay = 8;
  const currentPhase = "Follicular";

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-display font-semibold text-foreground">Health Insights</h1>

      {/* Cycle Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground">Cycle Tracking</h3>
          </div>
          <button
            onClick={() => setShowCycleDetail(!showCycleDetail)}
            className="text-xs text-primary flex items-center gap-1"
          >
            Details <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCycleDetail ? "rotate-90" : ""}`} />
          </button>
        </div>

        {/* Cycle Visual */}
        <div className="relative h-8 rounded-full overflow-hidden bg-muted mb-3">
          {cycleData.map((phase, i) => {
            const colors: Record<string, string> = {
              Menstrual: "gradient-rose",
              Follicular: "gradient-primary",
              Ovulation: "gradient-success",
              Luteal: "bg-muted-foreground/30",
            };
            const width = (phase.length / 28) * 100;
            const left = ((phase.day - 1) / 28) * 100;
            return (
              <div
                key={i}
                className={`absolute top-0 h-full ${colors[phase.phase]} opacity-80`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            );
          })}
          {/* Current day marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground z-10"
            style={{ left: `${((currentCycleDay - 1) / 28) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-display font-semibold text-foreground">{currentPhase} Phase</p>
            <p className="text-xs text-muted-foreground">Day {currentCycleDay} of 28</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Next period in</p>
            <p className="text-sm font-display font-semibold text-accent">20 days</p>
          </div>
        </div>

        {showCycleDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-4 pt-4 border-t border-border space-y-3"
          >
            <p className="text-xs text-muted-foreground font-medium">Training recommendations for this phase:</p>
            <div className="bg-primary/5 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-display font-semibold text-primary">💪 Follicular Phase</p>
              <p className="text-xs text-muted-foreground">Energy levels are rising! Great time for:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• High-intensity training (HIIT)</li>
                <li>• Progressive overload — try increasing weights</li>
                <li>• Learning new exercises</li>
                <li>• Longer, more challenging workouts</li>
              </ul>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Sleep Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Moon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Sleep Score</h3>
          <span className="ml-auto text-2xl font-display font-semibold text-foreground">82</span>
        </div>

        {/* Sleep Bar Chart */}
        <div className="flex items-end gap-2 h-24 mb-3">
          {sleepHistory.map((day, i) => {
            const height = (day.score / 100) * 100;
            const color = day.score >= 80 ? "gradient-primary" : day.score >= 60 ? "bg-primary/40" : "bg-muted-foreground/30";
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className={`w-full rounded-t-md ${color}`}
                />
                <span className="text-[10px] text-muted-foreground">{day.day}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Avg: 7.5 hrs</span>
          <span>Best: 8.5 hrs (Sat)</span>
        </div>
      </motion.div>

      {/* Quick Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="bg-card rounded-2xl p-4 border border-border">
          <Heart className="w-4 h-4 text-accent mb-2" />
          <p className="text-xs text-muted-foreground">Resting HR</p>
          <p className="text-xl font-display font-semibold text-foreground">62 <span className="text-xs font-body text-muted-foreground">bpm</span></p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <TrendingUp className="w-4 h-4 text-success mb-2" />
          <p className="text-xs text-muted-foreground">Recovery</p>
          <p className="text-xl font-display font-semibold text-foreground">85<span className="text-xs font-body text-muted-foreground">%</span></p>
        </div>
      </motion.div>

      {/* Log Entry */}
      <Button variant="outline" className="w-full h-12 font-display">
        Log Today's Health Data
      </Button>
    </div>
  );
};

export default HealthInsightsPage;
