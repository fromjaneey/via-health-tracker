import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { Check, Info, AlertTriangle, Play, ChevronDown, ChevronUp, Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExerciseData, getAlternatives } from "./exerciseData";

interface ExerciseSet {
  weight: string;
  reps: string;
  completed: boolean;
}

interface ExerciseSwipeCardProps {
  exercise: ExerciseData;
  sets: ExerciseSet[];
  userEquipment: string[];
  onSwapExercise: (newExercise: ExerciseData) => void;
  onRemoveExercise: () => void;
  onToggleSet: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, field: "weight" | "reps", value: string) => void;
}

const ExerciseSwipeCard = ({
  exercise,
  sets,
  userEquipment,
  onSwapExercise,
  onRemoveExercise,
  onToggleSet,
  onUpdateSet,
}: ExerciseSwipeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formView, setFormView] = useState<"tips" | "mistakes" | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  const leftLabelOpacity = useTransform(x, [-200, -60, 0], [1, 0.8, 0]);
  const rightLabelOpacity = useTransform(x, [0, 60, 200], [0, 0.8, 1]);

  const alternatives = getAlternatives(exercise, userEquipment);
  const allDone = sets.every((s) => s.completed);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      // Swipe left → remove
      onRemoveExercise();
    } else if (info.offset.x > 100 && alternatives.length > 0) {
      // Swipe right → swap for alternative
      const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
      onSwapExercise(randomAlt);
    }
  };

  return (
    <div className="relative">
      {/* Background labels */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div style={{ opacity: leftLabelOpacity }} className="flex items-center gap-1 text-destructive">
          <X className="w-4 h-4" />
          <span className="text-xs font-semibold">Remove</span>
        </motion.div>
        <motion.div style={{ opacity: rightLabelOpacity }} className="flex items-center gap-1 text-primary">
          <span className="text-xs font-semibold">New</span>
          <Repeat className="w-4 h-4" />
        </motion.div>
      </div>

      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        className={`bg-card rounded-2xl border transition-colors cursor-grab active:cursor-grabbing relative z-10 ${
          allDone ? "border-success/50" : "border-border"
        }`}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 p-4"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            allDone ? "bg-success/10" : "bg-primary/10"
          }`}>
            {allDone ? <Check className="w-5 h-5 text-success" /> : <span className="text-lg">🎯</span>}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate">{exercise.name}</p>
            <p className="text-xs text-muted-foreground">{exercise.targetMuscles.join(" · ")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full hidden sm:inline">← remove · swap →</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Sets */}
                <div className="space-y-2">
                  <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 text-xs text-muted-foreground font-medium px-1">
                    <span>Set</span>
                    <span>Weight (lbs)</span>
                    <span>Reps</span>
                    <span></span>
                  </div>
                  {sets.map((set, i) => (
                    <div key={i} className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center">
                      <span className="text-sm text-muted-foreground font-medium text-center">{i + 1}</span>
                      <input
                        type="number"
                        value={set.weight}
                        onChange={(e) => onUpdateSet(i, "weight", e.target.value)}
                        className="h-11 bg-muted/50 border border-border rounded-lg text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => onUpdateSet(i, "reps", e.target.value)}
                        className="h-11 bg-muted/50 border border-border rounded-lg text-center text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() => onToggleSet(i)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          set.completed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form buttons */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant={formView === "tips" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setFormView(formView === "tips" ? null : "tips")}
                  >
                    <Info className="w-3.5 h-3.5 mr-1" /> Form Tips
                  </Button>
                  <Button
                    variant={formView === "mistakes" ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setFormView(formView === "mistakes" ? null : "mistakes")}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Mistakes
                  </Button>
                </div>

                <a
                  href={exercise.formVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <Play className="w-3.5 h-3.5" /> Watch Form Video
                </a>

                {formView && (
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
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ExerciseSwipeCard;
