import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Download, Filter, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for reports
const inventoryByBloodGroup = [
  { name: "A+", units: 25, color: "#EA4A4C" },
  { name: "B+", units: 18, color: "#D63C3D" },
  { name: "AB+", units: 8, color: "#B82E2F" },
  { name: "O+", units: 30, color: "#901F20" },
  { name: "A-", units: 10, color: "#FF6B6C" },
  { name: "B-", units: 7, color: "#FF8182" },
  { name: "AB-", units: 3, color: "#FF9797" },
  { name: "O-", units: 15, color: "#FFACAC" },
];

const donationTrends = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 52 },
  { month: "Mar", count: 48 },
  { month: "Apr", count: 56 },
  { month: "May", count: 61 },
  { month: "Jun", count: 58 },
  { month: "Jul", count: 63 },
  { month: "Aug", count: 55 },
  { month: "Sep", count: 67 },
  { month: "Oct", count: 73 },
  { month: "Nov", count: 68 },
  { month: "Dec", count: 59 },
];

const requestsByHospital = [
  { name: "City Hospital", requests: 78, approved: 65 },
  { name: "Metro Medical Center", requests: 56, approved: 43 },
  { name: "County General", requests: 42, approved: 38 },
  { name: "Children's Research Hospital", requests: 35, approved: 31 },
  { name: "Emergency Medical Services", requests: 89, approved: 85 },
];

const expiryForecast = [
  { days: "1-7 days", units: 12, bloodGroups: ["A+", "B+", "O+"] },
  { days: "8-14 days", units: 25, bloodGroups: ["AB+", "A+", "O-", "B-"] },
  { days: "15-21 days", units: 38, bloodGroups: ["A-", "B+", "AB-", "O+"] },
  { days: "22-30 days", units: 41, bloodGroups: ["A+", "B+", "AB+", "O-"] },
];

const criticalStock = [
  { bloodGroup: "AB-", units: 3, status: "Critical", minRequired: 10 },
  { bloodGroup: "B-", units: 7, status: "Low", minRequired: 10 },
  { bloodGroup: "AB+", units: 8, status: "Low", minRequired: 10 },
];

const Reports = () => {
  const { user, loading, isAdmin } = useAuth();
  const [timeRange, setTimeRange] = useState("month");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }

  const exportReport = (reportName: string) => {
    alert(`Export ${reportName} report to CSV/PDF`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>;
      case "Low":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Low</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-bloodRed">
              Reports & Analytics
            </h1>

            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="inventory">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="donations">Donation Trends</TabsTrigger>
              <TabsTrigger value="requests">Request Analysis</TabsTrigger>
              <TabsTrigger value="expiry">Expiry Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Blood Inventory by Group</CardTitle>
                    <CardDescription>
                      Current units available by blood group
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryByBloodGroup}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="units"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {inventoryByBloodGroup.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value} units`,
                              "Available",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Critical Stock Alert</CardTitle>
                      <CardDescription>
                        Blood groups with low inventory
                      </CardDescription>
                    </div>
                    <Button
                      className="bg-bloodRed hover:bg-bloodRedDark"
                      onClick={() => exportReport("CriticalStock")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Blood Group</TableHead>
                          <TableHead>Available Units</TableHead>
                          <TableHead>Min Required</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criticalStock.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                                {item.bloodGroup}
                              </span>
                            </TableCell>
                            <TableCell>{item.units}</TableCell>
                            <TableCell>{item.minRequired}</TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">
                        Recommended Actions:
                      </h3>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>
                          • Organize blood donation drive focusing on AB- and B-
                          blood groups
                        </li>
                        <li>
                          • Contact regular donors with AB- and B- blood groups
                        </li>
                        <li>
                          • Consider blood unit transfers from other banks
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Full Inventory Report</CardTitle>
                    <CardDescription>
                      Complete inventory status by blood group and location
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-bloodRed hover:bg-bloodRedDark"
                    onClick={() => exportReport("FullInventory")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Central Blood Bank</TableHead>
                        <TableHead>City Hospital Bank</TableHead>
                        <TableHead>Regional Medical Center</TableHead>
                        <TableHead>Total Units</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            A+
                          </span>
                        </TableCell>
                        <TableCell>15</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell className="font-medium">25</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            B+
                          </span>
                        </TableCell>
                        <TableCell>10</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell className="font-medium">18</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            AB+
                          </span>
                        </TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell className="font-medium">8</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            O+
                          </span>
                        </TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>8</TableCell>
                        <TableCell>10</TableCell>
                        <TableCell className="font-medium">30</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            A-
                          </span>
                        </TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell className="font-medium">10</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            B-
                          </span>
                        </TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell className="font-medium">7</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            AB-
                          </span>
                        </TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell className="font-medium">3</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                            O-
                          </span>
                        </TableCell>
                        <TableCell>5</TableCell>
                        <TableCell>7</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell className="font-medium">15</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="donations" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Donation Trends</CardTitle>
                    <CardDescription>
                      Monthly donation counts for{" "}
                      {timeRange === "year" ? "the past year" : "recent months"}
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-bloodRed hover:bg-bloodRedDark"
                    onClick={() => exportReport("DonationTrends")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={donationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#EA4A4C"
                          name="Donations"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <p className="text-3xl font-bold text-bloodRed">596</p>
                      <p className="text-sm text-gray-500">
                        Total Annual Donations
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <p className="text-3xl font-bold text-bloodRed">49.6</p>
                      <p className="text-sm text-gray-500">Monthly Average</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <p className="text-3xl font-bold text-bloodRed">+24%</p>
                      <p className="text-sm text-gray-500">
                        Year-over-Year Growth
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Donation by Blood Group</CardTitle>
                    <CardDescription>
                      Distribution of donations by blood group
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryByBloodGroup}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="units"
                            name="Donations"
                            fill="#EA4A4C"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Donation Demographics</CardTitle>
                    <CardDescription>
                      Donor statistics by age group and gender
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { age: "18-24", male: 45, female: 55 },
                            { age: "25-34", male: 90, female: 85 },
                            { age: "35-44", male: 75, female: 65 },
                            { age: "45-54", male: 60, female: 55 },
                            { age: "55+", male: 40, female: 25 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="age" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="male" name="Male" fill="#1E40AF" />
                          <Bar dataKey="female" name="Female" fill="#EC4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Blood Requests by Hospital</CardTitle>
                    <CardDescription>
                      Total requests vs. approved requests
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-bloodRed hover:bg-bloodRedDark"
                    onClick={() => exportReport("RequestsByHospital")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={requestsByHospital}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="requests"
                          name="Total Requests"
                          fill="#EA4A4C"
                        />
                        <Bar
                          dataKey="approved"
                          name="Approved"
                          fill="#16A34A"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Requests by Blood Group</CardTitle>
                    <CardDescription>
                      Distribution of blood requests by group
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "A+", value: 32 },
                              { name: "B+", value: 24 },
                              { name: "AB+", value: 8 },
                              { name: "O+", value: 65 },
                              { name: "A-", value: 15 },
                              { name: "B-", value: 12 },
                              { name: "AB-", value: 5 },
                              { name: "O-", value: 38 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name }) => name}
                          >
                            {inventoryByBloodGroup.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value} requests`,
                              "Requests",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Request Reasons</CardTitle>
                    <CardDescription>
                      Purpose categories for blood requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Surgery", value: 105 },
                              { name: "Trauma/Emergency", value: 78 },
                              { name: "Cancer Treatment", value: 52 },
                              { name: "Childbirth", value: 35 },
                              { name: "Chronic Disease", value: 28 },
                              { name: "Other", value: 15 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            <Cell fill="#EA4A4C" />
                            <Cell fill="#D63C3D" />
                            <Cell fill="#B82E2F" />
                            <Cell fill="#901F20" />
                            <Cell fill="#FF6B6C" />
                            <Cell fill="#FF8182" />
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value} requests`,
                              "Requests",
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expiry" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Blood Expiry Forecast</CardTitle>
                    <CardDescription>
                      Units expiring within the next 30 days
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-bloodRed hover:bg-bloodRedDark"
                    onClick={() => exportReport("ExpiryForecast")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expiryForecast}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="days" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="units"
                          name="Units Expiring"
                          fill="#EA4A4C"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Table className="mt-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time Frame</TableHead>
                        <TableHead>Units Expiring</TableHead>
                        <TableHead>Blood Groups</TableHead>
                        <TableHead>Action Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiryForecast.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.days}</TableCell>
                          <TableCell>{item.units}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.bloodGroups.map((group, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs"
                                >
                                  {group}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {index === 0 ? (
                              <Badge className="bg-red-500 hover:bg-red-600">
                                Immediate
                              </Badge>
                            ) : index === 1 ? (
                              <Badge className="bg-amber-500 hover:bg-amber-600">
                                Planning
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Monitor
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>
                    Steps to optimize usage of soon-to-expire blood units
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <h3 className="font-medium text-red-800 mb-2">
                        Immediate Action (1-7 days)
                      </h3>
                      <ul className="text-sm space-y-1 text-red-700">
                        <li>• Contact hospitals for potential immediate use</li>
                        <li>
                          • Prioritize these units for scheduled procedures
                        </li>
                        <li>• Consider transfers to high-demand facilities</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                      <h3 className="font-medium text-amber-800 mb-2">
                        Planning Required (8-14 days)
                      </h3>
                      <ul className="text-sm space-y-1 text-amber-700">
                        <li>• Notify hospitals of available units</li>
                        <li>
                          • Plan distribution strategy for upcoming procedures
                        </li>
                        <li>
                          • Adjust upcoming donation drives based on needs
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <h3 className="font-medium text-green-800 mb-2">
                        Monitoring (15+ days)
                      </h3>
                      <ul className="text-sm space-y-1 text-green-700">
                        <li>• Continue regular inventory monitoring</li>
                        <li>• Update expiry tracking system weekly</li>
                        <li>• Prepare for redistribution as needed</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
