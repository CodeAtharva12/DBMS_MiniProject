import React, { useEffect } from "react";

// Fetch data on component mount
useEffect(() => {
  if (user) {
    fetchDashboardSummary();

    // Listen for new activities to refresh data
    const handleActivityAdded = () => {
      console.log(
        "Activity detected in Hospital Dashboard, refreshing data..."
      );
      fetchDashboardSummary();
    };

    // Add event listener
    window.addEventListener("activity-added", handleActivityAdded);

    // Clean up
    return () => {
      window.removeEventListener("activity-added", handleActivityAdded);
    };
  }
}, [user]);
