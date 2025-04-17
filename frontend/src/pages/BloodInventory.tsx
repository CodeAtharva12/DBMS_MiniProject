import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertTriangle, Droplet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { inventoryApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

// Chart data preprocessing function
const prepareChartData = (inventory) => {
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Create a map to track units per blood group
  const bloodGroupMap = {};
  bloodGroups.forEach((group) => {
    bloodGroupMap[group] = 0;
  });

  // Sum up units for each blood group
  inventory.forEach((item) => {
    if (
      item.status !== "expired" &&
      bloodGroupMap.hasOwnProperty(item.bloodGroup)
    ) {
      bloodGroupMap[item.bloodGroup] += parseFloat(item.units);
    }
  });

  // Convert to chart format
  return bloodGroups.map((group) => ({
    name: group,
    units: bloodGroupMap[group],
  }));
};

const BloodInventory = () => {
  const { user, loading, isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("valid");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);

        // Get the authentication token
        const token = localStorage.getItem("auth_token");

        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to access inventory data",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Include auth token in the request headers
        const inventoryResponse = await fetch(
          "http://localhost:5001/api/inventory",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (inventoryResponse.status === 401) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const inventoryData = await inventoryResponse.json();

        if (inventoryData.success) {
          // Map inventory data to our format
          const formattedData = inventoryData.data.map((item) => ({
            id: item.inventory_id,
            bloodGroup: item.blood_group,
            units: parseFloat(item.available_units),
            bankId: item.bank_id,
            bankName: item.bank_name || "Main Blood Bank",
            status: "valid", // All inventory items are valid by definition
            updated: new Date(item.updated_at).toISOString().split("T")[0],
          }));

          setInventory(formattedData);
        } else {
          toast({
            title: "Error",
            description:
              inventoryData.message || "Failed to fetch inventory data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast({
          title: "Error",
          description: "Failed to connect to inventory service",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [toast]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bloodRed"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.bloodGroup
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBloodGroup =
      filterBloodGroup === "all" || item.bloodGroup === filterBloodGroup;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesBloodGroup && matchesStatus;
  });

  const chartData = prepareChartData(inventory);

  // Calculate expiring soon (within 7 days)
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const expiringSoon = inventory.filter((item) => {
    const expiryDate = new Date(item.expires);
    return (
      item.status === "valid" &&
      expiryDate <= sevenDaysFromNow &&
      expiryDate >= today
    );
  }).length;

  // Calculate total valid units
  const totalValidUnits = inventory
    .filter((item) => item.status === "valid")
    .reduce((sum, item) => sum + parseFloat(item.units), 0);

  // Count expired units
  const expiredUnits = inventory.filter(
    (item) => item.status === "expired"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-lightGray">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="page-header">
            <h1 className="page-title">Blood Inventory</h1>
            <p className="text-gray-600 mt-2">
              Manage and track your blood units across all blood banks
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Card className="shadow-card card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-bloodRed">
                    Total Available
                  </CardTitle>
                  <Droplet className="h-5 w-5 text-bloodRed" />
                </div>
                <CardDescription>
                  Total units available in the bank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-bloodRed">
                  {totalValidUnits}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-amber-500">
                    Expiring Soon
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <CardDescription>Units expiring within 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-500">
                  {expiringSoon}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card card-hover">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-500">
                    Expired
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                </div>
                <CardDescription>Units that have expired</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-400">
                  {expiredUnits}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-bloodRed">
                Blood Group Distribution
              </CardTitle>
              <CardDescription>
                Current available units by blood group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar dataKey="units" fill="#e04646" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.units === 0 ? "#ccc" : "#e04646"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-bloodRed">
                Search & Filter
              </CardTitle>
              <CardDescription>
                Find specific blood units in your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search inventory"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select
                  value={filterBloodGroup}
                  onValueChange={setFilterBloodGroup}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Blood Groups" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blood Groups</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-bloodRed">
                Inventory Details
              </CardTitle>
              <CardDescription>
                {filteredInventory.length}{" "}
                {filteredInventory.length === 1 ? "record" : "records"} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full" type="always">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <span className="blood-group-badge">
                                {item.bloodGroup}
                              </span>
                            </TableCell>
                            <TableCell>{item.units}</TableCell>
                            <TableCell>{item.bankName}</TableCell>
                            <TableCell>{item.updated}</TableCell>
                            <TableCell>
                              <Badge className="bg-healthGreen">Valid</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No inventory records found matching your filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BloodInventory;
