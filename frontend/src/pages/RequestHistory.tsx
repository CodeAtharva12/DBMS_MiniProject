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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, Droplet, User, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const RequestHistory = () => {
  const { user, loading, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  // Fetch requests data
  useEffect(() => {
    if (user && isAdmin()) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("auth_token");

      // Call the API to get all requests with their status
      const response = await fetch(
        "http://localhost:5001/api/requests?include_all=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Map API data to frontend format
        const mappedRequests = result.data.map((item) => ({
          id: item.request_id,
          bloodGroup: item.blood_group,
          units: item.units_requested,
          bank: item.bank_name || "LIFESTREAM+ Blood Bank",
          hospital:
            item.recipient_name || item.organization_name || "Unknown Hospital",
          requestDate: new Date(item.request_date).toISOString().split("T")[0],
          requiredDate: new Date(item.required_by).toISOString().split("T")[0],
          purpose: item.purpose,
          status: item.status,
          patientName: item.patient_name || "Unknown",
          patientAge: item.patient_age || 0,
          notes: item.notes,
          recipientId: item.recipient_id,
        }));

        console.log("Fetched requests:", mappedRequests);
        setRequests(mappedRequests);
      } else {
        throw new Error(result.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load requests history",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
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
          <Badge className="bg-green-500 text-white border border-green-600 flex items-center">
            <Check className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="text-white border border-red-300 flex items-center">
            <X className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 border border-amber-300 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge className="border">{status}</Badge>;
    }
  };

  const handleOpenDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const filteredRequests = requests.filter((request) => {
    // Filter by status
    if (filterStatus !== "all" && request.status !== filterStatus) {
      return false;
    }

    // Filter by search term
    const searchLower = searchTerm.toLowerCase();
    return (
      request.bloodGroup.toLowerCase().includes(searchLower) ||
      request.hospital.toLowerCase().includes(searchLower) ||
      request.purpose.toLowerCase().includes(searchLower) ||
      request.patientName.toLowerCase().includes(searchLower) ||
      request.id.toString().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bloodRed mb-2">
            Request History
          </h1>
          <p className="text-gray-600">
            View all approved and rejected blood requests
          </p>
        </div>

        <Card className="shadow-lg rounded-lg overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-white to-softPink-light">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-bloodRed">
                  Blood Request History
                </CardTitle>
                <CardDescription>
                  All approved and rejected blood requests from hospitals
                </CardDescription>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests..."
                    className="pl-8 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className={`text-xs border ${
                      filterStatus === "all"
                        ? "bg-bloodRed text-white font-medium"
                        : ""
                    }`}
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </Button>
                  <Button
                    className={`text-xs border ${
                      filterStatus === "approved"
                        ? "bg-green-500 text-white"
                        : ""
                    }`}
                    onClick={() => setFilterStatus("approved")}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Approved
                  </Button>
                  <Button
                    className={`text-xs border ${
                      filterStatus === "rejected"
                        ? "bg-softPink text-bloodRed hover:bg-bloodRed hover:text-white"
                        : ""
                    }`}
                    onClick={() => setFilterStatus("rejected")}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Rejected
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
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
                      Request Date
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Purpose
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
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
                          {request.requestDate}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {request.purpose}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetails(request)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No requests found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        {selectedRequest && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
              <DialogDescription>
                Request #{selectedRequest.id} from{" "}
                {selectedRequest.hospital !== "Unknown Hospital"
                  ? selectedRequest.hospital
                  : "Unknown Hospital"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                    Request Date
                  </p>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    <p className="text-sm">{selectedRequest.requestDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Required By
                  </p>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-400" />
                    <p className="text-sm">{selectedRequest.requiredDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Purpose</p>
                  <p>{selectedRequest.purpose}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Hospital</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{selectedRequest.hospital}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Patient Information
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedRequest.notes &&
                  selectedRequest.notes.includes("Patient:") ? (
                    <p>
                      {selectedRequest.notes
                        .split("Patient:")[1]
                        .split("Request")[0]
                        .trim()}
                    </p>
                  ) : (
                    <p>
                      {selectedRequest.patientName},{" "}
                      {selectedRequest.patientAge} years
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Notes / Reason
                </p>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {selectedRequest.notes || "No notes provided"}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <Footer />
    </div>
  );
};

export default RequestHistory;
