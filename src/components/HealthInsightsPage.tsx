import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Droplets, Heart, TrendingUp, ChevronRight, Plus, X, Pill, Flame, Calendar as CalendarIcon, Trash2, BarChart3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MENOPAUSE_SYMPTOMS = [
  "Hot Flashes",
  "Night Sweats",
  "Thinning Hair",
  "Thinning Skin",
  "Mood Swings",
  "Fatigue",
  "Joint Pain",
  "Brain Fog",
  "Insomnia",
  "Weight Gain",
  "Dryness",
  "Anxiety",
];

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

interface SymptomLog {
  id: string;
  symptom: string;
  intensity: number;
  notes: string | null;
  log_date: string;
}

interface Medication {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  active: boolean;
  side_effects: string | null;
}

interface MedicationLog {
  id: string;
  medication_id: string;
  log_date: string;
  taken: boolean;
  notes: string | null;
}

const CHART_COLORS = [
  "hsl(263, 70%, 66%)",  // primary
  "hsl(340, 82%, 70%)",  // accent
  "hsl(160, 60%, 40%)",  // success
  "hsl(30, 90%, 60%)",   // orange
  "hsl(200, 70%, 55%)",  // blue
  "hsl(280, 60%, 55%)",  // purple
];

const HealthInsightsPage = () => {
  const { user } = useAuth();
  const [showCycleDetail, setShowCycleDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeSection, setActiveSection] = useState<"calendar" | "cycle" | "sleep">("calendar");
  const [showTrends, setShowTrends] = useState(false);
  const [trendRange, setTrendRange] = useState<"week" | "month">("week");

  // Symptom logging state
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [allSymptoms, setAllSymptoms] = useState<SymptomLog[]>([]);
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [symptomNotes, setSymptomNotes] = useState("");
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);

  // Medication state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState("");
  const [medAmount, setMedAmount] = useState("");
  const [medFrequency, setMedFrequency] = useState("");
  const [medSideEffects, setMedSideEffects] = useState("");
  const [loadingMeds, setLoadingMeds] = useState(false);

  // Medication logs for calendar
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([]);

  // Dates that have symptom logs or med logs
  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [medLogDates, setMedLogDates] = useState<Set<string>>(new Set());

  const currentCycleDay = 8;
  const currentPhase = "Follicular";
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch symptoms for selected date
  useEffect(() => {
    if (!user) return;
    setLoadingSymptoms(true);
    supabase
      .from("menopause_symptoms")
      .select("*")
      .eq("user_id", user.id)
      .eq("log_date", dateStr)
      .then(({ data, error }) => {
        if (!error && data) setSymptoms(data as SymptomLog[]);
        setLoadingSymptoms(false);
      });
  }, [user, dateStr]);

  // Fetch all symptoms for trends (last 90 days)
  useEffect(() => {
    if (!user) return;
    const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
    supabase
      .from("menopause_symptoms")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", since)
      .order("log_date", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setAllSymptoms(data as SymptomLog[]);
          setLoggedDates(new Set(data.map((d: any) => d.log_date)));
        }
      });
  }, [user, symptoms]);

  // Fetch medications
  useEffect(() => {
    if (!user) return;
    setLoadingMeds(true);
    supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .then(({ data, error }) => {
        if (!error && data) setMedications(data as Medication[]);
        setLoadingMeds(false);
      });
  }, [user]);

  // Fetch medication logs for calendar
  useEffect(() => {
    if (!user) return;
    const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
    supabase
      .from("medication_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", since)
      .then(({ data }) => {
        if (data) {
          setMedLogs(data as MedicationLog[]);
          setMedLogDates(new Set(data.map((d: any) => d.log_date)));
        }
      });
  }, [user]);

  // Medication logs for selected date
  const dayMedLogs = useMemo(() => medLogs.filter((l) => l.log_date === dateStr), [medLogs, dateStr]);

  // Build trend chart data
  const trendData = useMemo(() => {
    const now = new Date();
    const range =
      trendRange === "week"
        ? eachDayOfInterval({ start: startOfWeek(now), end: endOfWeek(now) })
        : eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });

    // Get unique symptoms present in the data
    const symptomSet = new Set(allSymptoms.map((s) => s.symptom));
    const activeSymptoms = Array.from(symptomSet).slice(0, 6); // max 6 lines

    return {
      activeSymptoms,
      data: range.map((date) => {
        const ds = format(date, "yyyy-MM-dd");
        const label = format(date, trendRange === "week" ? "EEE" : "d");
        const entry: Record<string, any> = { date: label };
        activeSymptoms.forEach((sym) => {
          const match = allSymptoms.find((s) => s.log_date === ds && s.symptom === sym);
          entry[sym] = match ? match.intensity : null;
        });
        return entry;
      }),
    };
  }, [allSymptoms, trendRange]);

  const handleAddSymptom = async () => {
    if (!user || !selectedSymptom) return;
    const { data, error } = await supabase
      .from("menopause_symptoms")
      .insert({ user_id: user.id, log_date: dateStr, symptom: selectedSymptom, intensity, notes: symptomNotes || null })
      .select()
      .single();
    if (error) { toast.error("Failed to log symptom"); return; }
    setSymptoms((prev) => [...prev, data as SymptomLog]);
    setShowAddSymptom(false);
    setSelectedSymptom("");
    setIntensity(5);
    setSymptomNotes("");
    toast.success("Symptom logged!");
  };

  const handleDeleteSymptom = async (id: string) => {
    await supabase.from("menopause_symptoms").delete().eq("id", id);
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
    toast.success("Symptom removed");
  };

  const handleAddMedication = async () => {
    if (!user || !medName || !medAmount || !medFrequency) return;
    const { data, error } = await supabase
      .from("medications")
      .insert({ user_id: user.id, name: medName, amount: medAmount, frequency: medFrequency, side_effects: medSideEffects || null })
      .select()
      .single();
    if (error) { toast.error("Failed to add medication"); return; }
    setMedications((prev) => [...prev, data as Medication]);
    setShowAddMed(false);
    setMedName("");
    setMedAmount("");
    setMedFrequency("");
    setMedSideEffects("");
    toast.success("Medication added!");
  };

  const handleDeleteMedication = async (id: string) => {
    await supabase.from("medications").delete().eq("id", id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    toast.success("Medication removed");
  };

  const handleToggleMedTaken = async (medId: string) => {
    if (!user) return;
    const existing = dayMedLogs.find((l) => l.medication_id === medId);
    if (existing) {
      await supabase.from("medication_logs").delete().eq("id", existing.id);
      setMedLogs((prev) => prev.filter((l) => l.id !== existing.id));
    } else {
      const { data } = await supabase
        .from("medication_logs")
        .insert({ user_id: user.id, medication_id: medId, log_date: dateStr, taken: true })
        .select()
        .single();
      if (data) setMedLogs((prev) => [...prev, data as MedicationLog]);
    }
  };

  const getIntensityColor = (val: number) => {
    if (val <= 3) return "text-success";
    if (val <= 6) return "text-primary";
    return "text-accent";
  };

  const getIntensityBg = (val: number) => {
    if (val <= 3) return "bg-success/10";
    if (val <= 6) return "bg-primary/10";
    return "bg-accent/10";
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-display font-semibold text-foreground">Health Insights</h1>

      {/* Section Tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {([
          { key: "calendar", icon: CalendarIcon, label: "Menopause" },
          { key: "cycle", icon: Droplets, label: "Cycle" },
          { key: "sleep", icon: Moon, label: "Sleep" },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex-1 py-2 text-xs font-display font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSection === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== MENOPAUSE CALENDAR SECTION ===== */}
        {activeSection === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Calendar */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="pointer-events-auto mx-auto"
                modifiers={{
                  logged: (date) => loggedDates.has(format(date, "yyyy-MM-dd")),
                  medLogged: (date) => medLogDates.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  logged: "bg-accent/20 font-semibold",
                  medLogged: "ring-2 ring-primary/40",
                }}
              />
              <div className="flex items-center gap-4 justify-center mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/30" /> Symptoms</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm ring-2 ring-primary/40" /> Meds taken</span>
              </div>
            </div>

            {/* Trend Chart Toggle */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Symptom Trends
                </h3>
                <button
                  onClick={() => setShowTrends(!showTrends)}
                  className="text-xs text-primary flex items-center gap-1"
                >
                  {showTrends ? "Hide" : "Show"} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTrends ? "rotate-90" : ""}`} />
                </button>
              </div>

              <AnimatePresence>
                {showTrends && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {/* Range toggle */}
                    <div className="flex bg-muted rounded-lg p-0.5 mb-4 w-fit">
                      {(["week", "month"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setTrendRange(r)}
                          className={`px-3 py-1 text-xs font-display font-medium rounded-md transition-all ${
                            trendRange === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                          }`}
                        >
                          {r === "week" ? "This Week" : "This Month"}
                        </button>
                      ))}
                    </div>

                    {trendData.activeSymptoms.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">Log symptoms to see trends</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={trendData.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215, 14%, 45%)" />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(215, 14%, 45%)" width={24} />
                            <Tooltip
                              contentStyle={{
                                background: "hsl(210, 20%, 98%)",
                                border: "1px solid hsl(220, 13%, 91%)",
                                borderRadius: "12px",
                                fontSize: "11px",
                              }}
                            />
                            {trendData.activeSymptoms.map((sym, i) => (
                              <Line
                                key={sym}
                                type="monotone"
                                dataKey={sym}
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                connectNulls
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {trendData.activeSymptoms.map((sym, i) => (
                            <span key={sym} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              {sym}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Symptoms for selected date */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Flame className="w-4 h-4 text-accent" />
                    Symptoms
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs font-display" onClick={() => setShowAddSymptom(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log
                </Button>
              </div>

              {loadingSymptoms ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : symptoms.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No symptoms logged for this day</p>
              ) : (
                <div className="space-y-2">
                  {symptoms.map((s) => (
                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`flex items-center justify-between p-3 rounded-xl ${getIntensityBg(s.intensity)}`}>
                      <div className="flex-1">
                        <p className="text-sm font-display font-medium text-foreground">{s.symptom}</p>
                        {s.notes && <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-display font-bold ${getIntensityColor(s.intensity)}`}>{s.intensity}</span>
                        <button onClick={() => handleDeleteSymptom(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Symptom Sheet */}
              <AnimatePresence>
                {showAddSymptom && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-display font-semibold text-foreground">Log a Symptom</p>
                      <button onClick={() => setShowAddSymptom(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {MENOPAUSE_SYMPTOMS.map((s) => (
                        <button key={s} onClick={() => setSelectedSymptom(s)} className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all ${selectedSymptom === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {selectedSymptom && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs text-muted-foreground">Intensity</p>
                            <span className={`text-xl font-display font-bold ${getIntensityColor(intensity)}`}>{intensity}</span>
                          </div>
                          <Slider value={[intensity]} onValueChange={([v]) => setIntensity(v)} min={1} max={10} step={1} className="w-full" />
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span>Mild</span><span>Severe</span>
                          </div>
                        </div>
                        <textarea value={symptomNotes} onChange={(e) => setSymptomNotes(e.target.value)} placeholder="Notes (optional)" className="w-full h-16 px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                        <Button onClick={handleAddSymptom} className="w-full h-10 font-display text-sm">Log {selectedSymptom}</Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Medications Section */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  Medications
                </h3>
                <Button variant="outline" size="sm" className="h-8 text-xs font-display" onClick={() => setShowAddMed(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Today's medication checklist */}
              {medications.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    {format(selectedDate, "MMM d")} — Tap to mark as taken
                  </p>
                  <div className="space-y-2">
                    {medications.map((m) => {
                      const taken = dayMedLogs.some((l) => l.medication_id === m.id);
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleToggleMedTaken(m.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                            taken ? "bg-success/10" : "bg-muted/50"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            taken ? "border-success bg-success" : "border-border"
                          }`}>
                            {taken && <Check className="w-3.5 h-3.5 text-success-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-display font-medium ${taken ? "text-muted-foreground line-through" : "text-foreground"}`}>
                              {m.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{m.amount} · {m.frequency}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Medication list with details */}
              {loadingMeds ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : medications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No medications added yet</p>
              ) : (
                <div className="space-y-2">
                  {medications.map((m) => (
                    <div key={m.id} className="p-3 rounded-xl bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-display font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.amount} · {m.frequency}</p>
                        </div>
                        <button onClick={() => handleDeleteMedication(m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {m.side_effects && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Side Effects</p>
                          <p className="text-xs text-foreground/80 mt-0.5">{m.side_effects}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Medication Form */}
              <AnimatePresence>
                {showAddMed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-display font-semibold text-foreground">Add Medication</p>
                      <button onClick={() => setShowAddMed(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Medication name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={medAmount} onChange={(e) => setMedAmount(e.target.value)} placeholder="Amount (e.g. 50mg)" className="h-10 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      <input value={medFrequency} onChange={(e) => setMedFrequency(e.target.value)} placeholder="Frequency (e.g. Daily)" className="h-10 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <textarea
                      value={medSideEffects}
                      onChange={(e) => setMedSideEffects(e.target.value)}
                      placeholder="Side effects (optional) — e.g. nausea, headaches, dizziness"
                      className="w-full h-16 px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <Button onClick={handleAddMedication} className="w-full h-10 font-display text-sm" disabled={!medName || !medAmount || !medFrequency}>
                      Add Medication
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ===== CYCLE SECTION ===== */}
        {activeSection === "cycle" && (
          <motion.div key="cycle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Cycle Tracking</h3>
              </div>
              <button onClick={() => setShowCycleDetail(!showCycleDetail)} className="text-xs text-primary flex items-center gap-1">
                Details <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCycleDetail ? "rotate-90" : ""}`} />
              </button>
            </div>
            <div className="relative h-8 rounded-full overflow-hidden bg-muted mb-3">
              {cycleData.map((phase, i) => {
                const colors: Record<string, string> = { Menstrual: "gradient-rose", Follicular: "gradient-primary", Ovulation: "gradient-success", Luteal: "bg-muted-foreground/30" };
                const width = (phase.length / 28) * 100;
                const left = ((phase.day - 1) / 28) * 100;
                return <div key={i} className={`absolute top-0 h-full ${colors[phase.phase]} opacity-80`} style={{ left: `${left}%`, width: `${width}%` }} />;
              })}
              <div className="absolute top-0 h-full w-0.5 bg-foreground z-10" style={{ left: `${((currentCycleDay - 1) / 28) * 100}%` }} />
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-border space-y-3">
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
        )}

        {/* ===== SLEEP SECTION ===== */}
        {activeSection === "sleep" && (
          <motion.div key="sleep" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Sleep Score</h3>
                <span className="ml-auto text-2xl font-display font-semibold text-foreground">82</span>
              </div>
              <div className="flex items-end gap-2 h-24 mb-3">
                {sleepHistory.map((day, i) => {
                  const height = (day.score / 100) * 100;
                  const color = day.score >= 80 ? "gradient-primary" : day.score >= 60 ? "bg-primary/40" : "bg-muted-foreground/30";
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.05, duration: 0.4 }} className={`w-full rounded-t-md ${color}`} />
                      <span className="text-[10px] text-muted-foreground">{day.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg: 7.5 hrs</span>
                <span>Best: 8.5 hrs (Sat)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthInsightsPage;
