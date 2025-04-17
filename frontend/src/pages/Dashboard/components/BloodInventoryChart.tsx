import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { inventoryApi } from "@/services/api";

// Blood group colors for consistent styling
const BLOOD_GROUP_COLORS = {
  "A+": "#FF6B6B",
  "B+": "#4D96FF",
  "AB+": "#9C6ADE",
  "O+": "#F9A826",
  "A-": "#FF8FAB",
  "B-": "#4ECDC4",
  "AB-": "#A06CD5",
  "O-": "#FFC75F",
};

// Fallback inventory data in case API fails
const fallbackInventory = [
  { bloodGroup: "A+", unitsAvailable: 25, color: "#FF6B6B" },
  { bloodGroup: "B+", unitsAvailable: 18, color: "#4D96FF" },
  { bloodGroup: "AB+", unitsAvailable: 8, color: "#9C6ADE" },
  { bloodGroup: "O+", unitsAvailable: 30, color: "#F9A826" },
  { bloodGroup: "A-", unitsAvailable: 10, color: "#FF8FAB" },
  { bloodGroup: "B-", unitsAvailable: 7, color: "#4ECDC4" },
  { bloodGroup: "AB-", unitsAvailable: 3, color: "#A06CD5" },
  { bloodGroup: "O-", unitsAvailable: 15, color: "#FFC75F" },
];

const BloodInventoryChart: React.FC = () => {
  const [inventory, setInventory] = useState(fallbackInventory);
  const [loading, setLoading] = useState(true);

  // Format inventory data from API response
  const formatInventoryData = (apiData) => {
    if (!apiData || !apiData.length) return fallbackInventory;

    return apiData.map((item) => ({
      bloodGroup: item.blood_group,
      unitsAvailable: parseFloat(item.available_units),
      color: BLOOD_GROUP_COLORS[item.blood_group] || "#CCCCCC",
    }));
  };

  // Fetch inventory data from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getAll();

      if (response.success) {
        const formattedData = formatInventoryData(response.data);
        console.log("Updated chart inventory data:", formattedData);
        setInventory(formattedData);
      } else {
        console.error("Failed to fetch inventory for chart:", response.message);
      }
    } catch (error) {
      console.error("Error fetching inventory for chart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and set up event listener for updates
  useEffect(() => {
    fetchInventory();

    // Add event listener for inventory updates
    const handleInventoryUpdate = () => {
      console.log(
        "Inventory update event detected in chart, refreshing data..."
      );
      fetchInventory();
    };

    // Listen for activity-added events (such as when a request is approved)
    window.addEventListener("activity-added", handleInventoryUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("activity-added", handleInventoryUpdate);
    };
  }, []);

  const totalUnits = inventory.reduce(
    (total, item) => total + item.unitsAvailable,
    0
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value} units`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Droplets className="mr-2 h-5 w-5 text-bloodRed" />
          Blood Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bloodRed"></div>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold">{totalUnits}</div>
              <div className="text-sm text-gray-500">Total Units Available</div>
            </div>

            <div className="h-[180px] w-full mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="unitsAvailable"
                    nameKey="bloodGroup"
                  >
                    {inventory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 px-2">
              {inventory.map((item) => (
                <div
                  key={item.bloodGroup}
                  className="flex items-center text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex-1">{item.bloodGroup}</div>
                  <div className="font-semibold">{item.unitsAvailable}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <a
                href="/inventory"
                className="text-sm text-bloodRed hover:underline"
              >
                View Detailed Inventory →
              </a>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodInventoryChart;
