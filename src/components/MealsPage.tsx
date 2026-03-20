import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Flame, Drumstick, Wheat, Droplets, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
}

const mealTypeLabels = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
  snack: { label: "Snack", emoji: "🍎" },
};

const recipeVideos = [
  {
    title: "High Protein Meal Prep (130g+)",
    channel: "Stephanie Buttermore",
    thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554?w=320&h=180&fit=crop",
    url: "https://www.youtube.com/results?search_query=high+protein+meal+prep+for+women",
    tag: "High Protein",
  },
  {
    title: "Low Calorie Desserts Under 100cal",
    channel: "The Protein Chef",
    thumbnail: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=320&h=180&fit=crop",
    url: "https://www.youtube.com/results?search_query=low+calorie+high+protein+desserts",
    tag: "Low Cal Dessert",
  },
  {
    title: "Easy 30-Min High Protein Dinners",
    channel: "Fit Men Cook",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=320&h=180&fit=crop",
    url: "https://www.youtube.com/results?search_query=easy+high+protein+dinner+recipes",
    tag: "Quick Dinner",
  },
  {
    title: "Protein Smoothie Bowl Recipes",
    channel: "Pick Up Limes",
    thumbnail: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=320&h=180&fit=crop",
    url: "https://www.youtube.com/results?search_query=high+protein+smoothie+bowl+recipe",
    tag: "Smoothie Bowl",
  },
  {
    title: "Healthy Snacks for Weight Loss",
    channel: "Abbey Sharp",
    thumbnail: "https://images.unsplash.com/photo-1505576399279-0d754c503e5c?w=320&h=180&fit=crop",
    url: "https://www.youtube.com/results?search_query=healthy+high+protein+snacks+weight+loss",
    tag: "Snack Ideas",
  },
];

const MealsPage = () => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "breakfast" as MealEntry["mealType"],
  });

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);

  const addMeal = () => {
    if (!newMeal.name || !newMeal.calories) return;
    setMeals((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMeal.name,
        calories: parseInt(newMeal.calories) || 0,
        protein: parseInt(newMeal.protein) || 0,
        carbs: parseInt(newMeal.carbs) || 0,
        fat: parseInt(newMeal.fat) || 0,
        mealType: newMeal.mealType,
      },
    ]);
    setNewMeal({ name: "", calories: "", protein: "", carbs: "", fat: "", mealType: "breakfast" });
    setShowAdd(false);
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Meals</h1>
          <p className="text-sm text-muted-foreground">Track what you eat today</p>
        </div>
        <Button
          variant="hero"
          size="sm"
          className="font-display gap-1.5"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Daily Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-primary rounded-2xl p-5 text-primary-foreground"
      >
        <p className="text-sm font-display font-medium opacity-80 mb-3">Today's Totals</p>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Flame className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-display font-semibold">{totalCalories}</p>
            <p className="text-[10px] opacity-80">kcal</p>
          </div>
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Drumstick className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-display font-semibold">{totalProtein}g</p>
            <p className="text-[10px] opacity-80">Protein</p>
          </div>
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Wheat className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-display font-semibold">{totalCarbs}g</p>
            <p className="text-[10px] opacity-80">Carbs</p>
          </div>
          <div className="bg-background/15 rounded-xl p-3 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-display font-semibold">{totalFat}g</p>
            <p className="text-[10px] opacity-80">Fat</p>
          </div>
        </div>
      </motion.div>

      {/* Add Meal Form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border space-y-4"
        >
          <h3 className="font-display font-semibold text-foreground">Log a Meal</h3>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(mealTypeLabels) as Array<keyof typeof mealTypeLabels>).map((type) => (
              <button
                key={type}
                onClick={() => setNewMeal((p) => ({ ...p, mealType: type }))}
                className={`p-2 rounded-xl border text-center transition-all text-xs ${
                  newMeal.mealType === type
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <span className="text-lg block">{mealTypeLabels[type].emoji}</span>
                <span className="font-display font-medium text-foreground">{mealTypeLabels[type].label}</span>
              </button>
            ))}
          </div>
          <input
            value={newMeal.name}
            onChange={(e) => setNewMeal((p) => ({ ...p, name: e.target.value }))}
            placeholder="Meal name (e.g. Greek Yogurt Bowl)"
            className="w-full h-12 px-4 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newMeal.calories}
              onChange={(e) => setNewMeal((p) => ({ ...p, calories: e.target.value }))}
              placeholder="Calories"
              className="h-12 px-4 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="number"
              value={newMeal.protein}
              onChange={(e) => setNewMeal((p) => ({ ...p, protein: e.target.value }))}
              placeholder="Protein (g)"
              className="h-12 px-4 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="number"
              value={newMeal.carbs}
              onChange={(e) => setNewMeal((p) => ({ ...p, carbs: e.target.value }))}
              placeholder="Carbs (g)"
              className="h-12 px-4 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="number"
              value={newMeal.fat}
              onChange={(e) => setNewMeal((p) => ({ ...p, fat: e.target.value }))}
              placeholder="Fat (g)"
              className="h-12 px-4 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 font-display" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button variant="hero" className="flex-1 font-display" onClick={addMeal} disabled={!newMeal.name || !newMeal.calories}>
              Save Meal
            </Button>
          </div>
        </motion.div>
      )}

      {/* Meal List */}
      {meals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-foreground text-sm">Today's Log</h3>
          {meals.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-xl p-4 border border-border flex items-center gap-3"
            >
              <span className="text-2xl">{mealTypeLabels[meal.mealType].emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-medium text-foreground text-sm truncate">{meal.name}</p>
                <p className="text-xs text-muted-foreground">
                  {meal.protein}g P · {meal.carbs}g C · {meal.fat}g F
                </p>
              </div>
              <span className="font-display font-semibold text-foreground text-sm">{meal.calories} kcal</span>
            </motion.div>
          ))}
        </div>
      )}

      {meals.length === 0 && !showAdd && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-2xl p-8 border border-border text-center"
        >
          <span className="text-4xl block mb-3">🥗</span>
          <p className="font-display font-semibold text-foreground mb-1">No meals logged yet</p>
          <p className="text-sm text-muted-foreground mb-4">Tap "Add" to start tracking your nutrition</p>
        </motion.div>
      )}

      {/* Recipe Videos */}
      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">Recipe Inspiration 🎬</h3>
        <p className="text-sm text-muted-foreground mb-4">High protein meals & healthy treats</p>
        <div className="space-y-3">
          {recipeVideos.map((video, i) => (
            <motion.a
              key={video.title}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-xl border border-border flex overflow-hidden hover:border-primary/30 transition-colors group"
            >
              <div className="relative w-28 h-20 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[10px] font-display font-semibold text-primary mb-0.5">{video.tag}</span>
                <p className="font-display font-medium text-foreground text-sm truncate">{video.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {video.channel} <ExternalLink className="w-3 h-3" />
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealsPage;
