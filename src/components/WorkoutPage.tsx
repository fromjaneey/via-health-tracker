import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Dumbbell, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ExerciseSwipeCard from "./workout/ExerciseSwipeCard";
import {
  ExerciseData,
  exerciseDatabase,
  getExercisesForEquipment,
  bodyAreas,
} from "./workout/exerciseData";

interface WorkoutExercise {
  data: ExerciseData;
  sets: { weight: string; reps: string; completed: boolean }[];
}

const WorkoutPage = () => {
  const { user } = useAuth();
  const [userEquipment, setUserEquipment] = useState<string[]>([]);
  const [filterArea, setFilterArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showEquipmentEditor, setShowEquipmentEditor] = useState(false);

  const equipmentOptions = [
    { id: "full-gym", label: "Full Gym", emoji: "🏋️" },
    { id: "dumbbells", label: "Dumbbells", emoji: "🏠" },
    { id: "resistance-bands", label: "Bands", emoji: "🪢" },
    { id: "kettlebells", label: "Kettlebells", emoji: "🔔" },
    { id: "barbell", label: "Barbell", emoji: "🏗️" },
    { id: "bodyweight", label: "Bodyweight", emoji: "🤸" },
  ];

  // Load user equipment from profile
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("equipment")
        .eq("user_id", user.id)
        .single();
      if (data?.equipment) {
        setUserEquipment(data.equipment);
      }
    };
    load();
  }, [user]);

  // Build initial workout when equipment loads
  useEffect(() => {
    const available = getExercisesForEquipment(userEquipment);
    // Pick a balanced set: one from each body area
    const picked: ExerciseData[] = [];
    const areas = ["chest", "shoulders", "back", "arms", "legs", "glutes", "core"];
    for (const area of areas) {
      const areaExercises = available.filter((e) => e.bodyArea === area);
      if (areaExercises.length > 0) {
        picked.push(areaExercises[Math.floor(Math.random() * areaExercises.length)]);
      }
    }
    setExercises(
      picked.map((ex) => ({
        data: ex,
        sets: ex.defaultSets.map((s) => ({ ...s, completed: false })),
      }))
    );
  }, [userEquipment]);

  const toggleEquipment = async (id: string) => {
    const updated = userEquipment.includes(id)
      ? userEquipment.filter((e) => e !== id)
      : [...userEquipment, id];
    setUserEquipment(updated);
    if (user) {
      await supabase.from("profiles").update({ equipment: updated }).eq("user_id", user.id);
    }
  };

  const handleSwap = (index: number, newExercise: ExerciseData) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === index
          ? { data: newExercise, sets: newExercise.defaultSets.map((s) => ({ ...s, completed: false })) }
          : ex
      )
    );
  };

  const handleToggleSet = (exerciseIndex: number, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, completed: !s.completed } : s)) }
          : ex
      )
    );
  };

  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: string) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  };

  // Filter exercises
  const filtered = exercises.filter((ex) => {
    const areaMatch = filterArea === "all" || ex.data.bodyArea === filterArea;
    const searchMatch =
      !searchQuery ||
      ex.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.data.bodyArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.data.targetMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return areaMatch && searchMatch;
  });

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-display font-semibold text-foreground">Today's Workout</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Swipe any exercise to swap it out</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1"
          onClick={() => setShowEquipmentEditor(!showEquipmentEditor)}
        >
          <Settings2 className="w-3.5 h-3.5" /> Equipment
        </Button>
      </div>

      {/* Equipment Editor */}
      {showEquipmentEditor && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-4 p-4 bg-card rounded-2xl border border-border overflow-hidden"
        >
          <p className="text-sm font-display font-semibold text-foreground mb-3">Your Equipment</p>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleEquipment(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all ${
                  userEquipment.includes(opt.id)
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span>{opt.emoji}</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Changing equipment updates your workout options</p>
        </motion.div>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {completedSets}/{totalSets} sets
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by muscle or exercise (e.g. shoulders)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {bodyAreas.map((area) => (
            <button
              key={area.id}
              onClick={() => setFilterArea(area.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filterArea === area.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No exercises match your filter</p>
          </div>
        ) : (
          filtered.map((ex, i) => {
            const originalIndex = exercises.indexOf(ex);
            return (
              <ExerciseSwipeCard
                key={`${ex.data.id}-${originalIndex}`}
                exercise={ex.data}
                sets={ex.sets}
                userEquipment={userEquipment}
                onSwapExercise={(newEx) => handleSwap(originalIndex, newEx)}
                onToggleSet={(si) => handleToggleSet(originalIndex, si)}
                onUpdateSet={(si, field, val) => handleUpdateSet(originalIndex, si, field, val)}
              />
            );
          })
        )}
      </div>

      {/* Finish */}
      {totalSets > 0 && completedSets === totalSets && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Button variant="default" className="w-full h-12 font-display text-base">
            Finish Workout 🎉
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutPage;
