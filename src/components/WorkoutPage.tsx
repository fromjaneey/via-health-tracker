import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, ChevronDown, ChevronUp, Play, AlertTriangle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseSet {
  weight: string;
  reps: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: ExerciseSet[];
  formTips: string[];
  commonMistakes: string[];
  formVideoUrl: string;
}

const initialExercises: Exercise[] = [
  {
    id: "1",
    name: "Dumbbell Bench Press",
    targetMuscles: ["Chest", "Triceps", "Front Delts"],
    sets: [
      { weight: "12", reps: "12", completed: false },
      { weight: "12", reps: "12", completed: false },
      { weight: "14", reps: "10", completed: false },
    ],
    formTips: [
      "Keep shoulder blades retracted and pinched together",
      "Feet flat on the floor for stability",
      "Lower dumbbells to chest level, elbows at ~45°",
      "Press up and slightly inward",
    ],
    commonMistakes: [
      "Flaring elbows out to 90° (causes shoulder strain)",
      "Arching lower back excessively",
      "Bouncing dumbbells off chest",
      "Not controlling the eccentric (lowering) phase",
    ],
    formVideoUrl: "https://www.youtube.com/results?search_query=dumbbell+bench+press+form+women",
  },
  {
    id: "2",
    name: "Seated Cable Row",
    targetMuscles: ["Lats", "Rhomboids", "Biceps"],
    sets: [
      { weight: "20", reps: "12", completed: false },
      { weight: "20", reps: "12", completed: false },
      { weight: "22", reps: "10", completed: false },
    ],
    formTips: [
      "Sit tall with slight forward lean at the start",
      "Pull handles to lower chest/upper abs",
      "Squeeze shoulder blades at peak contraction",
      "Control the return — don't let the stack slam",
    ],
    commonMistakes: [
      "Using momentum / swinging torso",
      "Rounding the lower back",
      "Pulling with arms only instead of back",
      "Shrugging shoulders up during the pull",
    ],
    formVideoUrl: "https://www.youtube.com/results?search_query=seated+cable+row+form",
  },
  {
    id: "3",
    name: "Shoulder Press",
    targetMuscles: ["Front Delts", "Side Delts", "Triceps"],
    sets: [
      { weight: "8", reps: "12", completed: false },
      { weight: "8", reps: "12", completed: false },
      { weight: "10", reps: "10", completed: false },
    ],
    formTips: [
      "Start with dumbbells at shoulder height",
      "Press straight up, don't let elbows drift forward",
      "Core tight to prevent excessive arching",
      "Full lockout at the top",
    ],
    commonMistakes: [
      "Leaning back too much (turns it into incline press)",
      "Not using full range of motion",
      "Flaring elbows forward",
      "Going too heavy and sacrificing form",
    ],
    formVideoUrl: "https://www.youtube.com/results?search_query=dumbbell+shoulder+press+form",
  },
  {
    id: "4",
    name: "Bicep Curls",
    targetMuscles: ["Biceps", "Forearms"],
    sets: [
      { weight: "6", reps: "15", completed: false },
      { weight: "6", reps: "15", completed: false },
      { weight: "8", reps: "12", completed: false },
    ],
    formTips: [
      "Keep elbows pinned at your sides",
      "Supinate (rotate) wrists at the top for full contraction",
      "Slow, controlled lowering for 2-3 seconds",
      "Don't swing — if you need to, go lighter",
    ],
    commonMistakes: [
      "Swinging hips to lift the weight",
      "Moving elbows forward during the curl",
      "Not fully extending at the bottom",
      "Going too fast on the eccentric",
    ],
    formVideoUrl: "https://www.youtube.com/results?search_query=bicep+curl+form+women",
  },
];

const WorkoutPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFormTips, setShowFormTips] = useState<Record<string, "tips" | "mistakes" | null>>({});

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, completed: !s.completed } : s
              ),
            }
          : ex
      )
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: "weight" | "reps", value: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const completedSets = exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0);

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-display font-semibold text-foreground">Upper Body Push</h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-success rounded-full"
              animate={{ width: `${(completedSets / totalSets) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {completedSets}/{totalSets} sets
          </span>
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const isExpanded = expandedId === exercise.id;
          const formView = showFormTips[exercise.id];
          const allDone = exercise.sets.every((s) => s.completed);

          return (
            <motion.div
              key={exercise.id}
              layout
              className={`bg-card rounded-2xl border transition-colors ${
                allDone ? "border-success/50" : "border-border"
              }`}
            >
              {/* Exercise Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  allDone ? "bg-success/10" : "bg-primary/10"
                }`}>
                  {allDone ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Target className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-display font-semibold text-sm text-foreground">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">{exercise.targetMuscles.join(" · ")}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {/* Sets Table */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-xs text-muted-foreground font-medium px-1">
                          <span>Set</span>
                          <span>Weight (kg)</span>
                          <span>Reps</span>
                          <span></span>
                        </div>
                        {exercise.sets.map((set, i) => (
                          <motion.div
                            key={i}
                            className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center ${
                              set.completed ? "animate-set-complete" : ""
                            }`}
                          >
                            <span className="text-sm text-muted-foreground font-medium text-center">{i + 1}</span>
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => updateSet(exercise.id, i, "weight", e.target.value)}
                              className="h-11 bg-surface border border-border rounded-lg text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.id, i, "reps", e.target.value)}
                              className="h-11 bg-surface border border-border rounded-lg text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                              onClick={() => toggleSet(exercise.id, i)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                set.completed
                                  ? "bg-success text-success-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-primary/10"
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Form & Info Buttons */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant={formView === "tips" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() =>
                            setShowFormTips((prev) => ({
                              ...prev,
                              [exercise.id]: prev[exercise.id] === "tips" ? null : "tips",
                            }))
                          }
                        >
                          <Info className="w-3.5 h-3.5 mr-1" /> Form Tips
                        </Button>
                        <Button
                          variant={formView === "mistakes" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() =>
                            setShowFormTips((prev) => ({
                              ...prev,
                              [exercise.id]: prev[exercise.id] === "mistakes" ? null : "mistakes",
                            }))
                          }
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Common Mistakes
                        </Button>
                      </div>

                      {/* Form Video Link */}
                      <a
                        href={exercise.formVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-primary hover:underline"
                      >
                        <Play className="w-3.5 h-3.5" /> Watch Form Video
                      </a>

                      {/* Tips / Mistakes Drawer */}
                      <AnimatePresence>
                        {formView && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={`p-3 rounded-xl text-sm space-y-1.5 ${
                              formView === "tips" ? "bg-primary/5" : "bg-destructive/5"
                            }`}>
                              <p className="font-display font-semibold text-xs text-foreground">
                                {formView === "tips" ? "✅ Good Form" : "⚠️ Common Mistakes"}
                              </p>
                              {(formView === "tips" ? exercise.formTips : exercise.commonMistakes).map((tip, i) => (
                                <p key={i} className="text-xs text-muted-foreground">• {tip}</p>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Finish Button */}
      {completedSets === totalSets && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Button variant="success" className="w-full h-12 font-display text-base">
            Finish Workout 🎉
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutPage;
