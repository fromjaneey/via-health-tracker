import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays, addDays, format } from "date-fns";

interface CyclePeriod {
  id: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

const PHASES = [
  { name: "Menstrual", length: 5, emoji: "🩸" },
  { name: "Follicular", length: 8, emoji: "💪" },
  { name: "Ovulation", length: 2, emoji: "✨" },
  { name: "Luteal", length: 13, emoji: "🧘" },
];

const PHASE_RECOMMENDATIONS: Record<string, { title: string; tips: string[] }> = {
  Menstrual: {
    title: "🩸 Menstrual Phase",
    tips: [
      "Light movement — yoga, walking, stretching",
      "Focus on recovery and rest",
      "Reduce intensity if feeling fatigued",
      "Iron-rich foods to replenish",
    ],
  },
  Follicular: {
    title: "💪 Follicular Phase",
    tips: [
      "High-intensity training (HIIT)",
      "Progressive overload — try increasing weights",
      "Learning new exercises",
      "Longer, more challenging workouts",
    ],
  },
  Ovulation: {
    title: "✨ Ovulation Phase",
    tips: [
      "Peak energy — go for PRs!",
      "Group classes and social workouts",
      "High-power explosive movements",
      "Take advantage of peak strength",
    ],
  },
  Luteal: {
    title: "🧘 Luteal Phase",
    tips: [
      "Moderate-intensity steady-state cardio",
      "Pilates and strength maintenance",
      "Focus on form over heavy loads",
      "Extra warm-up time recommended",
    ],
  },
};

export function useCycleTracking() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<CyclePeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("cycle_periods")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        if (data) setPeriods(data as CyclePeriod[]);
        setLoading(false);
      });
  }, [user]);

  const cycleInfo = useMemo(() => {
    if (periods.length === 0) {
      return { currentDay: null, currentPhase: null, nextPeriodIn: null, cycleLength: 28, periodDates: new Set<string>() };
    }

    const latest = periods[0];
    const startDate = new Date(latest.start_date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Estimate cycle length from last two periods
    let cycleLength = 28;
    if (periods.length >= 2) {
      const prev = new Date(periods[1].start_date + "T00:00:00");
      cycleLength = Math.max(21, Math.min(45, differenceInDays(startDate, prev)));
    }

    const daysSinceStart = differenceInDays(today, startDate);
    const currentDay = (daysSinceStart % cycleLength) + 1;

    // Determine phase
    let phase = "Luteal";
    let accumulated = 0;
    for (const p of PHASES) {
      const len = p.name === "Luteal" ? cycleLength - accumulated : p.length;
      if (currentDay <= accumulated + len) {
        phase = p.name;
        break;
      }
      accumulated += p.length;
    }

    const nextPeriodIn = cycleLength - currentDay + 1;

    // Build set of period dates for calendar
    const periodDates = new Set<string>();
    for (const p of periods) {
      const s = new Date(p.start_date + "T00:00:00");
      const e = p.end_date ? new Date(p.end_date + "T00:00:00") : addDays(s, 4);
      let d = new Date(s);
      while (d <= e) {
        periodDates.add(format(d, "yyyy-MM-dd"));
        d = addDays(d, 1);
      }
    }

    return { currentDay, currentPhase: phase, nextPeriodIn, cycleLength, periodDates };
  }, [periods]);

  const addPeriod = async (startDate: string, endDate: string | null) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("cycle_periods")
      .insert({ user_id: user.id, start_date: startDate, end_date: endDate })
      .select()
      .single();
    if (!error && data) {
      setPeriods((prev) => [data as CyclePeriod, ...prev].sort((a, b) => b.start_date.localeCompare(a.start_date)));
    }
    return { data, error };
  };

  const deletePeriod = async (id: string) => {
    await supabase.from("cycle_periods").delete().eq("id", id);
    setPeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const recommendations = cycleInfo.currentPhase ? PHASE_RECOMMENDATIONS[cycleInfo.currentPhase] : null;

  return { periods, loading, cycleInfo, addPeriod, deletePeriod, recommendations, PHASES };
}
