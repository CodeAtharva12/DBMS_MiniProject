import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { inventoryApi } from "@/services/api";

// High contrast colors for better accessibility
const COLORS = [
  "#e94e4e", // A+ - bright red
  "#2563eb", // B+ - blue
  "#8b5cf6", // AB+ - purple
  "#f97316", // O+ - orange
  "#06b6d4", // A- - cyan
  "#16a34a", // B- - green
  "#d946ef", // AB- - pink
  "#fbbf24", // O- - yellow
];

// Pattern styles for additional differentiation (for colorblind users)
const PATTERNS = [
  {
    id: "lines-a-plus",
    path: (color) =>
      `<pattern id="lines-a-plus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0,0 l8,8" stroke="${color}" stroke-width="2" fill="none"/></pattern>`,
  },
  {
    id: "dots-b-plus",
    path: (color) =>
      `<pattern id="dots-b-plus" patternUnits="userSpaceOnUse" width="8" height="8"><circle cx="4" cy="4" r="2" fill="${color}"/></pattern>`,
  },
  {
    id: "grid-ab-plus",
    path: (color) =>
      `<pattern id="grid-ab-plus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0,0 L8,0 M0,4 L8,4 M0,8 L8,8 M0,0 L0,8 M4,0 L4,8 M8,0 L8,8" stroke="${color}" stroke-width="1" fill="none"/></pattern>`,
  },
  {
    id: "dash-o-plus",
    path: (color) =>
      `<pattern id="dash-o-plus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0,4 L8,4" stroke="${color}" stroke-width="2" fill="none"/></pattern>`,
  },
  {
    id: "zigzag-a-minus",
    path: (color) =>
      `<pattern id="zigzag-a-minus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0,0 L2,4 L4,0 L6,4 L8,0" stroke="${color}" stroke-width="1" fill="none"/></pattern>`,
  },
  {
    id: "cross-b-minus",
    path: (color) =>
      `<pattern id="cross-b-minus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M2,2 L6,6 M6,2 L2,6" stroke="${color}" stroke-width="2" fill="none"/></pattern>`,
  },
  {
    id: "diamond-ab-minus",
    path: (color) =>
      `<pattern id="diamond-ab-minus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M4,0 L8,4 L4,8 L0,4 Z" stroke="${color}" stroke-width="1" fill="none"/></pattern>`,
  },
  {
    id: "wave-o-minus",
    path: (color) =>
      `<pattern id="wave-o-minus" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0,4 Q2,0 4,4 Q6,8 8,4" stroke="${color}" stroke-width="1" fill="none"/></pattern>`,
  },
];

// Blood groups in order
const BLOOD_GROUPS = ["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"];

// Custom tooltip component for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const statusColor =
      data.status === "critical"
        ? "text-red-600"
        : data.status === "low"
        ? "text-amber-500"
        : "text-green-600";

    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{data.name}</p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{data.value} units</span> (
          {data.percentage})
        </p>
        <p
          className={`text-xs font-medium ${statusColor} mt-1 flex items-center`}
        >
          {data.status === "critical" && (
            <AlertTriangle className="mr-1 h-3 w-3" />
          )}
          Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom legend component for better rendering on mobile
const CustomLegend = ({ payload, inventoryData }: any) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs mt-4 justify-center">
      {payload.map((entry: any, index: number) => {
        const data = inventoryData.find((item) => item.name === entry.value);
        const statusIndicator =
          data?.status === "critical" ? (
            <AlertTriangle className="h-3 w-3 text-red-600 ml-1" />
          ) : data?.status === "low" ? (
            <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
          ) : null;

        return (
          <div key={`legend-${index}`} className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="font-medium">{entry.value}:</span>
            <span>{data?.percentage}</span>
            <span className="text-gray-600">({data?.value} units)</span>
            {statusIndicator}
          </div>
        );
      })}
    </div>
  );
};

const BloodInventoryCard: React.FC = () => {
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch inventory data from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getAll();

      if (response.success) {
        // Process the inventory data
        const processedData = processInventoryData(response.data);
        setInventoryData(processedData);
        console.log("Updated inventory:", processedData);
      } else {
        console.error("Failed to fetch inventory:", response.message);
        // If API call fails, use empty data
        setInventoryData([]);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventory();

    // Add event listener for inventory updates
    const handleInventoryUpdate = () => {
      console.log("Inventory update event detected, refreshing data...");
      fetchInventory();
    };

    // Listen for activity-added events (such as when a request is approved)
    window.addEventListener("activity-added", handleInventoryUpdate);

    // Cleanup
    return () => {
      window.removeEventListener("activity-added", handleInventoryUpdate);
    };
  }, []);

  // Process inventory data from API to format needed for chart
  const processInventoryData = (apiData) => {
    // Create a map to store inventory by blood group
    const inventoryMap = {};

    // Initialize with all blood groups as 0
    BLOOD_GROUPS.forEach((group) => {
      inventoryMap[group] = 0;
    });

    // Sum up units by blood group
    apiData.forEach((item) => {
      const bloodGroup = item.blood_group;
      const units = parseFloat(item.available_units);

      if (inventoryMap.hasOwnProperty(bloodGroup)) {
        inventoryMap[bloodGroup] += units;
      }
    });

    // Calculate total units
    const totalUnits = Object.values(inventoryMap).reduce(
      (sum: any, val: any) => sum + val,
      0
    );

    // Format data for chart with status based on thresholds
    return BLOOD_GROUPS.map((group) => {
      const value = inventoryMap[group];
      const percentage =
        totalUnits > 0 ? Math.round((value / totalUnits) * 100) + "%" : "0%";

      // Determine status based on available units
      let status = "normal";
      if (value <= 3) {
        status = "critical";
      } else if (value <= 7) {
        status = "low";
      }

      return {
        name: group,
        value,
        percentage,
        threshold: group.includes("-") ? 5 : 10, // Lower threshold for negative blood types
        status,
      };
    });
  };

  const totalUnits = inventoryData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="shadow-card card-hover h-full border-t-4 border-t-bloodRed">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Droplets className="mr-2 h-5 w-5 text-bloodRed" />
              Blood Inventory
            </CardTitle>
            <CardDescription>Current stock levels</CardDescription>
          </div>
          <div className="bg-softPink-light rounded-full px-3 py-1 text-sm font-medium flex items-center">
            <Droplets className="mr-1 h-4 w-4 text-bloodRed" />
            <span>Total Units Available: {totalUnits}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[240px] w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bloodRed"></div>
          </div>
        ) : (
          <>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <defs>
                    {PATTERNS.map((pattern, index) => (
                      <pattern
                        key={pattern.id}
                        id={pattern.id}
                        patternUnits="userSpaceOnUse"
                        width="8"
                        height="8"
                        dangerouslySetInnerHTML={{
                          __html: pattern
                            .path(COLORS[index])
                            .replace(/<pattern.*?>/, ""),
                        }}
                      />
                    ))}
                  </defs>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0.08 ? `${name}` : ""
                    }
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={1}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        strokeWidth={1}
                        stroke="#fff"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom legend for better mobile display */}
            <div className="mt-4">
              <CustomLegend
                inventoryData={inventoryData}
                payload={inventoryData.map((item, index) => ({
                  value: item.name,
                  color: COLORS[index % COLORS.length],
                  type: "circle",
                }))}
              />
            </div>
          </>
        )}

        <div className="mt-6">
          <Link to="/inventory">
            <Button
              variant="ghost"
              className="w-full text-bloodRed hover:bg-bloodRed hover:text-white transition-colors flex items-center justify-center"
            >
              View Detailed Inventory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodInventoryCard;
