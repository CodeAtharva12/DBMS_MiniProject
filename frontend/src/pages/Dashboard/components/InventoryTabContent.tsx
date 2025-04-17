import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Droplets, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// This would come from an API in a real implementation
const inventoryData = [
  { bloodGroup: "A+", units: 42, capacity: 50, expiringSoon: 5 },
  { bloodGroup: "B+", units: 28, capacity: 50, expiringSoon: 3 },
  { bloodGroup: "AB+", units: 13, capacity: 30, expiringSoon: 1 },
  { bloodGroup: "O+", units: 38, capacity: 60, expiringSoon: 8 },
  { bloodGroup: "A-", units: 18, capacity: 30, expiringSoon: 2 },
  { bloodGroup: "B-", units: 9, capacity: 20, expiringSoon: 0 },
  { bloodGroup: "AB-", units: 5, capacity: 15, expiringSoon: 1 },
  { bloodGroup: "O-", units: 22, capacity: 40, expiringSoon: 4 },
];

const bloodGroupColors: Record<string, string> = {
  "A+": "bg-bloodRed/80",
  "B+": "bg-bloodRed/70",
  "AB+": "bg-bloodRed/60",
  "O+": "bg-bloodRed/90",
  "A-": "bg-medicalBlue/80",
  "B-": "bg-medicalBlue/70",
  "AB-": "bg-medicalBlue/60",
  "O-": "bg-medicalBlue/90",
};

const InventoryTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <BloodStockCard
          title="Total Blood Units"
          value={inventoryData.reduce((sum, item) => sum + item.units, 0)}
          icon={<Droplets className="h-6 w-6 sm:h-8 sm:w-8 text-bloodRed" />}
        />
        <BloodStockCard
          title="Expiring Soon"
          value={inventoryData.reduce(
            (sum, item) => sum + item.expiringSoon,
            0
          )}
          icon={
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
          }
        />
        <BloodStockCard
          title="Capacity Utilized"
          value={`${Math.round(
            (inventoryData.reduce((sum, item) => sum + item.units, 0) /
              inventoryData.reduce((sum, item) => sum + item.capacity, 0)) *
              100
          )}%`}
          icon={
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-healthGreen" />
          }
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Droplets className="mr-2 h-5 w-5 text-bloodRed" />
            Current Blood Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full" type="always">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Available Units</TableHead>
                    <TableHead>Expiring Soon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.bloodGroup}>
                      <TableCell>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
                            bloodGroupColors[item.bloodGroup]
                          }`}
                        >
                          {item.bloodGroup}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.units} units
                      </TableCell>
                      <TableCell>
                        {item.expiringSoon > 0 ? (
                          <span className="text-amber-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {item.expiringSoon} units
                          </span>
                        ) : (
                          <span className="text-healthGreen">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Progress
                            value={(item.units / item.capacity) * 100}
                            className={cn(
                              "h-2",
                              bloodGroupColors[item.bloodGroup]
                            )}
                          />
                          <span className="text-xs text-mediumGray">
                            {Math.round((item.units / item.capacity) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.capacity} units</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for stats cards
const BloodStockCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-mediumGray">
              {title}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-softPink-light rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryTabContent;
