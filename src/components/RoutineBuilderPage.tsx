import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Dumbbell, Target, Home as HomeIcon, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "age" | "goal" | "equipment" | "result";

const goals = [
  { id: "lose-weight", label: "Lose Weight", emoji: "🔥" },
  { id: "build-muscle", label: "Build Muscle", emoji: "💪" },
  { id: "tone-up", label: "Tone & Define", emoji: "✨" },
  { id: "strength", label: "Get Stronger", emoji: "🏋️" },
  { id: "endurance", label: "Improve Endurance", emoji: "🫀" },
];

const equipment = [
  { id: "full-gym", label: "Full Gym", desc: "Machines, cables, free weights", icon: Dumbbell },
  { id: "dumbbells", label: "Dumbbells Only", desc: "Adjustable or fixed dumbbells", icon: Dumbbell },
  { id: "home", label: "At Home", desc: "Bodyweight + minimal equipment", icon: HomeIcon },
  { id: "resistance-bands", label: "Resistance Bands", desc: "Bands and bodyweight", icon: Target },
];

const generatedRoutine = [
  {
    day: "Monday",
    name: "Upper Body Push",
    exercises: ["Dumbbell Bench Press 3×12", "Shoulder Press 3×10", "Tricep Dips 3×12", "Lateral Raises 3×15"],
  },
  {
    day: "Tuesday",
    name: "Lower Body",
    exercises: ["Barbell Squats 4×10", "Romanian Deadlift 3×12", "Hip Thrusts 3×12", "Walking Lunges 3×10"],
  },
  {
    day: "Wednesday",
    name: "Rest / Light Cardio",
    exercises: ["20 min walk", "Stretching", "Foam rolling"],
  },
  {
    day: "Thursday",
    name: "Upper Body Pull",
    exercises: ["Lat Pulldown 3×12", "Seated Row 3×12", "Bicep Curls 3×12", "Face Pulls 3×15"],
  },
  {
    day: "Friday",
    name: "Glutes & Core",
    exercises: ["Hip Thrusts 4×10", "Cable Kickbacks 3×12", "Plank 3×45s", "Dead Bug 3×10"],
  },
];

const RoutineBuilderPage = () => {
  const [step, setStep] = useState<Step>("age");
  const [age, setAge] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");

  const steps: Step[] = ["age", "goal", "equipment", "result"];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const goNext = () => {
    const next = steps[currentIndex + 1];
    if (next) setStep(next);
  };

  const goBack = () => {
    const prev = steps[currentIndex - 1];
    if (prev) setStep(prev);
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {currentIndex > 0 && step !== "result" ? (
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div />
          )}
          <span className="text-xs text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "age" && (
          <motion.div key="age" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">How old are you?</h2>
              <p className="text-sm text-muted-foreground mt-1">This helps us tailor intensity and recovery</p>
            </div>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full h-14 text-center text-2xl font-display bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            />
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!age}>
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === "goal" && (
          <motion.div key="goal" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">What's your goal?</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose what matters most to you right now</p>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                    selectedGoal === goal.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="font-display font-medium text-foreground">{goal.label}</span>
                  {selectedGoal === goal.id && <Check className="w-5 h-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!selectedGoal}>
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === "equipment" && (
          <motion.div key="equipment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">What equipment do you have?</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll build your routine around this</p>
            </div>
            <div className="space-y-3">
              {equipment.map((eq) => {
                const Icon = eq.icon;
                return (
                  <button
                    key={eq.id}
                    onClick={() => setSelectedEquipment(eq.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      selectedEquipment === eq.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-medium text-foreground">{eq.label}</p>
                      <p className="text-xs text-muted-foreground">{eq.desc}</p>
                    </div>
                    {selectedEquipment === eq.id && <Check className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!selectedEquipment}>
              Generate My Routine <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-display font-semibold text-foreground">Your Routine is Ready! 🎉</h2>
              <p className="text-sm text-muted-foreground mt-1">5-day split tailored to your goals</p>
            </div>
            {generatedRoutine.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary">{day.day}</span>
                  <span className="font-display font-semibold text-sm text-foreground">{day.name}</span>
                </div>
                <div className="space-y-1">
                  {day.exercises.map((ex, j) => (
                    <p key={j} className="text-sm text-muted-foreground">{ex}</p>
                  ))}
                </div>
              </motion.div>
            ))}
            <Button variant="hero" className="w-full h-12 font-display mt-4" onClick={() => setStep("age")}>
              Start Over
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutineBuilderPage;
