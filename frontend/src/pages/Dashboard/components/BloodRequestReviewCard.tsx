import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReviewRequestDialog from "@/components/ReviewRequestDialog";
import axios from "axios";

// Interface for blood requests
interface BloodRequest {
  id: string;
  hospital: string;
  doctor: string;
  email: string;
  phone: string;
  patient: string;
  patientAge: number;
  bloodGroup: string;
  units: number;
  requiredBy: string;
  purpose: string;
  status: string;
  notes: string;
  timestamp: string;
}

// Map API data to our component format
const mapApiToRequest = (apiData: any): BloodRequest => {
  return {
    id: apiData.request_id || "",
    hospital: apiData.organization_name || "Unknown Hospital",
    doctor: apiData.doctor_name || "Unknown Doctor",
    email: apiData.contact_email || "",
    phone: apiData.contact_phone || "",
    patient: apiData.patient_name || "Unknown Patient",
    patientAge: apiData.patient_age || 0,
    bloodGroup: apiData.blood_group || "",
    units: apiData.units_requested || 0,
    requiredBy: apiData.required_by
      ? new Date(apiData.required_by).toISOString().split("T")[0]
      : "",
    purpose: apiData.purpose || "",
    status: apiData.status || "pending",
    notes: apiData.notes || "",
    timestamp: apiData.request_date || new Date().toISOString(),
  };
};

const BloodRequestReviewCard: React.FC = () => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(
    null
  );
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await axios.get(
        "http://localhost:5001/api/requests?status=pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const mappedRequests = response.data.data.map(mapApiToRequest);
        setRequests(mappedRequests);
        if (mappedRequests.length > 0 && !selectedRequest) {
          setSelectedRequest(mappedRequests[0]);
        }
      } else {
        throw new Error(
          response.data.message || "Failed to fetch pending requests"
        );
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load pending requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();

    // Setup listener for refresh events
    const handleRefresh = () => {
      fetchPendingRequests();
    };

    window.addEventListener("requests-updated", handleRefresh);

    return () => {
      window.removeEventListener("requests-updated", handleRefresh);
    };
  }, []);

  const openReviewDialog = (request: BloodRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.notes || "");
    setIsReviewOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("auth_token");

      // Prepare the update data
      const updateData = {
        status: "approved",
        notes: adminNotes,
        approved_by: JSON.parse(localStorage.getItem("user") || "{}").id,
      };

      // Make the API call
      const response = await axios.put(
        `http://localhost:5001/api/requests/${selectedRequest.id}/status`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Request Approved",
          description: `Blood request ${selectedRequest.id} has been approved.`,
          variant: "default",
        });

        // Remove from local state
        setRequests(requests.filter((req) => req.id !== selectedRequest.id));
        setIsReviewOpen(false);

        // Trigger activity refresh
        window.dispatchEvent(new CustomEvent("activity-added"));
      } else {
        throw new Error(response.data.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!adminNotes) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      // Prepare the update data
      const updateData = {
        status: "rejected",
        notes: adminNotes,
        approved_by: JSON.parse(localStorage.getItem("user") || "{}").id,
      };

      // Make the API call
      const response = await axios.put(
        `http://localhost:5001/api/requests/${selectedRequest.id}/status`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Request Rejected",
          description: `Blood request ${selectedRequest.id} has been rejected.`,
          variant: "destructive",
        });

        // Remove from local state
        setRequests(requests.filter((req) => req.id !== selectedRequest.id));
        setIsReviewOpen(false);

        // Trigger activity refresh
        window.dispatchEvent(new CustomEvent("activity-added"));
      } else {
        throw new Error(response.data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Card className="shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5 text-bloodRed" />
              Pending Blood Requests
            </CardTitle>
          </div>
          <CardDescription>
            Review and manage incoming blood requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading pending requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Required By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.id}
                      </TableCell>
                      <TableCell>{request.hospital}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${
                            request.bloodGroup.includes("-")
                              ? "bg-medicalBlue"
                              : "bg-bloodRed"
                          }`}
                        >
                          {request.bloodGroup}
                        </span>
                      </TableCell>
                      <TableCell>{request.units}</TableCell>
                      <TableCell>{request.requiredBy}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-amber/20 text-amber-dark border-amber font-medium"
                        >
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(request)}
                            className="bg-bloodRed hover:bg-bloodRed/90 text-white"
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRequest && (
        <ReviewRequestDialog
          open={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          requestData={selectedRequest}
          adminNotes={adminNotes}
          onNotesChange={(notes) => setAdminNotes(notes)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  );
};

export default BloodRequestReviewCard;
