import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Search, Hospital } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Recipient {
  recipient_id: number;
  organization_name: string;
  email: string;
  total_requests?: number;
}

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<Recipient | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem("auth_token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        // Fetch recipients data with auth token
        const response = await fetch("http://localhost:8080/api/recipients", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch hospitals");
        }

        const responseData = await response.json();
        console.log("Recipients API response:", responseData);

        // Check if the data is in the expected format
        let recipientsData = [];
        if (Array.isArray(responseData)) {
          recipientsData = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          recipientsData = responseData.data;
        } else if (
          responseData.recipients &&
          Array.isArray(responseData.recipients)
        ) {
          recipientsData = responseData.recipients;
        } else {
          console.error(
            "Unexpected data structure from recipients API:",
            responseData
          );
          throw new Error("Unexpected data structure from API");
        }

        // Get request counts for each hospital with auth token
        const requestsResponse = await fetch(
          "http://localhost:8080/api/requests",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!requestsResponse.ok) {
          throw new Error("Failed to fetch requests data");
        }

        const requestsResponseData = await requestsResponse.json();
        console.log("Requests API response:", requestsResponseData);

        // Handle different possible response structures
        let requestsData = [];
        if (Array.isArray(requestsResponseData)) {
          requestsData = requestsResponseData;
        } else if (
          requestsResponseData.data &&
          Array.isArray(requestsResponseData.data)
        ) {
          requestsData = requestsResponseData.data;
        } else if (
          requestsResponseData.requests &&
          Array.isArray(requestsResponseData.requests)
        ) {
          requestsData = requestsResponseData.requests;
        } else {
          console.error(
            "Unexpected data structure from requests API:",
            requestsResponseData
          );
          requestsData = []; // Empty array as fallback
        }

        // Combine the data to include total requests
        const hospitalsWithRequests = recipientsData.map((hospital: any) => {
          // Ensure hospital has the expected fields or use defaults
          const hospitalId = hospital.recipient_id || hospital.id || 0;
          const hospitalRequests = requestsData.filter(
            (req: any) =>
              req.recipient_id === hospitalId || req.recipientId === hospitalId
          );

          return {
            recipient_id: hospitalId,
            organization_name:
              hospital.organization_name || hospital.name || "Unknown Hospital",
            email: hospital.email || "No email provided",
            contact_number:
              hospital.contact_number || hospital.phone || "No contact number",
            address: hospital.address || "No address provided",
            total_requests: hospitalRequests.length || 0,
          };
        });

        // Sort hospitals in descending order by ID
        hospitalsWithRequests.sort((a, b) => b.recipient_id - a.recipient_id);

        setHospitals(hospitalsWithRequests);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        setError("Failed to load hospitals");
        setLoading(false);

        // Fallback data if API fails - already sorted by ID descending
        setHospitals([
          {
            recipient_id: 3,
            organization_name: "Children's Hospital",
            email: "info@childrenshospital.org",
            contact_number: "555-123-4567",
            address: "789 Children's Way, Metropolis",
            total_requests: 5,
          },
          {
            recipient_id: 2,
            organization_name: "County Medical Center",
            email: "contact@countymedical.org",
            contact_number: "987-654-3210",
            address: "456 Medical Ave, County",
            total_requests: 8,
          },
          {
            recipient_id: 1,
            organization_name: "City General Hospital",
            email: "info@citygeneral.com",
            contact_number: "123-456-7890",
            address: "123 Hospital St, Cityville",
            total_requests: 12,
          },
        ]);
      }
    };

    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewHospital = (hospital: Recipient) => {
    setSelectedHospital(hospital);
    setShowDetails(true);
  };

  return (
    <Card className="border-t-4 border-t-bloodRed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Hospital className="mr-2 h-5 w-5 text-bloodRed" />
          Manage Hospitals
        </CardTitle>
        <CardDescription>
          View hospitals and their request history
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search hospitals by name"
            className="pl-8 focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bloodRed"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-softPink-light">
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Requests</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.length > 0 ? (
                  filteredHospitals.map((hospital) => (
                    <TableRow key={hospital.recipient_id}>
                      <TableCell>{hospital.recipient_id}</TableCell>
                      <TableCell className="font-medium">
                        {hospital.organization_name}
                      </TableCell>
                      <TableCell>{hospital.email}</TableCell>
                      <TableCell>{hospital.total_requests}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewHospital(hospital)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-4 text-gray-500"
                    >
                      No hospitals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 text-sm text-gray-500 p-2 text-center">
        {filteredHospitals.length} hospitals found
      </CardFooter>

      {/* Hospital Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Hospital className="mr-2 h-5 w-5 text-bloodRed" />
              Hospital Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this hospital
            </DialogDescription>
          </DialogHeader>
          {selectedHospital && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Hospital Name
                </h3>
                <p className="text-lg font-medium">
                  {selectedHospital.organization_name}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p>{selectedHospital.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Contact Number
                </h3>
                <p>{selectedHospital.contact_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p>{selectedHospital.address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total Requests
                </h3>
                <p className="text-xl font-bold text-bloodRed">
                  {selectedHospital.total_requests}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button className="bg-bloodRed hover:bg-bloodRedDark">
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ManageHospitals;
