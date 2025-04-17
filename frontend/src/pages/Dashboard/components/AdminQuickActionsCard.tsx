import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Droplets,
  Users,
  ClipboardList,
  History,
  Hospital,
} from "lucide-react";

const AdminQuickActionsCard: React.FC = () => {
  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Droplets className="mr-2 h-5 w-5 text-bloodRed" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Common tasks</h3>

          <Link to="/donors" className="block">
            <div className="flex items-center p-3 rounded-md hover:bg-softPink/20 transition-colors">
              <div className="bg-bloodRed/10 p-2 rounded-full mr-3">
                <Users className="h-5 w-5 text-bloodRed" />
              </div>
              <div>
                <h4 className="font-medium">Manage Donors</h4>
                <p className="text-sm text-gray-500">
                  View and manage donor records
                </p>
              </div>
            </div>
          </Link>

          <Link to="/hospitals" className="block">
            <div className="flex items-center p-3 rounded-md hover:bg-softPink/20 transition-colors">
              <div className="bg-bloodRed/10 p-2 rounded-full mr-3">
                <Hospital className="h-5 w-5 text-bloodRed" />
              </div>
              <div>
                <h4 className="font-medium">Manage Hospitals</h4>
                <p className="text-sm text-gray-500">
                  View hospitals and their request history
                </p>
              </div>
            </div>
          </Link>

          <Link to="/requests" className="block">
            <div className="flex items-center p-3 rounded-md hover:bg-softPink/20 transition-colors">
              <div className="bg-bloodRed/10 p-2 rounded-full mr-3">
                <ClipboardList className="h-5 w-5 text-bloodRed" />
              </div>
              <div>
                <h4 className="font-medium">Request History</h4>
                <p className="text-sm text-gray-500">
                  View approved and rejected requests
                </p>
              </div>
            </div>
          </Link>

          <Link to="/donation-history" className="block">
            <div className="flex items-center p-3 rounded-md hover:bg-softPink/20 transition-colors">
              <div className="bg-bloodRed/10 p-2 rounded-full mr-3">
                <History className="h-5 w-5 text-bloodRed" />
              </div>
              <div>
                <h4 className="font-medium">Donation History</h4>
                <p className="text-sm text-gray-500">View past donations</p>
              </div>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActionsCard;
