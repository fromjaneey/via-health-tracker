import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Dumbbell, Settings2, Plus, X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

interface WorkoutRecord {
  id: string;
  completed_at: string;
  exercises: any[];
  duration_minutes: number | null;
}

const WorkoutPage = () => {
  const { user } = useAuth();
  const [userEquipment, setUserEquipment] = useState<string[]>([]);
  const [filterArea, setFilterArea] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showEquipmentEditor, setShowEquipmentEditor] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [addFilterArea, setAddFilterArea] = useState("all");
  const [history, setHistory] = useState<WorkoutRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [workoutStartTime] = useState<Date>(new Date());

  const equipmentOptions = [
    { id: "full-gym", label: "Full Gym", emoji: "🏋️" },
    { id: "dumbbells", label: "Dumbbells", emoji: "🏠" },
    { id: "resistance-bands", label: "Bands", emoji: "🪢" },
    { id: "kettlebells", label: "Kettlebells", emoji: "🔔" },
    { id: "barbell", label: "Barbell", emoji: "🏗️" },
    { id: "bodyweight", label: "Bodyweight", emoji: "🤸" },
  ];

  // Load user equipment
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

  // Load workout history
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data } = await supabase
        .from("workout_history")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(20);
      if (data) setHistory(data as WorkoutRecord[]);
    };
    loadHistory();
  }, [user]);

  const toggleEquipment = async (id: string) => {
    const updated = userEquipment.includes(id)
      ? userEquipment.filter((e) => e !== id)
      : [...userEquipment, id];
    setUserEquipment(updated);
    if (user) {
      await supabase.from("profiles").update({ equipment: updated }).eq("user_id", user.id);
    }
  };

  const handleRemove = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
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

  const addExerciseToWorkout = (ex: ExerciseData) => {
    const alreadyAdded = exercises.some((e) => e.data.id === ex.id);
    if (alreadyAdded) {
      toast.info("Already in your workout");
      return;
    }
    setExercises((prev) => [
      ...prev,
      { data: ex, sets: ex.defaultSets.map((s) => ({ ...s, completed: false })) },
    ]);
    toast.success(`Added ${ex.name}`);
  };

  const finishWorkout = async () => {
    if (!user) return;
    const durationMin = Math.round((Date.now() - workoutStartTime.getTime()) / 60000);
    const exerciseData = exercises.map((ex) => ({
      name: ex.data.name,
      bodyArea: ex.data.bodyArea,
      sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
    }));

    const { error } = await supabase.from("workout_history").insert({
      user_id: user.id,
      exercises: exerciseData,
      duration_minutes: durationMin,
    });

    if (error) {
      toast.error("Failed to save workout");
      return;
    }

    toast.success("Workout saved! 🎉");
    setExercises([]);
    // Reload history
    const { data } = await supabase
      .from("workout_history")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as WorkoutRecord[]);
  };

  // Available exercises for adding
  const availableExercises = getExercisesForEquipment(userEquipment).filter((ex) => {
    const areaMatch = addFilterArea === "all" || ex.bodyArea === addFilterArea;
    const searchMatch =
      !addSearchQuery ||
      ex.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
      ex.bodyArea.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
      ex.targetMuscles.some((m) => m.toLowerCase().includes(addSearchQuery.toLowerCase()));
    return areaMatch && searchMatch;
  });

  // Filter current workout exercises
  const filtered = exercises.filter((ex) => {
    const areaMatch = filterArea === "all" || ex.data.bodyArea === filterArea;
    const searchMatch =
      !searchQuery ||
      ex.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
          <h1 className="text-xl font-display font-semibold text-foreground">Workout</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Build your session & track progress</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={() => setShowEquipmentEditor(!showEquipmentEditor)}
          >
            <Settings2 className="w-3.5 h-3.5" /> Equipment
          </Button>
        </div>
      </div>

      {/* Equipment Editor */}
      <AnimatePresence>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Exercise Button */}
      <Button
        variant="hero"
        className="w-full mb-4 gap-2 font-display"
        onClick={() => setShowAddExercise(true)}
      >
        <Plus className="w-4 h-4" /> Add Exercise
      </Button>

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {showAddExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAddExercise(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-background rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">Add Exercise</h3>
                <button onClick={() => setShowAddExercise(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by muscle or exercise..."
                    value={addSearchQuery}
                    onChange={(e) => setAddSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {bodyAreas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setAddFilterArea(area.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        addFilterArea === area.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {availableExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No exercises found</p>
                ) : (
                  availableExercises.map((ex) => {
                    const alreadyAdded = exercises.some((e) => e.data.id === ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => addExerciseToWorkout(ex)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          alreadyAdded
                            ? "border-primary/30 bg-primary/5 opacity-60"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Dumbbell className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-medium text-sm text-foreground truncate">{ex.name}</p>
                          <p className="text-[11px] text-muted-foreground">{ex.targetMuscles.join(" · ")}</p>
                        </div>
                        {alreadyAdded ? (
                          <span className="text-[10px] text-primary font-medium">Added</span>
                        ) : (
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      {exercises.length > 0 && (
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
      )}

      {/* Filter current workout */}
      {exercises.length > 0 && (
        <div className="mb-4">
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
      )}

      {/* Exercise Cards */}
      <div className="space-y-3">
        {exercises.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No exercises yet</p>
            <p className="text-xs mt-1">Tap "Add Exercise" to build your workout</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No exercises match your filter</p>
          </div>
        ) : (
          filtered.map((ex) => {
            const originalIndex = exercises.indexOf(ex);
            return (
              <ExerciseSwipeCard
                key={`${ex.data.id}-${originalIndex}`}
                exercise={ex.data}
                sets={ex.sets}
                onRemoveExercise={() => handleRemove(originalIndex)}
                onToggleSet={(si) => handleToggleSet(originalIndex, si)}
                onUpdateSet={(si, field, val) => handleUpdateSet(originalIndex, si, field, val)}
              />
            );
          })
        )}
      </div>

      {/* Finish Workout */}
      {totalSets > 0 && completedSets === totalSets && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Button variant="default" className="w-full h-12 font-display text-base" onClick={finishWorkout}>
            Finish Workout 🎉
          </Button>
        </motion.div>
      )}

      {/* Workout History */}
      <div className="mt-8">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h2 className="font-display font-semibold text-foreground text-base">Workout History</h2>
          {showHistory ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No workouts recorded yet</p>
              ) : (
                history.map((record) => (
                  <div key={record.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-display font-medium text-sm text-foreground">
                        {new Date(record.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {record.duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {record.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {(record.exercises as any[]).map((ex: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{ex.name}</span>
                          <span className="text-muted-foreground">
                            {ex.sets?.length} sets · {ex.sets?.map((s: any) => `${s.weight}×${s.reps}`).join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutPage;
