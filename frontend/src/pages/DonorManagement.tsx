import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { donorsApi, donationApi, inventoryApi } from "@/services/api";

// Add mapping functions to transform API data to frontend format
const mapDonorData = (apiData) => {
  return apiData.map((item) => {
    const lastDonationDate = item.last_donation_date
      ? new Date(item.last_donation_date)
      : null;
    const eligibleDate = lastDonationDate ? new Date(lastDonationDate) : null;

    if (eligibleDate) {
      // Add 56 days for eligibility (8 weeks between donations)
      eligibleDate.setDate(eligibleDate.getDate() + 56);
    }

    return {
      id: item.donor_id,
      name: item.full_name,
      email: item.email,
      address: item.address,
      gender: item.gender,
      bloodGroup: item.blood_group,
      dob: item.date_of_birth,
      age: item.age ? parseInt(item.age) : calculateAge(item.date_of_birth),
      phone: item.contact_number,
      lastDonation: lastDonationDate
        ? format(lastDonationDate, "PPP")
        : "Never donated",
      eligibleAgain: eligibleDate
        ? new Date() >= eligibleDate
          ? "Eligible now"
          : `Eligible on ${format(eligibleDate, "PPP")}`
        : "Eligible now",
      health_status: item.health_status || "Unknown",
      medical_history: item.medical_history || "None reported",
      // Default to 0 if total_units is not present
      units: item.total_units || 0,
      // Store the last donation date and eligible date for eligibility checking
      lastDonationDate,
      eligibleDate,
    };
  });
};

// Function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;

  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

const DonorManagement = () => {
  const { user, loading, isAdmin } = useAuth();
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("all");
  const [newDonorOpen, setNewDonorOpen] = useState(false);
  const [newDonation, setNewDonation] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [deletingDonor, setDeletingDonor] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [addingDonor, setAddingDonor] = useState(false);

  // Form states for new donor
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [donorGender, setDonorGender] = useState("");
  const [donorBloodGroup, setDonorBloodGroup] = useState("");
  const [donorDOB, setDonorDOB] = useState("");
  const [initialUnits, setInitialUnits] = useState("1");
  const [medicalHistory, setMedicalHistory] = useState("");

  // Form states for donation details
  const [donationDate, setDonationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [donationUnits, setDonationUnits] = useState("1");

  const { toast } = useToast();

  // Calculate today's date
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Function to reset the donor form fields
  const resetDonorForm = () => {
    setDonorName("");
    setDonorEmail("");
    setDonorPhone("");
    setDonorAddress("");
    setDonorGender("");
    setDonorBloodGroup("");
    setDonorDOB("");
    setInitialUnits("1");
    setMedicalHistory("");
  };

  // Function to check if a phone number is already associated with a donor
  // and if that donor is eligible to donate
  const checkDonorEligibility = (phoneNumber) => {
    const existingDonor = donors.find((donor) => donor.phone === phoneNumber);

    if (!existingDonor) {
      return { isExisting: false, isEligible: true };
    }

    // Donor exists, check if they're eligible to donate
    const today = new Date();

    if (!existingDonor.eligibleDate) {
      // No previous donation, they're eligible
      return { isExisting: true, isEligible: true };
    }

    const isEligible = today >= existingDonor.eligibleDate;
    return {
      isExisting: true,
      isEligible,
      eligibleDate: existingDonor.eligibleDate,
    };
  };

  // Check if we should auto-open the donor form (coming from Admin Dashboard)
  useEffect(() => {
    const shouldOpenForm = sessionStorage.getItem("openDonorForm");
    if (shouldOpenForm === "true") {
      setNewDonorOpen(true);
      // Clear the flag after use
      sessionStorage.removeItem("openDonorForm");
    }
  }, []);

  // Fetch donors on component mount
  useEffect(() => {
    if (user && isAdmin()) {
      fetchDonors();
    }
  }, [user]);

  const fetchDonors = async () => {
    setLoadingData(true);
    try {
      // Use real API call
      const response = await donorsApi.getAll();
      if (response.success) {
        const donors = mapDonorData(response.data);

        // For each donor, get their total donated units
        const donorsWithUnits = await Promise.all(
          donors.map(async (donor) => {
            try {
              // Fetch donations by donor ID
              const donationsResponse = await donationApi.getByDonor(donor.id);
              if (
                donationsResponse.success &&
                donationsResponse.data &&
                Array.isArray(donationsResponse.data)
              ) {
                // Calculate total units from all donations
                const totalUnits = donationsResponse.data.reduce(
                  (sum, donation) => sum + parseFloat(donation.units || 0),
                  0
                );
                return { ...donor, units: totalUnits };
              }
              return { ...donor, units: 0 }; // Default to 0 if API fails or no data
            } catch (error) {
              console.error(
                `Error fetching donations for donor ${donor.id}:`,
                error
              );
              return { ...donor, units: 0 }; // Default to 0 on error
            }
          })
        );

        setDonors(donorsWithUnits);
      } else {
        throw new Error(response.message || "Failed to load donors");
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load donors",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddDonor = async () => {
    if (
      !donorName ||
      !donorPhone ||
      !donorGender ||
      !donorBloodGroup ||
      !donorDOB ||
      !donorEmail ||
      !donorAddress
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number length
    if (donorPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number should be of 10 digits only.",
        variant: "destructive",
      });
      return;
    }

    // Check if phone number is already in use and if donor is eligible
    const { isExisting, isEligible, eligibleDate } =
      checkDonorEligibility(donorPhone);

    if (isExisting) {
      if (!isEligible && parseInt(initialUnits) > 0) {
        // Donor exists but is not eligible to donate
        resetDonorForm();
        toast({
          title: "Donation Eligibility",
          description: `This phone number is already registered to a donor who is not eligible to donate until ${format(
            eligibleDate,
            "PPP"
          )}. Please wait until the eligible date.`,
          variant: "destructive",
        });
        return;
      } else if (isEligible && parseInt(initialUnits) > 0) {
        // Donor exists and is eligible, ask them to use the donation form instead
        resetDonorForm();
        toast({
          title: "Existing Donor",
          description: `This phone number is already registered to a donor. Please use the donation form instead.`,
          variant: "destructive",
        });
        return;
      } else if (parseInt(initialUnits) === 0) {
        // Just adding contact info without donation, but phone already exists
        resetDonorForm();
        toast({
          title: "Duplicate Phone Number",
          description: `This phone number is already registered to a donor. Please use a different phone number.`,
          variant: "destructive",
        });
        return;
      }
    }

    setAddingDonor(true);
    try {
      // Calculate age from date of birth
      const calculatedAge = calculateAge(donorDOB);

      const newDonor = {
        full_name: donorName,
        email: donorEmail,
        contact_number: donorPhone,
        address: donorAddress,
        gender: donorGender,
        blood_group: donorBloodGroup,
        date_of_birth: donorDOB,
        age: calculatedAge,
        health_status: "Eligible",
        medical_history: medicalHistory || "None reported",
      };

      const response = await donorsApi.create(newDonor);

      if (response.success) {
        toast({
          title: "Success",
          description: "New donor added successfully.",
        });

        // If initial units specified, record an initial donation
        if (parseInt(initialUnits) > 0) {
          try {
            const donationData = {
              donor_id: response.data.donor_id,
              donation_date: new Date().toISOString().split("T")[0],
              units: parseInt(initialUnits),
              blood_group: donorBloodGroup,
              bank_id: 1, // Default to main blood bank
              status: "valid", // Mark as valid (available) by default
            };

            // Record the donation
            await donationApi.create(donationData);

            // Update inventory
            await inventoryApi.updateInventoryForDonation(donationData);

            toast({
              title: "Donation Recorded",
              description: `Initial donation of ${initialUnits} units of ${donorBloodGroup} blood recorded and added to inventory.`,
            });

            // Trigger global inventory update event
            window.dispatchEvent(new CustomEvent("activity-added"));
          } catch (donationError) {
            console.error("Error recording initial donation:", donationError);
            if (donationError?.message?.includes("56 days ago")) {
              // Show specific message about eligibility
              resetDonorForm();
              setNewDonorOpen(false);
              toast({
                title: "Donation Eligibility",
                description:
                  "This donor is not eligible to donate at this time. Donors must wait at least 56 days between donations.",
                variant: "destructive",
              });
            } else {
              resetDonorForm();
              setNewDonorOpen(false);
              toast({
                title: "Error",
                description: "Failed to record initial donation.",
                variant: "destructive",
              });
            }
          }
        }

        // Reset form and close dialog
        resetDonorForm();
        setNewDonorOpen(false);
        // Refresh donors list
        fetchDonors();
      } else {
        throw new Error(response.message || "Failed to add donor");
      }
    } catch (error) {
      console.error("Error adding donor:", error);
      resetDonorForm();
      setNewDonorOpen(false);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add donor",
        variant: "destructive",
      });
    } finally {
      setAddingDonor(false);
    }
  };

  const handleDonationClick = (donor) => {
    setSelectedDonor(donor);
    setNewDonation(true);
  };

  const handleAddDonation = async () => {
    if (!selectedDonor) {
      toast({
        title: "Error",
        description: "No donor selected.",
        variant: "destructive",
      });
      return;
    }

    if (!donationDate) {
      toast({
        title: "Missing Information",
        description: "Please select a donation date.",
        variant: "destructive",
      });
      return;
    }

    if (!donationUnits || parseInt(donationUnits) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of units.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Default bank_id to 1 (main blood bank) if not specified
      const donationData = {
        donor_id: selectedDonor.id,
        donation_date: donationDate,
        units: parseInt(donationUnits),
        blood_group: selectedDonor.bloodGroup,
        bank_id: 1, // Default to main blood bank
        status: "valid", // Mark as valid (available) by default
      };

      setLoadingData(true);

      // 1. Record the donation
      const response = await donationApi.create(donationData);

      if (response.success) {
        // 2. Manually update the inventory (redundant with backend triggers but provides better feedback)
        try {
          await inventoryApi.updateInventoryForDonation(donationData);
        } catch (inventoryError) {
          console.error("Additional inventory update error:", inventoryError);
          // Continue even if this fails as backend should handle it via triggers
        }

        toast({
          title: "Success",
          description: `Blood donation recorded successfully. ${donationUnits} units of ${selectedDonor.bloodGroup} blood added to inventory.`,
        });

        // Reset form and close dialog
        setNewDonation(false);
        setDonationDate(new Date().toISOString().split("T")[0]);
        setDonationUnits("1");

        // Refresh donors list to update last donation info
        fetchDonors();

        // Trigger global inventory update event
        // This will cause all components listening to this event to refresh their inventory data
        window.dispatchEvent(new CustomEvent("activity-added"));
      } else {
        throw new Error(response.message || "Failed to record donation");
      }
    } catch (error) {
      console.error("Error recording donation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to record donation",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteDonor = (donor) => {
    setSelectedDonor(donor);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteDonor = async () => {
    if (!selectedDonor) return;

    setDeletingDonor(true);
    try {
      const response = await donorsApi.delete(selectedDonor.id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Donor deleted successfully.",
        });
        // Close dialog and refresh list
        setConfirmDeleteOpen(false);
        fetchDonors();
      } else {
        throw new Error(response.message || "Failed to delete donor");
      }
    } catch (error) {
      console.error("Error deleting donor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete donor",
        variant: "destructive",
      });
    } finally {
      setDeletingDonor(false);
    }
  };

  // Filter donors based on search term and blood group
  const filteredDonors = donors.filter((donor) => {
    const nameMatch = donor.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const bloodGroupMatch =
      filterBloodGroup === "all" || donor.bloodGroup === filterBloodGroup;
    return nameMatch && bloodGroupMatch;
  });

  // Redirect if not admin
  if (!loading && (!user || !isAdmin())) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Donor Management
            </h1>
            <Button
              onClick={() => {
                resetDonorForm();
                setNewDonorOpen(true);
              }}
              className="bg-bloodRed hover:bg-bloodRed/90 text-white"
            >
              Add New Donor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search donors by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2 justify-end">
              <span className="text-sm font-medium">
                Filter by Blood Group:
              </span>
              <Select
                value={filterBloodGroup}
                onValueChange={setFilterBloodGroup}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donors List</CardTitle>
              <CardDescription>
                Showing {filteredDonors.length} of {donors.length} donors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Last Donation</TableHead>
                    <TableHead>Eligible Again</TableHead>
                    <TableHead className="text-right">Donor Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell className="font-medium">
                        {donor.name}
                      </TableCell>
                      <TableCell>{donor.gender}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 bg-bloodRed text-white rounded-full text-xs">
                          {donor.bloodGroup}
                        </span>
                      </TableCell>
                      <TableCell>{donor.phone}</TableCell>
                      <TableCell>{donor.lastDonation}</TableCell>
                      <TableCell>{donor.eligibleAgain}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDonationClick(donor)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={newDonation} onOpenChange={setNewDonation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donor Details</DialogTitle>
            <DialogDescription>
              {selectedDonor && (
                <span>Viewing details for {selectedDonor.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedDonor && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: selectedDonor.name },
                    { label: "Gender", value: selectedDonor.gender },
                    {
                      label: "Blood Group",
                      value: selectedDonor.bloodGroup,
                      isBloodGroup: true,
                    },
                    { label: "Phone Number", value: selectedDonor.phone },
                    { label: "Age", value: selectedDonor.age || "N/A" },
                    {
                      label: "Units Donated",
                      value:
                        selectedDonor.units !== undefined
                          ? Math.round(selectedDonor.units).toString()
                          : "0",
                      suffix: "Unit(s)",
                      highlight: parseInt(selectedDonor.units || "0") > 0,
                    },
                    {
                      label: "Last Donation",
                      value: selectedDonor.lastDonation,
                    },
                    {
                      label: "Eligible Again",
                      value: selectedDonor.eligibleAgain,
                    },
                    {
                      label: "Blood Bank",
                      value:
                        selectedDonor.bloodBank || "LIFESTREAM+ Blood Bank",
                    },
                    {
                      label: "Medical History/Allergies",
                      value: selectedDonor.medical_history || "None reported",
                      fullWidth: true,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={`space-y-1 ${
                        item.fullWidth ? "col-span-2" : ""
                      }`}
                    >
                      <Label className="text-sm text-gray-500">
                        {item.label}
                      </Label>
                      {item.isBloodGroup ? (
                        <div className="p-2">
                          <span className="px-2 py-1 rounded-full bg-bloodRed text-white text-xs font-medium">
                            {item.value}
                          </span>
                        </div>
                      ) : (
                        <p
                          className={`font-medium ${
                            item.label === "Units Donated"
                              ? item.highlight
                                ? "text-black"
                                : "text-bloodRed"
                              : ""
                          }`}
                        >
                          {item.value}
                          {item.suffix && ` ${item.suffix}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          <DialogFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setNewDonation(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newDonorOpen} onOpenChange={setNewDonorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
            <DialogDescription>
              Enter the details of the new blood donor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="donor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={donorPhone}
                  onChange={(e) => {
                    // Only allow numeric input
                    const value = e.target.value.replace(/\D/g, "");
                    // Limit to 10 digits
                    setDonorPhone(value.slice(0, 10));
                  }}
                  placeholder="123-456-7890"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={donorDOB}
                  onChange={(e) => {
                    setDonorDOB(e.target.value);
                  }}
                  max={
                    new Date(
                      today.getFullYear() - 18,
                      today.getMonth(),
                      today.getDate()
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={donorGender} onValueChange={setDonorGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood-group">Blood Group</Label>
                <Select
                  value={donorBloodGroup}
                  onValueChange={setDonorBloodGroup}
                >
                  <SelectTrigger id="blood-group">
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent position="popper">
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
                <Label htmlFor="initial-units">Units Donated</Label>
                <Select value={initialUnits} onValueChange={setInitialUnits}>
                  <SelectTrigger id="initial-units">
                    <SelectValue placeholder="Units" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="1">1 Unit</SelectItem>
                    <SelectItem value="2">2 Units</SelectItem>
                    <SelectItem value="3">3 Units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical-history">
                  Medical History/Allergies
                </Label>
                <Textarea
                  id="medical-history"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Enter any relevant medical history or allergies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={donorAddress}
                  onChange={(e) => setDonorAddress(e.target.value)}
                  placeholder="123 Main St, City, Country"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDonorOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-bloodRed hover:bg-bloodRed/90 text-white"
              onClick={handleAddDonor}
              disabled={addingDonor}
            >
              {addingDonor ? "Adding Donor..." : "Add Donor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {selectedDonor ? selectedDonor.name : "this donor"}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDonor}
              disabled={deletingDonor}
            >
              {deletingDonor ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DonorManagement;
