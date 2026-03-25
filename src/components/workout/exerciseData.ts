export interface ExerciseData {
  id: string;
  name: string;
  targetMuscles: string[];
  bodyArea: string;
  equipment: string[];
  formTips: string[];
  commonMistakes: string[];
  formVideoUrl: string;
  defaultSets: { weight: string; reps: string }[];
}

export const exerciseDatabase: ExerciseData[] = [
  // CHEST
  {
    id: "db-bench", name: "Dumbbell Bench Press", targetMuscles: ["Chest", "Triceps", "Front Delts"], bodyArea: "chest",
    equipment: ["dumbbells", "full-gym"], defaultSets: [{ weight: "12", reps: "12" }, { weight: "12", reps: "12" }, { weight: "14", reps: "10" }],
    formTips: ["Keep shoulder blades retracted", "Feet flat on the floor", "Lower to chest level, elbows ~45°", "Press up and slightly inward"],
    commonMistakes: ["Flaring elbows to 90°", "Arching lower back excessively", "Bouncing dumbbells off chest", "No eccentric control"],
    formVideoUrl: "https://www.youtube.com/results?search_query=dumbbell+bench+press+form+women",
  },
  {
    id: "push-ups", name: "Push-Ups", targetMuscles: ["Chest", "Triceps", "Core"], bodyArea: "chest",
    equipment: ["bodyweight", "resistance-bands", "dumbbells", "kettlebells", "barbell", "full-gym"], defaultSets: [{ weight: "0", reps: "12" }, { weight: "0", reps: "12" }, { weight: "0", reps: "10" }],
    formTips: ["Hands shoulder-width apart", "Body in a straight line", "Lower until chest nearly touches floor", "Core engaged throughout"],
    commonMistakes: ["Sagging hips", "Flaring elbows wide", "Not going low enough", "Looking up instead of neutral neck"],
    formVideoUrl: "https://www.youtube.com/results?search_query=push+up+form+women",
  },
  {
    id: "cable-fly", name: "Cable Chest Fly", targetMuscles: ["Chest", "Front Delts"], bodyArea: "chest",
    equipment: ["full-gym"], defaultSets: [{ weight: "8", reps: "15" }, { weight: "8", reps: "15" }, { weight: "10", reps: "12" }],
    formTips: ["Slight bend in elbows", "Squeeze at the center", "Control the return", "Lean slightly forward"],
    commonMistakes: ["Straightening arms completely", "Using too much weight", "Rushing the movement", "Not feeling the stretch"],
    formVideoUrl: "https://www.youtube.com/results?search_query=cable+chest+fly+form",
  },
  // SHOULDERS
  {
    id: "shoulder-press", name: "Shoulder Press", targetMuscles: ["Front Delts", "Side Delts", "Triceps"], bodyArea: "shoulders",
    equipment: ["dumbbells", "full-gym", "barbell"], defaultSets: [{ weight: "8", reps: "12" }, { weight: "8", reps: "12" }, { weight: "10", reps: "10" }],
    formTips: ["Start at shoulder height", "Press straight up", "Core tight to prevent arching", "Full lockout at top"],
    commonMistakes: ["Leaning back too much", "Not full ROM", "Flaring elbows forward", "Going too heavy"],
    formVideoUrl: "https://www.youtube.com/results?search_query=dumbbell+shoulder+press+form",
  },
  {
    id: "lateral-raises", name: "Lateral Raises", targetMuscles: ["Side Delts"], bodyArea: "shoulders",
    equipment: ["dumbbells", "resistance-bands", "full-gym"], defaultSets: [{ weight: "4", reps: "15" }, { weight: "4", reps: "15" }, { weight: "6", reps: "12" }],
    formTips: ["Slight bend in elbows", "Raise to shoulder height", "Lead with elbows, not hands", "Slow controlled descent"],
    commonMistakes: ["Swinging the weight", "Raising too high", "Using momentum", "Shrugging shoulders up"],
    formVideoUrl: "https://www.youtube.com/results?search_query=lateral+raise+form+women",
  },
  {
    id: "band-pull-apart", name: "Band Pull-Apart", targetMuscles: ["Rear Delts", "Upper Back"], bodyArea: "shoulders",
    equipment: ["resistance-bands", "bodyweight"], defaultSets: [{ weight: "0", reps: "20" }, { weight: "0", reps: "20" }, { weight: "0", reps: "15" }],
    formTips: ["Arms straight in front", "Pull band apart to chest", "Squeeze shoulder blades", "Keep shoulders down"],
    commonMistakes: ["Bending elbows too much", "Shrugging shoulders", "Not enough range", "Rushing reps"],
    formVideoUrl: "https://www.youtube.com/results?search_query=band+pull+apart+form",
  },
  // BACK
  {
    id: "cable-row", name: "Seated Cable Row", targetMuscles: ["Lats", "Rhomboids", "Biceps"], bodyArea: "back",
    equipment: ["full-gym"], defaultSets: [{ weight: "20", reps: "12" }, { weight: "20", reps: "12" }, { weight: "22", reps: "10" }],
    formTips: ["Sit tall with slight lean", "Pull to lower chest", "Squeeze shoulder blades", "Control the return"],
    commonMistakes: ["Using momentum", "Rounding lower back", "Pulling with arms only", "Shrugging shoulders"],
    formVideoUrl: "https://www.youtube.com/results?search_query=seated+cable+row+form",
  },
  {
    id: "db-row", name: "Dumbbell Row", targetMuscles: ["Lats", "Rhomboids", "Biceps"], bodyArea: "back",
    equipment: ["dumbbells", "full-gym", "kettlebells"], defaultSets: [{ weight: "10", reps: "12" }, { weight: "10", reps: "12" }, { weight: "12", reps: "10" }],
    formTips: ["Flat back, hinge at hips", "Pull to hip", "Squeeze at top", "Control the negative"],
    commonMistakes: ["Rounding the back", "Rotating torso", "Using momentum", "Not enough range"],
    formVideoUrl: "https://www.youtube.com/results?search_query=dumbbell+row+form+women",
  },
  {
    id: "band-row", name: "Resistance Band Row", targetMuscles: ["Lats", "Rhomboids", "Biceps"], bodyArea: "back",
    equipment: ["resistance-bands", "bodyweight"], defaultSets: [{ weight: "0", reps: "15" }, { weight: "0", reps: "15" }, { weight: "0", reps: "12" }],
    formTips: ["Anchor band at chest height", "Pull elbows back", "Squeeze shoulder blades", "Controlled return"],
    commonMistakes: ["Not enough tension", "Shrugging shoulders", "Pulling with wrists", "Rushing"],
    formVideoUrl: "https://www.youtube.com/results?search_query=resistance+band+row+form",
  },
  // BICEPS
  {
    id: "bicep-curls", name: "Bicep Curls", targetMuscles: ["Biceps", "Forearms"], bodyArea: "arms",
    equipment: ["dumbbells", "barbell", "full-gym", "resistance-bands"], defaultSets: [{ weight: "6", reps: "15" }, { weight: "6", reps: "15" }, { weight: "8", reps: "12" }],
    formTips: ["Elbows pinned at sides", "Supinate wrists at top", "Slow lowering 2-3s", "If swinging, go lighter"],
    commonMistakes: ["Swinging hips", "Moving elbows forward", "Not fully extending", "Too fast eccentric"],
    formVideoUrl: "https://www.youtube.com/results?search_query=bicep+curl+form+women",
  },
  {
    id: "tricep-dips", name: "Tricep Dips", targetMuscles: ["Triceps", "Chest", "Shoulders"], bodyArea: "arms",
    equipment: ["bodyweight", "full-gym"], defaultSets: [{ weight: "0", reps: "12" }, { weight: "0", reps: "12" }, { weight: "0", reps: "10" }],
    formTips: ["Hands on edge, fingers forward", "Lower until 90° bend", "Press through palms", "Keep body close to bench"],
    commonMistakes: ["Going too low", "Flaring elbows out", "Shrugging shoulders", "Not full extension"],
    formVideoUrl: "https://www.youtube.com/results?search_query=tricep+dips+form+women",
  },
  {
    id: "hammer-curls", name: "Hammer Curls", targetMuscles: ["Biceps", "Brachialis", "Forearms"], bodyArea: "arms",
    equipment: ["dumbbells", "full-gym"], defaultSets: [{ weight: "6", reps: "12" }, { weight: "6", reps: "12" }, { weight: "8", reps: "10" }],
    formTips: ["Neutral grip (palms face each other)", "Elbows stay pinned", "Controlled movement", "Full range of motion"],
    commonMistakes: ["Swinging body", "Moving elbows", "Going too fast", "Partial reps"],
    formVideoUrl: "https://www.youtube.com/results?search_query=hammer+curl+form",
  },
  // LEGS
  {
    id: "squats", name: "Barbell Squats", targetMuscles: ["Quads", "Glutes", "Hamstrings"], bodyArea: "legs",
    equipment: ["barbell", "full-gym"], defaultSets: [{ weight: "30", reps: "10" }, { weight: "30", reps: "10" }, { weight: "35", reps: "8" }],
    formTips: ["Feet shoulder-width apart", "Break at hips and knees together", "Knees track over toes", "Chest up throughout"],
    commonMistakes: ["Knees caving in", "Rising on toes", "Rounding lower back", "Not going deep enough"],
    formVideoUrl: "https://www.youtube.com/results?search_query=barbell+squat+form+women",
  },
  {
    id: "goblet-squat", name: "Goblet Squat", targetMuscles: ["Quads", "Glutes", "Core"], bodyArea: "legs",
    equipment: ["dumbbells", "kettlebells", "bodyweight"], defaultSets: [{ weight: "10", reps: "12" }, { weight: "10", reps: "12" }, { weight: "12", reps: "10" }],
    formTips: ["Hold weight at chest", "Elbows between knees at bottom", "Chest proud", "Drive through heels"],
    commonMistakes: ["Leaning forward", "Knees caving", "Not deep enough", "Rounding back"],
    formVideoUrl: "https://www.youtube.com/results?search_query=goblet+squat+form+women",
  },
  {
    id: "rdl", name: "Romanian Deadlift", targetMuscles: ["Hamstrings", "Glutes", "Lower Back"], bodyArea: "legs",
    equipment: ["dumbbells", "barbell", "kettlebells", "full-gym"], defaultSets: [{ weight: "15", reps: "12" }, { weight: "15", reps: "12" }, { weight: "18", reps: "10" }],
    formTips: ["Slight knee bend", "Hinge at hips, push them back", "Bar close to legs", "Feel hamstring stretch"],
    commonMistakes: ["Rounding the back", "Bending knees too much", "Bar drifting forward", "Not hinging enough"],
    formVideoUrl: "https://www.youtube.com/results?search_query=romanian+deadlift+form+women",
  },
  {
    id: "lunges", name: "Walking Lunges", targetMuscles: ["Quads", "Glutes", "Hamstrings"], bodyArea: "legs",
    equipment: ["bodyweight", "dumbbells", "kettlebells", "barbell", "full-gym"], defaultSets: [{ weight: "0", reps: "12" }, { weight: "0", reps: "12" }, { weight: "0", reps: "10" }],
    formTips: ["Long stride forward", "Front knee at 90°", "Back knee toward floor", "Torso upright"],
    commonMistakes: ["Knee going past toes", "Leaning forward", "Short steps", "Wobbling side to side"],
    formVideoUrl: "https://www.youtube.com/results?search_query=walking+lunges+form+women",
  },
  // GLUTES
  {
    id: "hip-thrust", name: "Hip Thrusts", targetMuscles: ["Glutes", "Hamstrings"], bodyArea: "glutes",
    equipment: ["barbell", "full-gym", "bodyweight", "dumbbells", "resistance-bands"], defaultSets: [{ weight: "30", reps: "12" }, { weight: "30", reps: "12" }, { weight: "35", reps: "10" }],
    formTips: ["Upper back on bench", "Feet flat, shoulder-width", "Drive through heels", "Squeeze glutes at top"],
    commonMistakes: ["Hyperextending lower back", "Feet too far out", "Not squeezing at top", "Pushing through toes"],
    formVideoUrl: "https://www.youtube.com/results?search_query=hip+thrust+form+women",
  },
  {
    id: "glute-bridge", name: "Glute Bridge", targetMuscles: ["Glutes", "Hamstrings", "Core"], bodyArea: "glutes",
    equipment: ["bodyweight", "resistance-bands", "dumbbells"], defaultSets: [{ weight: "0", reps: "15" }, { weight: "0", reps: "15" }, { weight: "0", reps: "12" }],
    formTips: ["Lie flat, knees bent", "Drive hips to ceiling", "Squeeze glutes at top", "Hold 1-2 seconds"],
    commonMistakes: ["Pushing through toes", "Arching lower back", "Not squeezing at top", "Rushing reps"],
    formVideoUrl: "https://www.youtube.com/results?search_query=glute+bridge+form+women",
  },
  // CORE
  {
    id: "plank", name: "Plank", targetMuscles: ["Core", "Shoulders", "Glutes"], bodyArea: "core",
    equipment: ["bodyweight", "resistance-bands", "dumbbells", "kettlebells", "barbell", "full-gym"], defaultSets: [{ weight: "0", reps: "45" }, { weight: "0", reps: "45" }, { weight: "0", reps: "60" }],
    formTips: ["Forearms on floor, elbows under shoulders", "Body in straight line", "Engage core, squeeze glutes", "Breathe steadily"],
    commonMistakes: ["Hips sagging", "Hips too high", "Looking up", "Holding breath"],
    formVideoUrl: "https://www.youtube.com/results?search_query=plank+form+women",
  },
  {
    id: "dead-bug", name: "Dead Bug", targetMuscles: ["Core", "Hip Flexors"], bodyArea: "core",
    equipment: ["bodyweight", "resistance-bands"], defaultSets: [{ weight: "0", reps: "10" }, { weight: "0", reps: "10" }, { weight: "0", reps: "12" }],
    formTips: ["Back flat on floor", "Extend opposite arm/leg", "Move slowly", "Exhale as you extend"],
    commonMistakes: ["Arching lower back", "Moving too fast", "Not controlling breathing", "Lifting head"],
    formVideoUrl: "https://www.youtube.com/results?search_query=dead+bug+exercise+form",
  },
];

export const bodyAreas = [
  { id: "all", label: "All" },
  { id: "chest", label: "Chest" },
  { id: "shoulders", label: "Shoulders" },
  { id: "back", label: "Back" },
  { id: "arms", label: "Arms" },
  { id: "legs", label: "Legs" },
  { id: "glutes", label: "Glutes" },
  { id: "core", label: "Core" },
];

export function getExercisesForEquipment(userEquipment: string[]): ExerciseData[] {
  if (!userEquipment.length) return exerciseDatabase;
  return exerciseDatabase.filter((ex) =>
    ex.equipment.some((eq) => userEquipment.includes(eq))
  );
}

export function getAlternatives(exercise: ExerciseData, userEquipment: string[]): ExerciseData[] {
  return getExercisesForEquipment(userEquipment).filter(
    (ex) => ex.bodyArea === exercise.bodyArea && ex.id !== exercise.id
  );
}

// Map onboarding target areas to exercise body areas
const targetAreaToBodyArea: Record<string, string[]> = {
  "Upper Body": ["chest", "shoulders", "back", "arms"],
  "Core": ["core"],
  "Glutes": ["glutes"],
  "Legs": ["legs"],
  "Full Body": ["chest", "shoulders", "back", "arms", "legs", "glutes", "core"],
};

export function generateWorkoutFromProfile(
  equipment: string[],
  targetAreas: string[],
  goals: string[],
  durationMinutes: number = 30
): ExerciseData[] {
  const available = getExercisesForEquipment(equipment);

  // Determine which body areas to focus on
  const focusAreas = new Set<string>();
  if (!targetAreas.length) {
    // Default to full body
    ["chest", "shoulders", "back", "arms", "legs", "glutes", "core"].forEach(a => focusAreas.add(a));
  } else {
    targetAreas.forEach(ta => {
      const mapped = targetAreaToBodyArea[ta];
      if (mapped) mapped.forEach(a => focusAreas.add(a));
      else focusAreas.add(ta.toLowerCase());
    });
  }

  // Filter to focus areas
  const candidates = available.filter(ex => focusAreas.has(ex.bodyArea));

  // Estimate ~4 min per exercise (including rest), pick exercises to fill duration
  const maxExercises = Math.max(3, Math.min(Math.floor(durationMinutes / 4), 10));

  // Pick exercises: prioritize variety across body areas
  const picked: ExerciseData[] = [];
  const areasArray = Array.from(focusAreas);
  let areaIndex = 0;

  // Round-robin across areas
  const usedIds = new Set<string>();
  for (let round = 0; picked.length < maxExercises && round < 5; round++) {
    for (let i = 0; i < areasArray.length && picked.length < maxExercises; i++) {
      const area = areasArray[(areaIndex + i) % areasArray.length];
      const areaExercises = candidates.filter(ex => ex.bodyArea === area && !usedIds.has(ex.id));
      if (areaExercises.length > 0) {
        // Pick a random one from this area
        const pick = areaExercises[Math.floor(Math.random() * areaExercises.length)];
        picked.push(pick);
        usedIds.add(pick.id);
      }
    }
    areaIndex += areasArray.length;
  }

  return picked;
}
