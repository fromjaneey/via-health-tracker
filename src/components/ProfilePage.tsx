import { motion } from "framer-motion";
import { User, Settings, TrendingUp, Award, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 rounded-full gradient-primary mx-auto flex items-center justify-center mb-3">
          <User className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-semibold text-foreground">Your Profile</h1>
        <p className="text-sm text-muted-foreground">Member since March 2026</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <p className="text-2xl font-display font-semibold text-foreground">47</p>
          <p className="text-[10px] text-muted-foreground">Workouts</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <p className="text-2xl font-display font-semibold text-foreground">12</p>
          <p className="text-[10px] text-muted-foreground">Week Streak</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border text-center">
          <p className="text-2xl font-display font-semibold text-foreground">8</p>
          <p className="text-[10px] text-muted-foreground">PRs Set</p>
        </div>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {[
          { icon: TrendingUp, label: "Progress Photos", desc: "Track your transformation" },
          { icon: Award, label: "Achievements", desc: "View your badges and milestones" },
          { icon: Calendar, label: "Workout History", desc: "Review past sessions" },
          { icon: Settings, label: "Settings", desc: "App preferences and account" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-display font-medium text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ProfilePage;
