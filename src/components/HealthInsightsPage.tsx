import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Droplets, Heart, TrendingUp, ChevronRight, Plus, X, Pill, Flame, Calendar as CalendarIcon, Trash2, BarChart3, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useCycleTracking } from "@/hooks/useCycleTracking";

const MENOPAUSE_SYMPTOMS = [
  "Hot Flashes", "Night Sweats", "Thinning Hair", "Thinning Skin",
  "Mood Swings", "Fatigue", "Joint Pain", "Brain Fog",
  "Insomnia", "Weight Gain", "Dryness", "Anxiety",
];

interface SymptomLog { id: string; symptom: string; intensity: number; notes: string | null; log_date: string; }
interface Medication { id: string; name: string; amount: string; start_date: string; end_date: string | null; active: boolean; side_effects: string | null; }
interface MedicationLog { id: string; medication_id: string; log_date: string; taken: boolean; notes: string | null; }
interface SideEffectLog { id: string; medication_id: string; side_effect: string; intensity: number; log_date: string; notes: string | null; }

const CHART_COLORS = [
  "hsl(263, 70%, 66%)", "hsl(340, 82%, 70%)", "hsl(160, 60%, 40%)",
  "hsl(30, 90%, 60%)", "hsl(200, 70%, 55%)", "hsl(280, 60%, 55%)",
];

const SIDE_EFFECT_COLORS = [
  "hsl(0, 70%, 60%)", "hsl(25, 80%, 55%)", "hsl(50, 70%, 50%)",
  "hsl(180, 60%, 45%)", "hsl(310, 60%, 55%)", "hsl(220, 60%, 60%)",
];

const HealthInsightsPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeSection, setActiveSection] = useState<"calendar" | "cycle">("calendar");
  const [showTrends, setShowTrends] = useState(false);
  const [trendRange, setTrendRange] = useState<"week" | "month">("week");

  // Cycle tracking
  const { periods, cycleInfo, addPeriod, deletePeriod, recommendations, loading: cycleLoading } = useCycleTracking();
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  // Symptom state
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
  const [medStartDate, setMedStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [medEndDate, setMedEndDate] = useState("");
  const [medSideEffects, setMedSideEffects] = useState("");
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([]);

  // Side effect logs
  const [sideEffectLogs, setSideEffectLogs] = useState<SideEffectLog[]>([]);
  const [allSideEffectLogs, setAllSideEffectLogs] = useState<SideEffectLog[]>([]);
  const [showAddSideEffect, setShowAddSideEffect] = useState(false);
  const [seMedId, setSeMedId] = useState("");
  const [seName, setSeName] = useState("");
  const [seIntensity, setSeIntensity] = useState(5);
  const [seNotes, setSeNotes] = useState("");

  const [loggedDates, setLoggedDates] = useState<Set<string>>(new Set());
  const [medLogDates, setMedLogDates] = useState<Set<string>>(new Set());

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch symptoms for selected date
  useEffect(() => {
    if (!user) return;
    setLoadingSymptoms(true);
    supabase.from("menopause_symptoms").select("*").eq("user_id", user.id).eq("log_date", dateStr)
      .then(({ data }) => { if (data) setSymptoms(data as SymptomLog[]); setLoadingSymptoms(false); });
  }, [user, dateStr]);

  // Fetch all symptoms for trends
  useEffect(() => {
    if (!user) return;
    const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
    supabase.from("menopause_symptoms").select("*").eq("user_id", user.id).gte("log_date", since).order("log_date", { ascending: true })
      .then(({ data }) => {
        if (data) { setAllSymptoms(data as SymptomLog[]); setLoggedDates(new Set(data.map((d: any) => d.log_date))); }
      });
  }, [user, symptoms]);

  // Fetch medications + logs + side effect logs
  useEffect(() => {
    if (!user) return;
    setLoadingMeds(true);
    supabase.from("medications").select("*").eq("user_id", user.id).eq("active", true)
      .then(({ data }) => { if (data) setMedications(data as Medication[]); setLoadingMeds(false); });

    const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
    supabase.from("medication_logs").select("*").eq("user_id", user.id).gte("log_date", since)
      .then(({ data }) => {
        if (data) { setMedLogs(data as MedicationLog[]); setMedLogDates(new Set(data.map((d: any) => d.log_date))); }
      });

    supabase.from("side_effect_logs").select("*").eq("user_id", user.id).gte("log_date", since).order("log_date", { ascending: true })
      .then(({ data }) => { if (data) setAllSideEffectLogs(data as SideEffectLog[]); });
  }, [user]);

  // Fetch side effects for selected date
  useEffect(() => {
    if (!user) return;
    supabase.from("side_effect_logs").select("*").eq("user_id", user.id).eq("log_date", dateStr)
      .then(({ data }) => { if (data) setSideEffectLogs(data as SideEffectLog[]); });
  }, [user, dateStr]);

  const dayMedLogs = useMemo(() => medLogs.filter((l) => l.log_date === dateStr), [medLogs, dateStr]);

  // Trend chart data — symptoms + side effects combined
  const trendData = useMemo(() => {
    const now = new Date();
    const range = trendRange === "week"
      ? eachDayOfInterval({ start: startOfWeek(now), end: endOfWeek(now) })
      : eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) });

    const symptomSet = new Set(allSymptoms.map((s) => s.symptom));
    const activeSymptoms = Array.from(symptomSet).slice(0, 6);

    const seSet = new Set(allSideEffectLogs.map((s) => s.side_effect));
    const activeSideEffects = Array.from(seSet).slice(0, 6);

    return {
      activeSymptoms,
      activeSideEffects,
      data: range.map((date) => {
        const ds = format(date, "yyyy-MM-dd");
        const label = format(date, trendRange === "week" ? "EEE" : "d");
        const entry: Record<string, any> = { date: label };
        activeSymptoms.forEach((sym) => {
          const match = allSymptoms.find((s) => s.log_date === ds && s.symptom === sym);
          entry[sym] = match ? match.intensity : null;
        });
        activeSideEffects.forEach((se) => {
          const key = `SE: ${se}`;
          const match = allSideEffectLogs.find((s) => s.log_date === ds && s.side_effect === se);
          entry[key] = match ? match.intensity : null;
        });
        return entry;
      }),
    };
  }, [allSymptoms, allSideEffectLogs, trendRange]);

  const handleAddSymptom = async () => {
    if (!user || !selectedSymptom) return;
    const { data, error } = await supabase.from("menopause_symptoms").insert({ user_id: user.id, log_date: dateStr, symptom: selectedSymptom, intensity, notes: symptomNotes || null }).select().single();
    if (error) { toast.error("Failed to log symptom"); return; }
    setSymptoms((prev) => [...prev, data as SymptomLog]);
    setShowAddSymptom(false); setSelectedSymptom(""); setIntensity(5); setSymptomNotes("");
    toast.success("Symptom logged!");
  };

  const handleDeleteSymptom = async (id: string) => {
    await supabase.from("menopause_symptoms").delete().eq("id", id);
    setSymptoms((prev) => prev.filter((s) => s.id !== id));
    toast.success("Symptom removed");
  };

  const handleAddMedication = async () => {
    if (!user || !medName || !medAmount || !medStartDate) return;
    const { data, error } = await supabase.from("medications").insert({
      user_id: user.id, name: medName, amount: medAmount,
      start_date: medStartDate, end_date: medEndDate || null,
      side_effects: medSideEffects || null
    }).select().single();
    if (error) { toast.error("Failed to add medication"); return; }
    setMedications((prev) => [...prev, data as Medication]);
    setShowAddMed(false); setMedName(""); setMedAmount(""); setMedStartDate(format(new Date(), "yyyy-MM-dd")); setMedEndDate(""); setMedSideEffects("");
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
      const { data } = await supabase.from("medication_logs").insert({ user_id: user.id, medication_id: medId, log_date: dateStr, taken: true }).select().single();
      if (data) setMedLogs((prev) => [...prev, data as MedicationLog]);
    }
  };

  const handleAddSideEffect = async () => {
    if (!user || !seMedId || !seName) return;
    const { data, error } = await supabase.from("side_effect_logs").insert({
      user_id: user.id, medication_id: seMedId, side_effect: seName,
      intensity: seIntensity, log_date: dateStr, notes: seNotes || null
    }).select().single();
    if (error) { toast.error("Failed to log side effect"); return; }
    setSideEffectLogs((prev) => [...prev, data as SideEffectLog]);
    setAllSideEffectLogs((prev) => [...prev, data as SideEffectLog]);
    setShowAddSideEffect(false); setSeMedId(""); setSeName(""); setSeIntensity(5); setSeNotes("");
    toast.success("Side effect logged!");
  };

  const handleDeleteSideEffect = async (id: string) => {
    await supabase.from("side_effect_logs").delete().eq("id", id);
    setSideEffectLogs((prev) => prev.filter((s) => s.id !== id));
    setAllSideEffectLogs((prev) => prev.filter((s) => s.id !== id));
    toast.success("Side effect removed");
  };

  const handleAddPeriod = async () => {
    if (!periodStart) return;
    const { error } = await addPeriod(periodStart, periodEnd || null);
    if (error) { toast.error("Failed to log period"); return; }
    setShowAddPeriod(false); setPeriodStart(""); setPeriodEnd("");
    toast.success("Period logged!");
  };

  const getIntensityColor = (val: number) => val <= 3 ? "text-success" : val <= 6 ? "text-primary" : "text-accent";
  const getIntensityBg = (val: number) => val <= 3 ? "bg-success/10" : val <= 6 ? "bg-primary/10" : "bg-accent/10";

  const getMedName = (medId: string) => medications.find((m) => m.id === medId)?.name ?? "Medication";

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-display font-semibold text-foreground">Health Insights</h1>

      {/* Section Tabs */}
      <div className="flex bg-muted rounded-xl p-1 gap-1">
        {([
          { key: "calendar", icon: CalendarIcon, label: "Menopause" },
          { key: "cycle", icon: Droplets, label: "Cycle" },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={`flex-1 py-2 text-xs font-display font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeSection === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ===== MENOPAUSE CALENDAR ===== */}
        {activeSection === "calendar" && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
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
                  period: (date) => cycleInfo.periodDates.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  logged: "bg-accent/20 font-semibold",
                  medLogged: "ring-2 ring-primary/40",
                  period: "bg-rose/20 font-semibold",
                }}
              />
              <div className="flex items-center gap-4 justify-center mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose/30" /> Period</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-accent/30" /> Symptoms</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm ring-2 ring-primary/40" /> Meds</span>
              </div>
            </div>

            {/* Trend Chart — symptoms + side effects */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Symptom & Side Effect Trends
                </h3>
                <button onClick={() => setShowTrends(!showTrends)} className="text-xs text-primary flex items-center gap-1">
                  {showTrends ? "Hide" : "Show"} <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTrends ? "rotate-90" : ""}`} />
                </button>
              </div>
              <AnimatePresence>
                {showTrends && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex bg-muted rounded-lg p-0.5 mb-4 w-fit">
                      {(["week", "month"] as const).map((r) => (
                        <button key={r} onClick={() => setTrendRange(r)} className={`px-3 py-1 text-xs font-display font-medium rounded-md transition-all ${trendRange === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                          {r === "week" ? "This Week" : "This Month"}
                        </button>
                      ))}
                    </div>
                    {trendData.activeSymptoms.length === 0 && trendData.activeSideEffects.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">Log symptoms or side effects to see trends</p>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={trendData.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215, 14%, 45%)" />
                            <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(215, 14%, 45%)" width={24} />
                            <Tooltip contentStyle={{ background: "hsl(210, 20%, 98%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "12px", fontSize: "11px" }} />
                            {trendData.activeSymptoms.map((sym, i) => (
                              <Line key={sym} type="monotone" dataKey={sym} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                            ))}
                            {trendData.activeSideEffects.map((se, i) => (
                              <Line key={`SE: ${se}`} type="monotone" dataKey={`SE: ${se}`} stroke={SIDE_EFFECT_COLORS[i % SIDE_EFFECT_COLORS.length]} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} connectNulls />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {trendData.activeSymptoms.map((sym, i) => (
                            <span key={sym} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{sym}
                            </span>
                          ))}
                          {trendData.activeSideEffects.map((se, i) => (
                            <span key={se} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <span className="w-2 h-2 rounded-full border border-current" style={{ background: SIDE_EFFECT_COLORS[i % SIDE_EFFECT_COLORS.length] }} />SE: {se}
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
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><Flame className="w-4 h-4 text-accent" /> Symptoms</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(selectedDate, "MMMM d, yyyy")}</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs font-display" onClick={() => setShowAddSymptom(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log
                </Button>
              </div>
              {loadingSymptoms ? (
                <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
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
                        <button onClick={() => handleDeleteSymptom(s.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              <AnimatePresence>
                {showAddSymptom && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-display font-semibold text-foreground">Log a Symptom</p>
                      <button onClick={() => setShowAddSymptom(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {MENOPAUSE_SYMPTOMS.map((s) => (
                        <button key={s} onClick={() => setSelectedSymptom(s)} className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all ${selectedSymptom === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{s}</button>
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
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Mild</span><span>Severe</span></div>
                        </div>
                        <textarea value={symptomNotes} onChange={(e) => setSymptomNotes(e.target.value)} placeholder="Notes (optional)" className="w-full h-16 px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                        <Button onClick={handleAddSymptom} className="w-full h-10 font-display text-sm">Log {selectedSymptom}</Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Medications with inline side effects */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><Pill className="w-4 h-4 text-primary" /> Medications</h3>
                <Button variant="outline" size="sm" className="h-8 text-xs font-display" onClick={() => setShowAddMed(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Add</Button>
              </div>
              {medications.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">{format(selectedDate, "MMM d")} — Tap to mark as taken</p>
                  <div className="space-y-2">
                    {medications.map((m) => {
                      const taken = dayMedLogs.some((l) => l.medication_id === m.id);
                      return (
                        <button key={m.id} onClick={() => handleToggleMedTaken(m.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${taken ? "bg-success/10" : "bg-muted/50"}`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${taken ? "border-success bg-success" : "border-border"}`}>
                            {taken && <Check className="w-3.5 h-3.5 text-success-foreground" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-display font-medium ${taken ? "text-muted-foreground line-through" : "text-foreground"}`}>{m.name}</p>
                            <p className="text-xs text-muted-foreground">{m.amount}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {loadingMeds ? (
                <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
              ) : medications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No medications added yet</p>
              ) : (
                <div className="space-y-3">
                  {medications.map((m) => {
                    const medSE = sideEffectLogs.filter((s) => s.medication_id === m.id);
                    const isAddingSE = showAddSideEffect && seMedId === m.id;
                    return (
                      <div key={m.id} className="p-3 rounded-xl bg-primary/5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-display font-medium text-foreground">{m.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {m.amount} · Started {format(new Date(m.start_date + "T00:00:00"), "MMM d, yyyy")}
                              {m.end_date && ` · Ended ${format(new Date(m.end_date + "T00:00:00"), "MMM d, yyyy")}`}
                            </p>
                          </div>
                          <button onClick={() => handleDeleteMedication(m.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        {m.side_effects && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Known Side Effects</p>
                            <p className="text-xs text-foreground/80 mt-0.5">{m.side_effects}</p>
                          </div>
                        )}

                        {/* Inline side effect logs for this medication */}
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Side Effects — {format(selectedDate, "MMM d")}
                            </p>
                            <button onClick={() => { setShowAddSideEffect(!isAddingSE); setSeMedId(m.id); setSeName(""); setSeIntensity(5); setSeNotes(""); }}
                              className="text-xs text-primary flex items-center gap-0.5">
                              <Plus className="w-3 h-3" /> Log
                            </button>
                          </div>
                          {medSE.length > 0 && (
                            <div className="space-y-1.5 mb-2">
                              {medSE.map((s) => (
                                <div key={s.id} className={`flex items-center justify-between p-2 rounded-lg ${getIntensityBg(s.intensity)}`}>
                                  <div className="flex-1">
                                    <p className="text-xs font-display font-medium text-foreground">{s.side_effect}</p>
                                    {s.notes && <p className="text-[10px] text-muted-foreground">{s.notes}</p>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-display font-bold ${getIntensityColor(s.intensity)}`}>{s.intensity}</span>
                                    <button onClick={() => handleDeleteSideEffect(s.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <AnimatePresence>
                            {isAddingSE && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2 pt-1">
                                <input value={seName} onChange={(e) => setSeName(e.target.value)} placeholder="Side effect (e.g. Nausea)" className="w-full h-9 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] text-muted-foreground">Intensity</p>
                                    <span className={`text-sm font-display font-bold ${getIntensityColor(seIntensity)}`}>{seIntensity}</span>
                                  </div>
                                  <Slider value={[seIntensity]} onValueChange={([v]) => setSeIntensity(v)} min={1} max={10} step={1} className="w-full" />
                                  <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5"><span>1 — Mild</span><span>10 — Severe</span></div>
                                </div>
                                <textarea value={seNotes} onChange={(e) => setSeNotes(e.target.value)} placeholder="Notes (optional)" className="w-full h-12 px-3 py-1.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-[10px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                                <Button onClick={handleAddSideEffect} size="sm" className="w-full h-8 font-display text-xs" disabled={!seName}>Log Side Effect</Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <AnimatePresence>
                {showAddMed && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-display font-semibold text-foreground">Add Medication</p>
                      <button onClick={() => setShowAddMed(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Medication name" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <input value={medAmount} onChange={(e) => setMedAmount(e.target.value)} placeholder="Amount (e.g. 50mg)" className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Start Date *</label>
                        <input type="date" value={medStartDate} onChange={(e) => setMedStartDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                        <input type="date" value={medEndDate} onChange={(e) => setMedEndDate(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <textarea value={medSideEffects} onChange={(e) => setMedSideEffects(e.target.value)} placeholder="Known side effects (optional) — e.g. nausea, headaches" className="w-full h-16 px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                    <Button onClick={handleAddMedication} className="w-full h-10 font-display text-sm" disabled={!medName || !medAmount || !medStartDate}>Add Medication</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ===== CYCLE SECTION ===== */}
        {activeSection === "cycle" && (
          <motion.div key="cycle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="pointer-events-auto mx-auto"
                modifiers={{ period: (date) => cycleInfo.periodDates.has(format(date, "yyyy-MM-dd")) }}
                modifiersClassNames={{ period: "bg-rose/25 font-semibold" }}
              />
              <div className="flex items-center gap-4 justify-center mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose/30" /> Period days</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Cycle Status</h3>
              </div>

              {cycleInfo.currentDay ? (
                <>
                  <div className="relative h-8 rounded-full overflow-hidden bg-muted mb-3">
                    <div className="absolute top-0 h-full gradient-rose opacity-80" style={{ left: "0%", width: `${(5 / cycleInfo.cycleLength) * 100}%` }} />
                    <div className="absolute top-0 h-full gradient-primary opacity-80" style={{ left: `${(5 / cycleInfo.cycleLength) * 100}%`, width: `${(8 / cycleInfo.cycleLength) * 100}%` }} />
                    <div className="absolute top-0 h-full gradient-success opacity-80" style={{ left: `${(13 / cycleInfo.cycleLength) * 100}%`, width: `${(2 / cycleInfo.cycleLength) * 100}%` }} />
                    <div className="absolute top-0 h-full w-0.5 bg-foreground z-10" style={{ left: `${((cycleInfo.currentDay - 1) / cycleInfo.cycleLength) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-display font-semibold text-foreground">{cycleInfo.currentPhase} Phase</p>
                      <p className="text-xs text-muted-foreground">Day {cycleInfo.currentDay} of {cycleInfo.cycleLength}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Next period in</p>
                      <p className="text-sm font-display font-semibold text-accent">{cycleInfo.nextPeriodIn} days</p>
                    </div>
                  </div>

                  {recommendations && (
                    <div className="bg-primary/5 rounded-xl p-3 space-y-1.5">
                      <p className="text-xs font-display font-semibold text-primary">{recommendations.title}</p>
                      <p className="text-xs text-muted-foreground">Training recommendations:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {recommendations.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Log your first period to start tracking your cycle</p>
              )}
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Period History</h3>
                <Button variant="outline" size="sm" className="h-8 text-xs font-display" onClick={() => setShowAddPeriod(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log Period
                </Button>
              </div>

              {periods.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No periods logged yet</p>
              ) : (
                <div className="space-y-2">
                  {periods.slice(0, 6).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-rose/5">
                      <div>
                        <p className="text-sm font-display font-medium text-foreground">
                          {format(new Date(p.start_date + "T00:00:00"), "MMM d")}
                          {p.end_date && ` — ${format(new Date(p.end_date + "T00:00:00"), "MMM d")}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.end_date
                            ? `${Math.ceil((new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / 86400000) + 1} days`
                            : "In progress"}
                        </p>
                      </div>
                      <button onClick={() => deletePeriod(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {showAddPeriod && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-display font-semibold text-foreground">Log Period</p>
                      <button onClick={() => setShowAddPeriod(false)} className="text-muted-foreground"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                        <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                        <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <Button onClick={handleAddPeriod} className="w-full h-10 font-display text-sm" disabled={!periodStart}>Log Period</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthInsightsPage;
