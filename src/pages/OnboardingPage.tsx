import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Calendar, Sparkles } from "lucide-react";
import MeasurementsStep from "@/components/onboarding/MeasurementsStep";

type Step = "birthday" | "measurements" | "gender" | "goals" | "frequency" | "equipment" | "targets";

const genderOptions = [
  { id: "woman", label: "Woman", emoji: "👩" },
  { id: "non-binary", label: "Non-binary", emoji: "🌈" },
  { id: "prefer-not-to-say", label: "Prefer not to say", emoji: "🤍" },
];

const goalOptions = [
  { id: "lose-weight", label: "Lose Weight", emoji: "🔥" },
  { id: "build-muscle", label: "Build Muscle", emoji: "💪" },
  { id: "tone-up", label: "Tone & Define", emoji: "✨" },
  { id: "get-stronger", label: "Get Stronger", emoji: "🏋️" },
  { id: "improve-endurance", label: "Improve Endurance", emoji: "🫀" },
  { id: "flexibility", label: "Improve Flexibility", emoji: "🧘" },
  { id: "stress-relief", label: "Stress Relief", emoji: "🧠" },
];

const frequencyOptions = [
  { id: 2, label: "2 days/week", desc: "Light & steady" },
  { id: 3, label: "3 days/week", desc: "Balanced routine" },
  { id: 4, label: "4 days/week", desc: "Committed" },
  { id: 5, label: "5 days/week", desc: "Serious training" },
  { id: 6, label: "6+ days/week", desc: "Elite level" },
];

const durationOptions = [
  { id: 20, label: "20 min", desc: "Quick & efficient" },
  { id: 30, label: "30 min", desc: "Short sessions" },
  { id: 45, label: "45 min", desc: "Standard" },
  { id: 60, label: "60 min", desc: "Full workout" },
  { id: 90, label: "90 min", desc: "Extended" },
];

const equipmentOptions = [
  { id: "full-gym", label: "Full Gym", emoji: "🏋️", desc: "Machines, cables, free weights" },
  { id: "dumbbells", label: "Dumbbells", emoji: "🏠", desc: "Adjustable or fixed dumbbells" },
  { id: "resistance-bands", label: "Resistance Bands", emoji: "🪢", desc: "Bands and bodyweight" },
  { id: "kettlebells", label: "Kettlebells", emoji: "🔔", desc: "Kettlebell training" },
  { id: "barbell", label: "Barbell & Rack", emoji: "🏗️", desc: "Barbell, plates, squat rack" },
  { id: "bodyweight", label: "Bodyweight Only", emoji: "🤸", desc: "No equipment needed" },
];

const targetOptions = [
  { id: "full-body", label: "Full Body", emoji: "🏃‍♀️" },
  { id: "upper-body", label: "Upper Body", emoji: "💪" },
  { id: "lower-body", label: "Lower Body", emoji: "🦵" },
  { id: "core", label: "Core & Abs", emoji: "🎯" },
  { id: "glutes", label: "Glutes", emoji: "🍑" },
  { id: "back", label: "Back & Posture", emoji: "🧍‍♀️" },
];

const OnboardingPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("birthday");
  const [birthday, setBirthday] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [gender, setGender] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const steps: Step[] = ["birthday", "measurements", "gender", "goals", "frequency", "equipment", "targets"];
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

  const toggleGoal = (id: string) => {
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const toggleTarget = (id: string) => {
    setTargets((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const toggleEquipment = (id: string) => {
    setEquipment((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          birthday,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          gender,
          goals,
          workout_frequency: frequency,
          workout_duration: duration,
          equipment,
          target_areas: targets,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("You're all set! Let's go 🎉");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const slideIn = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  return (
    <div className="min-h-screen bg-background px-4 pt-8 pb-24 max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {currentIndex > 0 ? (
            <button onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : <div />}
          <span className="text-xs text-muted-foreground">Step {currentIndex + 1} of {steps.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Birthday */}
        {step === "birthday" && (
          <motion.div key="birthday" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">When's your birthday? 🎂</h2>
              <p className="text-sm text-muted-foreground mt-1">This helps us tailor intensity and recovery</p>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full h-14 pl-10 pr-4 text-base bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!birthday}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Height & Weight */}
        {step === "measurements" && (
          <motion.div key="measurements" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Your measurements 📏</h2>
              <p className="text-sm text-muted-foreground mt-1">Helps us calculate calorie needs and track progress</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-display font-semibold text-foreground mb-2 block">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 165"
                    className="w-full h-14 pl-10 pr-4 text-base bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-display font-semibold text-foreground mb-2 block">Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 62"
                    className="w-full h-14 pl-10 pr-4 text-base bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!heightCm || !weightKg}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Gender */}
        {step === "gender" && (
          <motion.div key="gender" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">How do you identify?</h2>
              <p className="text-sm text-muted-foreground mt-1">Helps us customize cycle and health tracking</p>
            </div>
            <div className="space-y-3">
              {genderOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGender(opt.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                    gender === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-display font-medium text-foreground">{opt.label}</span>
                  {gender === opt.id && <Check className="w-5 h-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!gender}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Goals */}
        {step === "goals" && (
          <motion.div key="goals" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">What are your goals? 🎯</h2>
              <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
            </div>
            <div className="space-y-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                    goals.includes(goal.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="font-display font-medium text-foreground">{goal.label}</span>
                  {goals.includes(goal.id) && <Check className="w-5 h-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={goals.length === 0}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Frequency & Duration */}
        {step === "frequency" && (
          <motion.div key="frequency" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">How often & how long? ⏱️</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll build your routine around your schedule</p>
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-foreground mb-3">Days per week</p>
              <div className="grid grid-cols-3 gap-2">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFrequency(opt.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      frequency === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <p className="font-display font-semibold text-foreground text-sm">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-foreground mb-3">Session length</p>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDuration(opt.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      duration === opt.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <p className="font-display font-semibold text-foreground text-sm">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={!frequency || !duration}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Equipment */}
        {step === "equipment" && (
          <motion.div key="equipment" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">What equipment do you have? 🏋️</h2>
              <p className="text-sm text-muted-foreground mt-1">Select all that you have access to</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {equipmentOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleEquipment(opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    equipment.includes(opt.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="font-display font-medium text-foreground text-sm">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground text-center">{opt.desc}</span>
                  {equipment.includes(opt.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <Button variant="hero" className="w-full h-12 font-display" onClick={goNext} disabled={equipment.length === 0}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {/* Target Areas */}
        {step === "targets" && (
          <motion.div key="targets" {...slideIn} className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground">Target areas? 💥</h2>
              <p className="text-sm text-muted-foreground mt-1">Select all areas you want to focus on</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {targetOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleTarget(opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    targets.includes(opt.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="font-display font-medium text-foreground text-sm">{opt.label}</span>
                  {targets.includes(opt.id) && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
            <Button
              variant="hero"
              className="w-full h-12 font-display"
              onClick={handleFinish}
              disabled={targets.length === 0 || saving}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Let's Go!
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
