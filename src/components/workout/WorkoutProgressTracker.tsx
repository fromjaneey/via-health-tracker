import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3 } from "lucide-react";

interface WorkoutRecord {
  id: string;
  completed_at: string;
  exercises: any[];
  duration_minutes: number | null;
}

const areaLabels: Record<string, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  back: "Back",
  arms: "Arms",
  legs: "Legs",
  glutes: "Glutes",
  core: "Core",
};

const areaColors: Record<string, string> = {
  chest: "bg-red-400",
  shoulders: "bg-orange-400",
  back: "bg-blue-400",
  arms: "bg-purple-400",
  legs: "bg-green-400",
  glutes: "bg-pink-400",
  core: "bg-yellow-400",
};

interface Props {
  history: WorkoutRecord[];
}

const WorkoutProgressTracker = ({ history }: Props) => {
  // Weight progress per body area: track max weight over time
  const weightProgress = useMemo(() => {
    const areaMaxByDate = new Map<string, Map<string, number>>();

    history.forEach((record) => {
      const date = new Date(record.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      (record.exercises as any[]).forEach((ex) => {
        const area = ex.bodyArea || "other";
        if (!areaMaxByDate.has(area)) areaMaxByDate.set(area, new Map());
        const dateMap = areaMaxByDate.get(area)!;
        const maxWeight = Math.max(...(ex.sets || []).map((s: any) => parseFloat(s.weight) || 0));
        if (maxWeight > 0) {
          dateMap.set(date, Math.max(dateMap.get(date) || 0, maxWeight));
        }
      });
    });

    // Build per-area progress arrays (latest 8 sessions)
    const result: { area: string; label: string; points: { date: string; weight: number }[]; trend: number }[] = [];
    areaMaxByDate.forEach((dateMap, area) => {
      const points = Array.from(dateMap.entries())
        .map(([date, weight]) => ({ date, weight }))
        .slice(-8);
      if (points.length >= 1) {
        const first = points[0].weight;
        const last = points[points.length - 1].weight;
        const trend = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
        result.push({ area, label: areaLabels[area] || area, points, trend });
      }
    });

    return result.sort((a, b) => a.label.localeCompare(b.label));
  }, [history]);

  // Muscle group frequency
  const muscleFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    history.forEach((record) => {
      (record.exercises as any[]).forEach((ex) => {
        const area = ex.bodyArea || "other";
        counts[area] = (counts[area] || 0) + 1;
      });
    });

    const entries = Object.entries(counts)
      .map(([area, count]) => ({ area, label: areaLabels[area] || area, count, color: areaColors[area] || "bg-muted-foreground" }))
      .sort((a, b) => b.count - a.count);

    const max = entries[0]?.count || 1;
    return entries.map((e) => ({ ...e, pct: (e.count / max) * 100 }));
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Complete workouts to see progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight Progress by Category */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Weight Progress</h3>
        </div>
        {weightProgress.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No weight data yet</p>
        ) : (
          <div className="space-y-3">
            {weightProgress.map(({ area, label, points, trend }) => {
              const maxW = Math.max(...points.map((p) => p.weight));
              return (
                <div key={area} className="bg-card rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-medium text-xs text-foreground">{label}</span>
                    <span className={`text-[11px] font-medium ${trend > 0 ? "text-green-500" : trend < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                      {trend > 0 ? "+" : ""}{trend}%
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    {points.map((p, i) => {
                      const h = maxW > 0 ? (p.weight / maxW) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.05 }}
                            className="w-full rounded-sm bg-primary/70 min-h-[2px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{points[0]?.date}</span>
                    <span className="text-[9px] text-muted-foreground">{points[points.length - 1]?.weight} lbs</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Muscle Group Frequency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">Muscle Group Frequency</h3>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-2.5">
          {muscleFrequency.map(({ area, label, count, color, pct }) => (
            <div key={area}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{label}</span>
                <span className="text-[11px] text-muted-foreground">{count} exercises</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutProgressTracker;
