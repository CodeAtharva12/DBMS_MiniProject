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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  PlusCircle,
  AlertCircle,
  Check,
  Clock,
  X,
  Droplet,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Droplets,
} from "lucide-react";
import { requestApi, inventoryApi, recipientApi } from "@/services/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Colors for different blood groups in the chart
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

// Map backend field names to frontend field names for display
const mapRequestData = (apiData) => {
  return apiData.map((item) => {
    // Extract patient information more reliably from notes
    let patientName = "Unknown";
    let patientAge = 0;

    console.log(
      "Processing request item:",
      item.request_id,
      "Notes:",
      item.notes
    );

    if (item.notes) {
      // Try different patterns to extract patient information
      if (item.notes.includes("Patient:") && item.notes.includes("Age:")) {
        const parts = item.notes.split(",").map((part) => part.trim());

        // Find the part with "Patient:" and extract the name
        const patientPart = parts.find((part) => part.includes("Patient:"));
        if (patientPart) {
          patientName = patientPart.replace("Patient:", "").trim();
        }

        // Find the part with "Age:" and extract the age
        const agePart = parts.find((part) => part.includes("Age:"));
        if (agePart) {
          const ageValue = agePart.replace("Age:", "").trim();
          patientAge = parseInt(ageValue);
        }
      }
    }

    console.log("Extracted patient info:", { patientName, patientAge });

    return {
      id: item.request_id,
      bloodGroup: item.blood_group,
      units: item.units_requested,
      bank: item.bank_name || "LIFESTREAM+ Blood Bank",
      requestDate: new Date(item.request_date).toISOString().split("T")[0],
      requiredDate: new Date(item.required_by).toISOString().split("T")[0],
      purpose: item.purpose,
      status: item.status,
      patientName: patientName,
      patientAge: patientAge,
      notes: item.notes,
      originalNotes: item.notes, // Keep the original notes for debugging
    };
  });
};

// Map inventory data from API to frontend format
const mapInventoryData = (apiData) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    console.warn("Empty or invalid inventory data received:", apiData);
    return [];
  }

  return apiData.map((item, index) => ({
    id: index + 1,
    bloodGroup: item.blood_group,
    bank: item.bank_name || "LIFESTREAM+ Blood Bank",
    unitsAvailable: parseFloat(item.available_units) || 0,
    color: BLOOD_GROUP_COLORS[item.blood_group] || "#CCCCCC",
    value: parseFloat(item.available_units) || 0, // Adding 'value' for PieChart
  }));
};

// Custom tooltip for the pie chart
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

const BloodRequests = () => {
  const { user, loading, isHospital } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [bloodBanks, setBloodBanks] = useState([
    { id: 1, name: "LIFESTREAM+ Blood Bank" },
  ]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form states for new request
  const [requestBloodGroup, setRequestBloodGroup] = useState("");
  const [requestUnits, setRequestUnits] = useState("");
  const [unitsError, setUnitsError] = useState("");
  const [requestBank, setRequestBank] = useState("1"); // Default bank ID
  const [requiredDate, setRequiredDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");

  const { toast } = useToast();

  // Auto-open request form when coming from dashboard
  useEffect(() => {
    const shouldOpenForm = sessionStorage.getItem("openRequestForm");
    if (shouldOpenForm === "true") {
      handleOpenNewRequestDialog();
      sessionStorage.removeItem("openRequestForm");
    }
  }, []);

  // Fetch blood requests data for current hospital
  useEffect(() => {
    if (user && isHospital()) {
      fetchRequests();
      fetchInventory();

      // Add event listener for inventory updates
      const handleInventoryUpdate = () => {
        console.log(
          "Inventory update event detected in BloodRequests, refreshing data..."
        );
        fetchInventory();
      };

      // Listen for activity-added events (when inventory changes)
      window.addEventListener("activity-added", handleInventoryUpdate);

      // Cleanup
      return () => {
        window.removeEventListener("activity-added", handleInventoryUpdate);
      };
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoadingData(true);
    try {
      // Use real API
      const response = await requestApi.getAll();
      // Alternative when recipient-specific endpoint is ready:
      // const response = await requestApi.getByRecipient(parseInt(user.id));
      if (response.success) {
        console.log("Raw API response data:", response.data);

        // Directly handle patient information here as a fallback
        const processedData = response.data.map((item) => {
          // Ensure all fields are present even if they're missing in the API response
          return {
            ...item,
            notes: item.notes || "",
          };
        });

        setRequests(mapRequestData(processedData));
      } else {
        throw new Error(response.message || "Failed to load blood requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load blood requests",
        variant: "destructive",
      });
      // If no requests were found or there was an error, make sure requests is an empty array
      setRequests([]);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchInventory = async () => {
    try {
      // Use real API to fetch inventory data from database
      const response = await inventoryApi.getAll();
      if (response.success) {
        const formattedInventory = mapInventoryData(response.data);
        console.log(
          "Updated blood requests inventory data:",
          formattedInventory
        );
        // Ensure we have at least some data for the chart
        if (formattedInventory.length === 0) {
          // Add some placeholder data if the database returns empty
          const placeholderData = [
            {
              id: 1,
              bloodGroup: "A+",
              unitsAvailable: 9,
              color: BLOOD_GROUP_COLORS["A+"],
            },
            {
              id: 2,
              bloodGroup: "O+",
              unitsAvailable: 30,
              color: BLOOD_GROUP_COLORS["O+"],
            },
            {
              id: 3,
              bloodGroup: "B+",
              unitsAvailable: 18,
              color: BLOOD_GROUP_COLORS["B+"],
            },
            {
              id: 4,
              bloodGroup: "AB+",
              unitsAvailable: 13,
              color: BLOOD_GROUP_COLORS["AB+"],
            },
            {
              id: 5,
              bloodGroup: "A-",
              unitsAvailable: 10,
              color: BLOOD_GROUP_COLORS["A-"],
            },
            {
              id: 6,
              bloodGroup: "O-",
              unitsAvailable: 15,
              color: BLOOD_GROUP_COLORS["O-"],
            },
            {
              id: 7,
              bloodGroup: "B-",
              unitsAvailable: 7,
              color: BLOOD_GROUP_COLORS["B-"],
            },
            {
              id: 8,
              bloodGroup: "AB-",
              unitsAvailable: 3,
              color: BLOOD_GROUP_COLORS["AB-"],
            },
          ];
          setInventory(placeholderData);
          console.log("Using placeholder inventory data:", placeholderData);
        } else {
          setInventory(formattedInventory);
        }
      } else {
        throw new Error(response.message || "Failed to load inventory");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      // Add fallback data if the API fails
      const fallbackData = [
        {
          id: 1,
          bloodGroup: "A+",
          unitsAvailable: 9,
          color: BLOOD_GROUP_COLORS["A+"],
        },
        {
          id: 2,
          bloodGroup: "O+",
          unitsAvailable: 30,
          color: BLOOD_GROUP_COLORS["O+"],
        },
        {
          id: 3,
          bloodGroup: "B+",
          unitsAvailable: 18,
          color: BLOOD_GROUP_COLORS["B+"],
        },
        {
          id: 4,
          bloodGroup: "AB+",
          unitsAvailable: 13,
          color: BLOOD_GROUP_COLORS["AB+"],
        },
        {
          id: 5,
          bloodGroup: "A-",
          unitsAvailable: 10,
          color: BLOOD_GROUP_COLORS["A-"],
        },
        {
          id: 6,
          bloodGroup: "O-",
          unitsAvailable: 15,
          color: BLOOD_GROUP_COLORS["O-"],
        },
        {
          id: 7,
          bloodGroup: "B-",
          unitsAvailable: 7,
          color: BLOOD_GROUP_COLORS["B-"],
        },
        {
          id: 8,
          bloodGroup: "AB-",
          unitsAvailable: 3,
          color: BLOOD_GROUP_COLORS["AB-"],
        },
      ];
      setInventory(fallbackData);
      console.log("Using fallback inventory data due to error:", fallbackData);

      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load inventory",
        variant: "destructive",
      });
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user || !isHospital()) {
    return <Navigate to="/login" />;
  }

  const handleCreateRequest = async () => {
    // Reset any previous errors
    setUnitsError("");

    if (
      !requestBloodGroup ||
      !requestUnits ||
      !requestBank ||
      !requiredDate ||
      !purpose ||
      !patientName ||
      !patientAge
    ) {
      toast({
        title: "Error",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate units
    const units = parseInt(requestUnits);
    if (isNaN(units) || units <= 0) {
      setUnitsError("Please enter a valid number of units");
      return;
    }

    if (units > 20) {
      setUnitsError("Maximum 20 units can be requested at once");
      return;
    }

    try {
      // Get recipient ID first (in case user object doesn't have the right recipient_id)
      let recipientId = parseInt(user.id);

      // If we need to look up the recipient by the user's email (if user.id is not a valid recipient_id)
      try {
        const recipientsResponse = await recipientApi.getAll();
        console.log("Recipients response:", recipientsResponse); // Debug

        if (recipientsResponse.success) {
          // Find the recipient that matches this user (by name or email)
          const recipient = recipientsResponse.data.find(
            (r) => r.organization_name === user.name || r.email === user.email
          );
          if (recipient) {
            recipientId = recipient.recipient_id;
            console.log("Found recipient ID:", recipientId); // Debug
          }
        }
      } catch (err) {
        console.error("Error fetching recipient data:", err);
        // Continue with user.id if we can't get the recipient
      }

      // Prepare request data
      const requestData = {
        recipient_id: recipientId,
        blood_group: requestBloodGroup,
        units_requested: parseInt(requestUnits),
        bank_id: parseInt(requestBank),
        required_by: requiredDate,
        purpose: purpose,
        notes: `Patient: ${patientName}, Age: ${patientAge}`,
        status: "pending",
      };

      console.log("Sending request data:", requestData); // Debug

      // Use real API
      const response = await requestApi.create(requestData);
      console.log("Create request response:", response); // Debug

      if (response.success) {
        toast({
          title: "Success",
          description: "Blood request submitted successfully",
        });
        // Reset form and close dialog
        setRequestBloodGroup("");
        setRequestUnits("");
        setRequestBank("1");
        setRequiredDate("");
        setPurpose("");
        setPatientName("");
        setPatientAge("");
        setNewRequestOpen(false);
        // Refresh requests list
        fetchRequests();
      } else {
        throw new Error(response.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error creating request:", error);
      let errorMsg = "Failed to submit request";

      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }

      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleViewRequestDetails = (request) => {
    setSelectedRequest(request);
    setRequestDetailsOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-700">
            <Check className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-700">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-700">
            <X className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-700">
            {status}
          </Badge>
        );
    }
  };

  // Return the card for Available Blood Units
  const renderAvailableBloodUnitsCard = () => {
    const totalUnits = inventory.reduce(
      (total, item) => total + parseFloat(item.unitsAvailable || 0),
      0
    );

    console.log("Rendering chart with inventory:", inventory);

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">
            Available Blood Units
          </CardTitle>
          <CardDescription>
            Current inventory at LIFESTREAM+ Blood Bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold">{totalUnits}</div>
            <div className="text-sm text-gray-500">Total Units Available</div>
          </div>

          <div className="h-[300px] w-full mx-auto flex justify-center items-center">
            {inventory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={inventory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="unitsAvailable"
                    nameKey="bloodGroup"
                    label={(entry) => entry.bloodGroup}
                    labelLine={true}
                  >
                    {inventory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.color || BLOOD_GROUP_COLORS["A+"] || "#FF6B6B"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 100 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">
                <p>No inventory data available</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-x-4 gap-y-2 mt-4 px-2">
            {inventory.map((item) => (
              <div key={item.id} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex-1">{item.bloodGroup}</div>
                <div className="font-semibold">{item.unitsAvailable}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Button click handler to reset form and open dialog
  const handleOpenNewRequestDialog = () => {
    // Reset all form fields
    setRequestBloodGroup("");
    setRequestUnits("");
    setUnitsError("");
    setRequestBank("1");
    setRequiredDate("");
    setPurpose("");
    setPatientName("");
    setPatientAge("");

    // Open the dialog
    setNewRequestOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Blood Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your blood transfusion requests
              </p>
            </div>
            <Button
              onClick={handleOpenNewRequestDialog}
              className="bg-bloodRed hover:bg-bloodRed/90 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {renderAvailableBloodUnitsCard()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search by ID or blood type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center space-x-2 justify-end">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Blood Type:</span>
                  <Select
                    value={filterBloodGroup}
                    onValueChange={setFilterBloodGroup}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
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
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Status:</span>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Requests</CardTitle>
                <CardDescription>
                  {requests.length > 0
                    ? `Showing ${requests.length} request(s)`
                    : "No requests found"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Blood Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Required By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests
                        .filter((request) => {
                          // Filter by search term (ID or blood group)
                          const searchMatch =
                            searchTerm === "" ||
                            request.id.toString().includes(searchTerm) ||
                            request.bloodGroup
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase());

                          // Filter by blood group
                          const bloodGroupMatch =
                            filterBloodGroup === "all" ||
                            request.bloodGroup === filterBloodGroup;

                          // Filter by status
                          const statusMatch =
                            filterStatus === "all" ||
                            request.status === filterStatus;

                          return searchMatch && bloodGroupMatch && statusMatch;
                        })
                        .map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              #{request.id}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                                {request.bloodGroup}
                              </span>
                            </TableCell>
                            <TableCell>{request.units}</TableCell>
                            <TableCell>{request.requestDate}</TableCell>
                            <TableCell>{request.requiredDate}</TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleViewRequestDetails(request)
                                }
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                      {requests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AlertCircle className="h-10 w-10 mb-2" />
                              <p className="text-lg font-medium">
                                No blood requests found
                              </p>
                              <p className="text-sm mb-3">
                                You haven't submitted any blood requests yet.
                              </p>
                              <Button
                                variant="default"
                                onClick={handleOpenNewRequestDialog}
                                className="mt-2 bg-bloodRed hover:bg-bloodRed/90 text-white"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create your first request
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* New Request Dialog */}
      <Dialog
        open={newRequestOpen}
        onOpenChange={(open) => {
          if (open) {
            // If opening the dialog, reset form fields
            handleOpenNewRequestDialog();
          } else {
            // If closing, just update the state
            setNewRequestOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Blood Request</DialogTitle>
            <DialogDescription>
              Submit a new request for blood units for your patients.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood-group">Blood Type</Label>
                <Select
                  value={requestBloodGroup}
                  onValueChange={setRequestBloodGroup}
                >
                  <SelectTrigger id="blood-group">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units Needed</Label>
                <Input
                  id="units"
                  type="number"
                  value={requestUnits}
                  onChange={(e) => {
                    setRequestUnits(e.target.value);
                    const value = parseInt(e.target.value);
                    if (e.target.value === "") {
                      setUnitsError("");
                    } else if (isNaN(value) || value <= 0) {
                      setUnitsError("Please enter a valid number of units");
                    } else if (value > 20) {
                      setUnitsError(
                        "Maximum 20 units can be requested at once"
                      );
                    } else {
                      setUnitsError("");
                    }
                  }}
                  placeholder="Enter units"
                  max="20"
                  min="1"
                  className={unitsError ? "border-red-500" : ""}
                />
                {unitsError && (
                  <p className="text-red-500 text-sm">{unitsError}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Blood Bank</Label>
              <Select value={requestBank} onValueChange={setRequestBank}>
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {bloodBanks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-date">Required By</Label>
              <Input
                id="required-date"
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emergency Surgery">
                    Emergency Surgery
                  </SelectItem>
                  <SelectItem value="Scheduled Surgery">
                    Scheduled Surgery
                  </SelectItem>
                  <SelectItem value="Trauma Patient">Trauma Patient</SelectItem>
                  <SelectItem value="Cancer Treatment">
                    Cancer Treatment
                  </SelectItem>
                  <SelectItem value="Blood Disorder">Blood Disorder</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-age">Patient Age</Label>
                <Input
                  id="patient-age"
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="35"
                  min="0"
                  max="120"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRequestOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              className="bg-bloodRed hover:bg-bloodRed/90 text-white"
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Details Dialog */}
      <Dialog open={requestDetailsOpen} onOpenChange={setRequestDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Blood request #{selectedRequest?.id} information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">
                    Request ID
                  </p>
                  <p className="font-medium">#{selectedRequest.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Droplet className="h-4 w-4 mr-1 text-bloodRed" />
                    Blood Type
                  </p>
                  <p className="font-semibold">{selectedRequest.bloodGroup}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Units</p>
                  <p>{selectedRequest.units} unit(s)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Request Date
                  </p>
                  <p>{selectedRequest.requestDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Required By
                  </p>
                  <p>{selectedRequest.requiredDate}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Purpose</p>
                <p className="bg-gray-50 p-2 rounded-md border">
                  {selectedRequest.purpose}
                </p>
              </div>

              <div className="rounded-md border overflow-hidden">
                <div className="bg-gray-100 p-3">
                  <p className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Patient Information
                  </p>
                </div>
                <div className="p-3 space-y-2">
                  {/* Only show structured patient info if we have it */}
                  {selectedRequest.patientName !== "Unknown" ||
                  (selectedRequest.patientAge > 0 &&
                    !isNaN(selectedRequest.patientAge)) ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="font-medium">
                          {selectedRequest.patientName !== "Unknown" &&
                          selectedRequest.patientName !==
                            "Request approved by admin"
                            ? selectedRequest.patientName
                            : "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Age</p>
                        <p>
                          {!isNaN(selectedRequest.patientAge) &&
                          selectedRequest.patientAge > 0
                            ? `${selectedRequest.patientAge} years`
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Patient information not available in structured format.
                      </p>
                      <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                        <p className="font-medium mb-1">Original Notes:</p>
                        <p>{selectedRequest.notes || "No notes available"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Additional Notes
                  </p>
                  <p className="text-sm bg-gray-50 p-2 rounded-md border">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setRequestDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default BloodRequests;
