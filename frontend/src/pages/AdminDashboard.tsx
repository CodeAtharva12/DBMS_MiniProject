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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  X,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Droplets,
  Heart,
  Activity,
  Calendar,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  bloodRequests,
  inventory as inventoryData,
  reports as reportsApi,
} from "@/lib/api";
import { requestApi, inventoryApi } from "@/services/api";

// Import custom components
import BloodInventoryChart from "./Dashboard/components/BloodInventoryChart";
import AdminQuickActionsCard from "./Dashboard/components/AdminQuickActionsCard";
import AdminRecentActivityCard, {
  addActivity,
} from "./Dashboard/components/AdminRecentActivityCard";

// Mock blood requests data for fallback when API isn't available
const mockRequests = [
  {
    id: 1,
    bloodGroup: "O+",
    units: 2,
    bank: "LIFESTREAM+",
    requestDate: "2024-02-20",
    requiredDate: "2024-02-21",
    purpose: "Emergency Surgery",
    status: "approved",
    hospital: "City Hospital",
    contact: "Dr. Sarah Johnson",
    email: "sarah@cityhospital.com",
    phone: "123-456-7890",
    patientName: "David Wilson",
    patientAge: 42,
    notes: "Approved and ready for pickup",
  },
  {
    id: 2,
    bloodGroup: "AB+",
    units: 1,
    bank: "LIFESTREAM+",
    requestDate: "2024-02-22",
    requiredDate: "2024-02-23",
    purpose: "Scheduled Surgery",
    status: "pending",
    hospital: "Metro Medical Center",
    contact: "Dr. James Davis",
    email: "james@metromedical.com",
    phone: "098-765-4321",
    patientName: "Emily Johnson",
    patientAge: 35,
    notes: "Awaiting approval",
  },
  {
    id: 3,
    bloodGroup: "A-",
    units: 3,
    bank: "LIFESTREAM+",
    requestDate: "2024-02-18",
    requiredDate: "2024-02-19",
    purpose: "Trauma Patient",
    status: "rejected",
    hospital: "County General",
    contact: "Dr. Robert Lee",
    email: "robert@countygeneral.com",
    phone: "555-123-4567",
    patientName: "Michael Brown",
    patientAge: 28,
    notes: "Insufficient stock",
  },
  {
    id: 4,
    bloodGroup: "B+",
    units: 2,
    bank: "LIFESTREAM+",
    requestDate: "2024-02-24",
    requiredDate: "2024-02-26",
    purpose: "Transfusion",
    status: "pending",
    hospital: "City Hospital",
    contact: "Dr. Sarah Johnson",
    email: "sarah@cityhospital.com",
    phone: "123-456-7890",
    patientName: "Lisa Chen",
    patientAge: 55,
    notes: "Awaiting approval",
  },
];

// Mock inventory data for fallback when API isn't available
const mockInventory = [
  { bloodGroup: "A+", unitsAvailable: 25 },
  { bloodGroup: "B+", unitsAvailable: 18 },
  { bloodGroup: "AB+", unitsAvailable: 8 },
  { bloodGroup: "O+", unitsAvailable: 30 },
  { bloodGroup: "A-", unitsAvailable: 10 },
  { bloodGroup: "B-", unitsAvailable: 7 },
  { bloodGroup: "AB-", unitsAvailable: 3 },
  { bloodGroup: "O-", unitsAvailable: 15 },
];

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const { toast } = useToast();

  // Fetch data when component mounts
  useEffect(() => {
    if (user && isAdmin()) {
      fetchRequests();
      fetchInventory();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoadingData(true);
    try {
      // Use real API call instead of mock data
      const token = localStorage.getItem("auth_token");

      const response = await fetch("http://localhost:5001/api/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("Raw API response:", result); // Debug log

      if (result.success) {
        const formattedRequests = result.data.map((item) => {
          // Ensure status is normalized to lowercase
          const normalizedStatus = item.status
            ? item.status.toLowerCase()
            : "pending";

          console.log(
            `Processing request ID ${item.request_id}, status: ${item.status} -> ${normalizedStatus}`
          );

          return {
            id: item.request_id,
            bloodGroup: item.blood_group,
            units: item.units_requested,
            bank: item.bank_name || "LIFESTREAM+",
            requestDate: new Date(item.request_date)
              .toISOString()
              .split("T")[0],
            requiredDate: new Date(item.required_by)
              .toISOString()
              .split("T")[0],
            purpose: item.purpose,
            status: normalizedStatus,
            hospital: item.recipient_name || "Unknown Hospital",
            contact: item.contact_person || "Unknown Contact",
            email: item.contact_email || "",
            phone: item.contact_number || "",
            patientName: item.notes
              ? item.notes.split(",")[0]?.replace("Patient:", "").trim()
              : "Unknown",
            patientAge: item.notes
              ? parseInt(item.notes.split(",")[1]?.replace("Age:", "").trim())
              : 0,
            notes: item.notes || "",
          };
        });

        console.log("Formatted requests:", formattedRequests);
        setRequests(formattedRequests);
      } else {
        throw new Error(result.message || "Failed to load blood requests");
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

      // Fall back to mock data if API fails
      console.log("Using mock request data as fallback");
      setRequests(mockRequests);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchInventory = async () => {
    try {
      // Use the inventoryApi service
      const response = await inventoryApi.getAll();

      if (response.success) {
        const formattedInventory = response.data.map((item) => {
          // Ensure unit amounts are properly converted to numbers
          const unitsAvailable =
            typeof item.available_units === "string"
              ? parseFloat(item.available_units)
              : item.available_units;

          return {
            bloodGroup: item.blood_group,
            bankId: item.bank_id,
            unitsAvailable: unitsAvailable,
            rawData: item, // Store the raw data for debugging
          };
        });

        console.log("Fetched real inventory:", formattedInventory);
        setInventory(formattedInventory);
      } else {
        throw new Error(response.message || "Failed to load inventory");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load inventory",
        variant: "destructive",
      });

      // Fall back to mock data if API fails
      console.log("Using mock inventory data as fallback");
      setInventory(mockInventory);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bloodRed"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="text-red-500 border border-red-300 flex items-center">
            <X className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge className="border">{status}</Badge>;
    }
  };

  const handleOpenReview = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes(request.notes || "");
    setReviewOpen(true);
  };

  const checkInventory = (bloodGroup: string, units: number) => {
    const inventoryItem = inventory.find(
      (item) => item.bloodGroup === bloodGroup
    );

    console.log("Checking inventory for:", bloodGroup);
    console.log("Units requested:", units);
    console.log("Current inventory:", inventory);
    console.log("Found inventory item:", inventoryItem);

    if (!inventoryItem) {
      console.log("No inventory found for this blood group");
      return false;
    }

    // Ensure we're working with numbers for comparison
    const unitsRequested = parseFloat(String(units));
    const available = parseFloat(String(inventoryItem.unitsAvailable));

    console.log("Units requested (parsed):", unitsRequested);
    console.log("Available units (parsed):", available);
    console.log("Is sufficient:", available >= unitsRequested);

    return available >= unitsRequested;
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    try {
      // Parse units as floats for consistent comparison
      const requestedUnits = parseFloat(String(selectedRequest.units));
      console.log(
        "Requested units (parsed):",
        requestedUnits,
        "Type:",
        typeof requestedUnits
      );

      // Check inventory first
      const inventoryItem = inventory.find(
        (item) => item.bloodGroup === selectedRequest.bloodGroup
      );

      if (!inventoryItem) {
        toast({
          title: "Inventory Error",
          description: `No inventory found for ${selectedRequest.bloodGroup} blood group.`,
          variant: "destructive",
        });
        return;
      }

      // Ensure availableUnits is a number
      const availableUnits =
        typeof inventoryItem.unitsAvailable === "string"
          ? parseFloat(inventoryItem.unitsAvailable)
          : inventoryItem.unitsAvailable;

      console.log(
        "Available units (parsed):",
        availableUnits,
        "Type:",
        typeof availableUnits
      );
      console.log(
        "Comparison:",
        availableUnits < requestedUnits,
        "Diff:",
        availableUnits - requestedUnits
      );

      if (availableUnits < requestedUnits) {
        toast({
          title: "Insufficient Stock",
          description: `Not enough ${selectedRequest.bloodGroup} blood units available (only ${availableUnits} of ${requestedUnits} units available).`,
          variant: "destructive",
        });
        return;
      }

      console.log("Approving request:", selectedRequest);

      // Make real API call to update request status
      const requestId = selectedRequest.id;
      if (!requestId) {
        toast({
          title: "Error",
          description: "Invalid request ID",
          variant: "destructive",
        });
        return;
      }

      setLoadingData(true); // Show loading indicator

      // Log the exact data being sent to the API for debugging
      console.log("Request ID:", requestId, "Type:", typeof requestId);

      // Convert the request ID to a number to ensure proper type
      const numericRequestId = parseInt(String(requestId), 10);

      // 1. Update the request status via API
      const response = await requestApi.approve(numericRequestId);

      // Check for user authentication error
      if (
        !response.success &&
        response.message?.includes("User not authenticated")
      ) {
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please log in again.",
          variant: "destructive",
        });
        // Redirect to login page
        window.location.href = "/login";
        return;
      }

      // If approval succeeded
      if (response.success) {
        // Immediately show a toast indicating units have been deducted
        toast({
          title: "Request Approved",
          description: `Blood request from ${selectedRequest.hospital} has been approved. ${requestedUnits} units of ${selectedRequest.bloodGroup} deducted from inventory.`,
        });

        // Close the dialog immediately to prevent user from making more changes
        setReviewOpen(false);

        // Reset admin notes
        setAdminNotes("");

        // Delay the refresh a bit to ensure backend has time to complete all operations
        setTimeout(async () => {
          try {
            // Refresh inventory first to get updated counts from server
            await fetchInventory();

            // Then refresh requests
            await fetchRequests();
          } catch (refreshError) {
            console.error(
              "Error refreshing data after approval:",
              refreshError
            );
          } finally {
            setLoadingData(false); // Hide loading indicator
          }
        }, 1000); // 1 second delay
      } else {
        // If there was an error, show it to the user
        setLoadingData(false);
        toast({
          title: "Approval Failed",
          description: response.message || "Failed to approve request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      });
      setLoadingData(false); // Hide loading indicator
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    if (!adminNotes) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Make real API call to update request status
      const requestId = selectedRequest.id;
      if (!requestId) {
        toast({
          title: "Error",
          description: "Invalid request ID",
          variant: "destructive",
        });
        return;
      }

      setLoadingData(true); // Show loading indicator

      // Convert the request ID to a number to ensure proper type
      const numericRequestId = parseInt(String(requestId), 10);
      console.log("Rejecting request ID:", numericRequestId);

      // Use the requestApi service for consistency
      const rejectResponse = await requestApi.reject(
        numericRequestId,
        adminNotes
      );

      // Check for user authentication error
      if (
        !rejectResponse.success &&
        rejectResponse.message?.includes("User not authenticated")
      ) {
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please log in again.",
          variant: "destructive",
        });
        // Redirect to login page
        window.location.href = "/login";
        return;
      }

      if (rejectResponse.success) {
        toast({
          title: "Request Rejected",
          description: `Blood request from ${selectedRequest.hospital} has been rejected.`,
        });

        // Close the dialog immediately
        setReviewOpen(false);

        // Reset admin notes
        setAdminNotes("");

        // Delay the refresh to ensure backend processing completes
        setTimeout(async () => {
          try {
            // Refresh the requests
            await fetchRequests();
          } catch (refreshError) {
            console.error(
              "Error refreshing data after rejection:",
              refreshError
            );
          } finally {
            setLoadingData(false); // Hide loading indicator
          }
        }, 1000); // 1 second delay
      } else {
        // Show the error if rejection failed
        setLoadingData(false);
        toast({
          title: "Rejection Failed",
          description: rejectResponse.message || "Failed to reject request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      });
      setLoadingData(false); // Hide loading indicator
    }
  };

  // Keep the pendingRequests function to filter just pending requests
  const pendingRequests = requests.filter((req) => {
    // Add debug logging for each request
    console.log(
      `Request ${req.id} status: "${req.status}" (type: ${typeof req.status})`
    );

    // Case-insensitive comparison
    return (
      req.status &&
      (req.status.toLowerCase() === "pending" ||
        req.status === "PENDING" ||
        req.status === "Pending")
    );
  });

  const todayRequests = requests.filter((req) => {
    const today = new Date().toISOString().split("T")[0];
    return req.requiredDate === today;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-softPink-light to-white">
      <Navbar />

      <main className="flex-grow py-6 px-4 md:py-10 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-white p-6 rounded-lg shadow-md">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-bloodRed mb-2">
                Admin Dashboard
              </h1>
              <p className="text-mediumGray">
                Manage blood requests and inventory
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                onClick={() => {
                  // Use sessionStorage to indicate the form should be opened immediately
                  sessionStorage.setItem("openDonorForm", "true");
                  window.location.href = "/donors";
                }}
                className="action-btn-primary flex items-center"
              >
                <Heart className="h-4 w-4 mr-2" />
                Add Donor
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Blood Inventory Chart */}
            <div className="md:col-span-1">
              <BloodInventoryChart />
            </div>

            {/* Admin Quick Actions Card */}
            <div className="md:col-span-1">
              <AdminQuickActionsCard />
            </div>

            {/* Recent Activity Card */}
            <div className="md:col-span-1">
              <AdminRecentActivityCard />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-white to-softPink-light shadow-lg hover:shadow-xl transition-shadow border-t-4 border-bloodRed rounded-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-bloodRed">
                  <Clock className="h-5 w-5 mr-2 text-bloodRed" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center">
                <div className="text-4xl font-bold text-amber-500">
                  {pendingRequests.length}
                </div>
                <div className="ml-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <p className="text-sm text-gray-500 ml-2">Waiting for review</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-softPink-light shadow-lg hover:shadow-xl transition-shadow border-t-4 border-bloodRed rounded-lg overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-bloodRed">
                  <Activity className="h-5 w-5 mr-2 text-bloodRed" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-gray-700">
                  {requests.length}
                </div>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 shadow-lg border-t-4 border-t-bloodRed rounded-lg overflow-hidden">
            <CardHeader className="pb-3 md:flex md:flex-row md:items-center md:justify-between bg-gradient-to-r from-white to-softPink-light">
              <div>
                <CardTitle className="flex items-center text-bloodRed">
                  <Heart className="h-5 w-5 mr-2 text-bloodRed pulse-animation" />
                  Pending Blood Requests
                </CardTitle>
                <CardDescription>
                  Requests waiting for your review
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <ScrollArea className="max-h-[450px] w-full">
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Droplets className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      No pending requests at this time
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-softPink-light">
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Blood Group</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Units
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Hospital
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Required By
                          </TableHead>
                          <TableHead className="hidden lg:table-cell">
                            Purpose
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow
                            key={request.id}
                            className="hover:bg-softPink/10"
                          >
                            <TableCell>{request.id}</TableCell>
                            <TableCell>
                              <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs font-semibold">
                                {request.bloodGroup}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {request.units}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {request.hospital}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {request.requiredDate}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {request.purpose}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(request.status)}
                            </TableCell>
                            <TableCell>
                              <Button
                                className="action-btn-primary bg-softPink text-bloodRed hover:bg-bloodRed hover:text-white"
                                onClick={() => handleOpenReview(request)}
                              >
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        {selectedRequest && (
          <DialogContent className="max-w-3xl overflow-hidden p-0">
            <div className="flex flex-col md:flex-row">
              {/* Left side - Header and main request information */}
              <div className="md:w-1/2 p-6 bg-white">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">
                    {selectedRequest.status === "pending"
                      ? "Review Request"
                      : "Request Details"}
                  </DialogTitle>
                  <DialogDescription>
                    Request #{selectedRequest.id} from{" "}
                    {selectedRequest.hospital}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Blood Group
                    </p>
                    <p className="text-bloodRed font-semibold">
                      {selectedRequest.bloodGroup}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Units</p>
                    <p>{selectedRequest.units}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Blood Bank
                    </p>
                    <p>LIFESTREAM+</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Required By
                    </p>
                    <p>{selectedRequest.requiredDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Purpose</p>
                    <p>{selectedRequest.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
              </div>

              {/* Right side - Hospital and patient information */}
              <div className="md:w-1/2 p-6 border-t md:border-t-0 md:border-l bg-gray-50">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Hospital Information
                  </p>
                  <div className="bg-white p-3 rounded-md border">
                    <p className="font-medium">{selectedRequest.hospital}</p>
                    <p className="text-sm">{selectedRequest.contact}</p>
                    <p className="text-sm">{selectedRequest.email}</p>
                    <p className="text-sm">{selectedRequest.phone}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Patient Information
                  </p>
                  <div className="bg-white p-3 rounded-md border">
                    <p>
                      {selectedRequest.patientName},{" "}
                      {selectedRequest.patientAge} years
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Notes / Reason
                  </p>
                  {selectedRequest.status === "pending" ? (
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes or reason for approval/rejection"
                      className="h-20"
                    />
                  ) : (
                    <div className="bg-white p-3 rounded-md border text-sm">
                      {selectedRequest.notes || "No notes provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory check and buttons */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col md:flex-row justify-between items-center">
                {selectedRequest.status === "pending" && (
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm font-medium text-gray-500 mb-2 md:hidden">
                      Inventory Check
                    </p>
                    <div className="bg-white md:bg-transparent p-3 md:p-0 rounded-md md:rounded-none border md:border-0">
                      {(() => {
                        const inventoryItem = inventory.find(
                          (item) =>
                            item.bloodGroup === selectedRequest.bloodGroup
                        );

                        // Ensure values are properly parsed as numbers
                        const availableUnits = inventoryItem
                          ? parseFloat(String(inventoryItem.unitsAvailable))
                          : 0;
                        const requested = parseFloat(
                          String(selectedRequest.units)
                        );
                        const isAvailable = availableUnits >= requested;

                        return isAvailable ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-2" />
                            <span>
                              Sufficient units available ({availableUnits} units
                              of {selectedRequest.bloodGroup})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500">
                            <X className="h-4 w-4 mr-2" />
                            <span>
                              Insufficient units available (only{" "}
                              {availableUnits} of {requested}{" "}
                              {selectedRequest.bloodGroup} units required)
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {selectedRequest.status === "pending" ? (
                  <div className="flex space-x-3 w-full md:w-auto">
                    <Button
                      className="flex-1 md:flex-initial px-8 bg-red-500 hover:bg-red-600 text-white"
                      onClick={handleRejectRequest}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 md:flex-initial px-8 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleApproveRequest}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setReviewOpen(false)}
                    className="w-full md:w-auto"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
