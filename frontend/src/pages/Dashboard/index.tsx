import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import RecentActivityCard from "./components/RecentActivityCard";
import { Button } from "@/components/ui/button";
import { BarChart, Calendar, Droplets } from "lucide-react";

const Dashboard = () => {
  const { user, loading, isAdmin, isHospital } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bloodRed"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect admin users to the admin dashboard
  if (isAdmin()) {
    return <Navigate to="/admin" />;
  }

  return (
    <PageLayout
      title="Hospital Dashboard"
      subtitle="Welcome back! Manage your blood requests from Blood Bank LifeStream+."
    >
      <div className="grid grid-cols-1 gap-6 mb-8 blood-cells-bg">
        <div className="flex justify-center items-center my-8">
          <Button
            onClick={() => (window.location.href = "/blood-requests")}
            className="action-btn-primary flex items-center px-10 py-8 text-3xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
          >
            <Droplets className="h-10 w-10 mr-5" />
            Request Blood
          </Button>
        </div>

        <div className="col-span-1">
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="col-span-1">
              <RecentActivityCard />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
