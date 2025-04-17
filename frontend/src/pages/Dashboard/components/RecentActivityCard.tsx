import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Clock, ChevronRight, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import axios from "axios";
import { requestApi } from "@/services/api";

// Define the request interface
interface BloodRequest {
  id: number;
  bloodGroup: string;
  units: number;
  requestDate: Date;
  status: string;
}

// Format the status badge display
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700 border-green-700";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-700";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-700";
    case "completed":
      return "bg-amber-100 text-amber-700 border-amber-700";
    default:
      return "bg-gray-100 text-gray-700 border-gray-700";
  }
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

const RecentActivityCard = (): React.ReactElement => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent blood requests
  const fetchRecentRequests = async () => {
    try {
      setLoading(true);
      const response = await requestApi.getAll();

      if (response.success) {
        // Map API response to our request format and take only the latest 4
        const mappedRequests = response.data
          .map((item: any) => ({
            id: item.request_id,
            bloodGroup: item.blood_group,
            units: item.units_requested,
            requestDate: new Date(item.request_date),
            status:
              item.status === "completed"
                ? "pending"
                : item.status || "pending",
          }))
          .sort(
            (a: BloodRequest, b: BloodRequest) =>
              b.requestDate.getTime() - a.requestDate.getTime()
          )
          .slice(0, 4);

        setRequests(mappedRequests);
      } else {
        console.error("Failed to fetch requests:", response.message);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch requests on component mount
    fetchRecentRequests();

    // Add event listener for new activities
    const handleNewActivity = () => {
      fetchRecentRequests();
    };

    window.addEventListener("activity-added", handleNewActivity);

    // Cleanup
    return () => {
      window.removeEventListener("activity-added", handleNewActivity);
    };
  }, []);

  return (
    <Card className="shadow-card card-hover h-full border-t-4 border-t-bloodRed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-bloodRed" />
            <CardTitle className="text-xl text-bloodRed">
              Recent Requests
            </CardTitle>
          </div>
          <Button
            asChild
            className="bg-bloodRed hover:bg-bloodRedDark text-white font-medium"
          >
            <Link to="/blood-requests">
              <Droplet className="mr-2 h-4 w-4" />
              Request Blood
            </Link>
          </Button>
        </div>
        <CardDescription>Your latest blood requests status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-4 text-center">
            <p className="text-gray-500">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500">No recent requests found</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => (
              <li
                key={request.id}
                className="bg-white p-3 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <p className="text-sm font-medium flex items-center">
                        <Droplet className="h-4 w-4 mr-1 text-bloodRed" />
                        {request.bloodGroup} ({request.units} units)
                      </p>
                      <Badge className={getStatusBadge(request.status)}>
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTimeAgo(request.requestDate)}
                      </p>
                      <Link
                        to="/blood-requests"
                        className="text-xs text-bloodRed hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
