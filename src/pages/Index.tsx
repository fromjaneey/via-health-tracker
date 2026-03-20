import { useState } from "react";
import TabNav from "@/components/TabNav";
import DashboardPage from "@/components/DashboardPage";
import WorkoutPage from "@/components/WorkoutPage";
import MealsPage from "@/components/MealsPage";
import HealthInsightsPage from "@/components/HealthInsightsPage";
import ProfilePage from "@/components/ProfilePage";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <DashboardPage onNavigate={setActiveTab} />;
      case "workout":
        return <WorkoutPage />;
      case "meals":
        return <MealsPage />;
      case "health":
        return <HealthInsightsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
