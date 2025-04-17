import * as React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";
import axios from "axios";

// Define the activity event interface
interface ActivityEvent {
  id: number;
  type: string;
  details: string;
  timestamp: Date;
  status: string;
}

// Convert API response to our activity format
const mapApiActivityToEvent = (activity: any): ActivityEvent => {
  // Extract status from details JSON if it exists
  let status = "completed";

  try {
    if (activity.details) {
      const detailsObj =
        typeof activity.details === "string"
          ? JSON.parse(activity.details)
          : activity.details;

      // Get status from details object if available
      status = detailsObj.status || detailsObj.new_status || "completed";
    }
  } catch (error) {
    console.error("Error parsing activity details:", error);
  }

  // Determine activity type and status
  const activityType = activity.activity_type || "";
  const description = activity.description || "";

  // Handle specific cases based on description and type
  if (activityType === "request") {
    if (description.toLowerCase().includes("rejected")) {
      status = "rejected";
    } else if (description.toLowerCase().includes("approved")) {
      status = "approved";
    } else {
      status = "pending";
    }
  } else if (activityType === "donation") {
    status = "completed";
  }

  return {
    id: activity.id || activity.log_id || activity.activity_id,
    type: activityType,
    details: description,
    timestamp: new Date(
      activity.timestamp || activity.created_at || new Date()
    ),
    status: status,
  };
};

// Helper function to format time
function formatTimeAgo(timestamp: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - timestamp.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return diffInSeconds + " seconds ago";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes + " minutes ago";
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours + " hours ago";
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "1 day ago";
  }

  return diffInDays + " days ago";
}

// Function to add a new activity (called from other components)
export const addActivity = async (activity: Partial<ActivityEvent>) => {
  try {
    const token = localStorage.getItem("auth_token");

    // Save to database via API
    await axios.post(
      "http://localhost:8080/api/activities",
      {
        activity_type: activity.type,
        description: activity.details,
        details: JSON.stringify({ status: activity.status || "completed" }),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Reload activities on dashboard
    window.dispatchEvent(new CustomEvent("activity-added"));
  } catch (error) {
    console.error("Error adding activity:", error);
  }
};

const AdminRecentActivityCard = (): React.ReactElement => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await axios.get(
        "http://localhost:8080/api/activities/recent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Convert API response to our activity format
        const mappedActivities = response.data.data.map(mapApiActivityToEvent);
        setActivities(mappedActivities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch activities on component mount
    fetchActivities();

    // Add event listener for new activities
    const handleNewActivity = () => {
      fetchActivities();
    };

    window.addEventListener("activity-added", handleNewActivity);

    // Cleanup
    return () => {
      window.removeEventListener("activity-added", handleNewActivity);
    };
  }, []);

  // Filter out inventory_update activities
  const filteredActivities = activities.filter(
    (activity) =>
      activity.type !== "inventory_update" &&
      activity.type !== "user_management"
  );

  // Helper function to get the status badge style
  const getStatusBadge = (status: string, activityType: string) => {
    const baseClasses = "text-xs px-2 py-1 rounded-full";

    switch (status) {
      case "pending":
        return (
          <span className={`${baseClasses} bg-amber-100 text-amber-800`}>
            pending
          </span>
        );
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            approved
          </span>
        );
      case "completed":
        // Only donation activities get purple color
        if (activityType === "donation") {
          return (
            <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
              completed
            </span>
          );
        }
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            completed
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            rejected
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5 text-bloodRed" />
            Recent Activity
          </CardTitle>
          <Clock className="h-4 w-4 text-gray-400" />
        </div>
        <CardDescription>Your recent blood bank activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">Loading activities...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No recent activities found</p>
              </div>
            ) : (
              <ul className="divide-y">
                {filteredActivities.slice(0, 4).map((activity) => (
                  <li key={activity.id} className="p-4 hover:bg-gray-50">
                    <div className="">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === "donation"
                            ? "New Donation"
                            : activity.type === "approval"
                            ? "Approval"
                            : activity.type === "request"
                            ? "Request"
                            : activity.type}
                        </p>
                        {getStatusBadge(activity.status, activity.type)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRecentActivityCard;
