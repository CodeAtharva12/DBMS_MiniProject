import React from "react";
import PageLayout from "@/components/PageLayout";
import ManageHospitals from "./Dashboard/components/ManageHospitals";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Hospitals = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bloodRed"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }

  return (
    <PageLayout
      title="Hospitals Management"
      subtitle="View and manage healthcare organizations"
    >
      <div className="grid grid-cols-1 gap-6">
        <ManageHospitals />
      </div>
    </PageLayout>
  );
};

export default Hospitals;
