import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Hospital,
  User,
  Mail,
  Phone,
  MapPin,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock initial recipients data
const initialRecipients = [
  {
    id: 1,
    name: "City Hospital",
    type: "Hospital",
    contactPerson: "Dr. Sarah Johnson",
    email: "sarah@cityhospital.com",
    phone: "123-456-7890",
    address: "123 Main St, Cityville",
    totalRequests: 12,
    approvedRequests: 9,
    status: "active",
  },
  {
    id: 2,
    name: "Metro Medical Center",
    type: "Hospital",
    contactPerson: "Dr. James Davis",
    email: "james@metromedical.com",
    phone: "098-765-4321",
    address: "456 Metro Ave, Downtown",
    totalRequests: 8,
    approvedRequests: 5,
    status: "active",
  },
  {
    id: 3,
    name: "County General",
    type: "Hospital",
    contactPerson: "Dr. Robert Lee",
    email: "robert@countygeneral.com",
    phone: "555-123-4567",
    address: "789 County Rd, Suburbs",
    totalRequests: 10,
    approvedRequests: 7,
    status: "active",
  },
  {
    id: 4,
    name: "Children's Research Hospital",
    type: "Research",
    contactPerson: "Dr. Emily Chen",
    email: "emily@childrenresearch.org",
    phone: "222-333-4444",
    address: "101 Research Park, Uptown",
    totalRequests: 5,
    approvedRequests: 4,
    status: "active",
  },
  {
    id: 5,
    name: "Emergency Medical Services",
    type: "EMS",
    contactPerson: "John Williams",
    email: "john@cityems.gov",
    phone: "777-888-9999",
    address: "202 Emergency Way, Cityville",
    totalRequests: 15,
    approvedRequests: 15,
    status: "active",
  },
];

const RecipientManagement = () => {
  const { user, loading, isAdmin } = useAuth();
  const [recipients, setRecipients] = useState(initialRecipients);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRecipientOpen, setNewRecipientOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [editRecipientOpen, setEditRecipientOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);

  // Form states for new recipient
  const [recipientName, setRecipientName] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bloodRed"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.contactPerson
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      recipient.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const handleAddRecipient = () => {
    if (
      !recipientName ||
      !recipientType ||
      !contactPerson ||
      !email ||
      !phone ||
      !address
    ) {
      toast({
        title: "Error",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    const newRecipient = {
      id: recipients.length + 1,
      name: recipientName,
      type: recipientType,
      contactPerson: contactPerson,
      email: email,
      phone: phone,
      address: address,
      totalRequests: 0,
      approvedRequests: 0,
      status: "active",
    };

    setRecipients([...recipients, newRecipient]);
    resetForm();
    setNewRecipientOpen(false);

    toast({
      title: "Success",
      description: "Recipient added successfully",
    });
  };

  const handleEditRecipient = () => {
    if (!selectedRecipient) return;

    const updatedRecipients = recipients.map((r) =>
      r.id === selectedRecipient.id ? selectedRecipient : r
    );

    setRecipients(updatedRecipients);
    setEditRecipientOpen(false);

    toast({
      title: "Success",
      description: "Recipient updated successfully",
    });
  };

  const handleDeleteRecipient = (id: number) => {
    const updatedRecipients = recipients.filter((r) => r.id !== id);
    setRecipients(updatedRecipients);

    toast({
      title: "Success",
      description: "Recipient deleted successfully",
    });
  };

  const resetForm = () => {
    setRecipientName("");
    setRecipientType("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
  };

  const openEditDialog = (recipient: any) => {
    setSelectedRecipient(recipient);
    setEditRecipientOpen(true);
  };

  // Get unique recipient types for filters
  const recipientTypes = [
    "all",
    ...new Set(recipients.map((r) => r.type.toLowerCase())),
  ];

  const addButtonAction = (
    <Dialog open={newRecipientOpen} onOpenChange={setNewRecipientOpen}>
      <DialogTrigger asChild>
        <Button className="bg-bloodRed hover:bg-bloodRedDark rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Hospital
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Hospital</DialogTitle>
          <DialogDescription>
            Enter the details of the new hospital or healthcare organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Hospital className="h-4 w-4" />
              Organization Name
            </Label>
            <Input
              id="name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter organization name"
              className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Organization Type</Label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hospital">Hospital</SelectItem>
                <SelectItem value="Clinic">Clinic</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="EMS">EMS</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Person
            </Label>
            <Input
              id="contactPerson"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Enter contact person's name"
              className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="focus:ring-2 focus:ring-bloodRed focus:ring-o  pacity-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full address"
              className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setNewRecipientOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-bloodRed hover:bg-bloodRedDark"
            onClick={handleAddRecipient}
          >
            Add Hospital
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Edit Dialog
  const editDialog = (
    <Dialog open={editRecipientOpen} onOpenChange={setEditRecipientOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Hospital</DialogTitle>
          <DialogDescription>
            Update the details of this hospital or healthcare organization.
          </DialogDescription>
        </DialogHeader>
        {selectedRecipient && (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center gap-2">
                <Hospital className="h-4 w-4" />
                Organization Name
              </Label>
              <Input
                id="edit-name"
                value={selectedRecipient.name}
                onChange={(e) =>
                  setSelectedRecipient({
                    ...selectedRecipient,
                    name: e.target.value,
                  })
                }
                placeholder="Enter organization name"
                className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Organization Type</Label>
              <Select
                value={selectedRecipient.type}
                onValueChange={(value) =>
                  setSelectedRecipient({ ...selectedRecipient, type: value })
                }
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Clinic">Clinic</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="EMS">EMS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Person
              </Label>
              <Input
                id="edit-contact"
                value={selectedRecipient.contactPerson}
                onChange={(e) =>
                  setSelectedRecipient({
                    ...selectedRecipient,
                    contactPerson: e.target.value,
                  })
                }
                placeholder="Enter contact person's name"
                className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={selectedRecipient.email}
                onChange={(e) =>
                  setSelectedRecipient({
                    ...selectedRecipient,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email address"
                className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={selectedRecipient.phone}
                onChange={(e) =>
                  setSelectedRecipient({
                    ...selectedRecipient,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
                className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="edit-address"
                value={selectedRecipient.address}
                onChange={(e) =>
                  setSelectedRecipient({
                    ...selectedRecipient,
                    address: e.target.value,
                  })
                }
                placeholder="Enter full address"
                className="focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditRecipientOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-bloodRed hover:bg-bloodRedDark"
            onClick={handleEditRecipient}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageLayout
      title="Hospital Management"
      subtitle="Manage hospitals and organizations that request blood"
      titleAction={addButtonAction}
    >
      <Card className="mb-8 shadow-card border-t-4 border-t-bloodRed">
        <CardHeader>
          <CardTitle className="text-xl text-bloodRed">
            Search Hospitals
          </CardTitle>
          <CardDescription>
            Find hospitals and organizations by name or contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, contact person, or email"
                className="pl-8 focus:ring-2 focus:ring-bloodRed focus:ring-opacity-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="text-sm text-gray-500 mr-2 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Filter by:
              </div>
              {recipientTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className={`${
                    typeFilter === type ? "bg-bloodRed text-white" : ""
                  }`}
                  onClick={() => setTypeFilter(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-gradient-to-br from-white to-softPink-light">
        <CardHeader>
          <CardTitle className="text-xl text-bloodRed">Hospital List</CardTitle>
          <CardDescription>
            {filteredRecipients.length}{" "}
            {filteredRecipients.length === 1 ? "hospital" : "hospitals"} found
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="rounded-md border overflow-hidden">
            <ScrollArea className="max-h-[500px] w-full">
              <Table>
                <TableHeader className="bg-softPink-light">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Contact Person
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Phone
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Request History
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.map((recipient) => (
                    <TableRow
                      key={recipient.id}
                      className="hover:bg-softPink/10"
                    >
                      <TableCell>{recipient.id}</TableCell>
                      <TableCell className="font-medium">
                        {recipient.name}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-medicalBlue">
                          {recipient.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {recipient.contactPerson}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <a
                          href={`mailto:${recipient.email}`}
                          className="text-medicalBlue hover:underline flex items-center"
                        >
                          <Mail className="h-3 w-3 mr-1 inline" />
                          <span className="hidden xl:inline">
                            {recipient.email}
                          </span>
                          <span className="xl:hidden">Email</span>
                        </a>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {recipient.phone}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <span className="text-healthGreen font-medium">
                            {recipient.approvedRequests}
                          </span>
                          <span>/</span>
                          <span>{recipient.totalRequests}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            approved
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-healthGreen">
                          {recipient.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-medicalBlue"
                            onClick={() => openEditDialog(recipient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-bloodRed"
                            onClick={() => handleDeleteRecipient(recipient.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {editDialog}
    </PageLayout>
  );
};

export default RecipientManagement;
