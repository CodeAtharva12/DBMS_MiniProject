
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserCheck, Filter, Search, Trash2, Edit, BadgeInfo } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Mock data - would come from API in a real application
const initialDonors = [
  { id: 'D001', name: 'John Smith', bloodGroup: 'O+', lastDonation: '2024-03-10', donations: 12, status: 'active' },
  { id: 'D002', name: 'Maria Garcia', bloodGroup: 'A-', lastDonation: '2024-02-15', donations: 5, status: 'active' },
  { id: 'D003', name: 'Robert Johnson', bloodGroup: 'B+', lastDonation: '2024-01-05', donations: 8, status: 'inactive' },
  { id: 'D004', name: 'Sarah Williams', bloodGroup: 'AB+', lastDonation: '2023-12-20', donations: 3, status: 'active' },
  { id: 'D005', name: 'David Brown', bloodGroup: 'O-', lastDonation: '2023-11-30', donations: 15, status: 'inactive' },
];

const DonorsTabContent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [viewDonorOpen, setViewDonorOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [donors, setDonors] = useState(initialDonors);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [donorName, setDonorName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const { toast } = useToast();

  const handleAddDonor = () => {
    if (!donorName || !bloodGroup || !phone) {
      toast({
        title: "Error",
        description: "Please fill all the required fields",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newDonor = {
      id: `D00${donors.length + 1}`,
      name: donorName,
      bloodGroup: bloodGroup,
      lastDonation: today,
      donations: 0,
      status: 'active'
    };

    setDonors([...donors, newDonor]);
    
    // Reset form and close dialog
    resetForm();
    setOpen(false);
    
    toast({
      title: "Success",
      description: "Donor added successfully",
    });
  };

  const resetForm = () => {
    setDonorName('');
    setBloodGroup('');
    setPhone('');
    setEmail('');
    setAddress('');
    setAge('');
    setGender('');
  };

  const handleViewDonor = (donor: any) => {
    setSelectedDonor(donor);
    setViewDonorOpen(true);
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donor.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || donor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DonorStatCard 
          title="Total Donors" 
          value={donors.length} 
          icon={<Users className="h-8 w-8 text-bloodRed" />} 
          description="Registered donors in system"
        />
        <DonorStatCard 
          title="Active Donors" 
          value={donors.filter(donor => donor.status === 'active').length} 
          icon={<UserCheck className="h-8 w-8 text-healthGreen" />} 
          description="Donors who donated in the last 3 months"
        />
        <DonorStatCard 
          title="Total Donations" 
          value={donors.reduce((sum, donor) => sum + donor.donations, 0)} 
          icon={<UserPlus className="h-8 w-8 text-medicalBlue" />} 
          description="All-time donation count"
        />
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-bloodRed" />
              Donor Registry
            </CardTitle>
            <CardDescription>Manage and view donor information</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-bloodRed hover:bg-bloodRedDark text-white rounded-full py-2 px-4">
                <UserPlus className="h-5 w-5 mr-2" />
                <span className="text-base font-medium">Add New Donor</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Donor</DialogTitle>
                <DialogDescription>
                  Enter the details of the new donor below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Enter donor's full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={bloodGroup} onValueChange={setBloodGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="65"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-bloodRed hover:bg-bloodRedDark" onClick={handleAddDonor}>
                  Add Donor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-mediumGray" />
              <Input 
                placeholder="Search donors..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className={statusFilter === 'all' ? 'bg-bloodRed text-white' : ''} 
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button 
                variant="outline" 
                className={statusFilter === 'active' ? 'bg-healthGreen text-white' : ''} 
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button 
                variant="outline" 
                className={statusFilter === 'inactive' ? 'bg-mediumGray text-white' : ''} 
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
          
          <div className="border rounded-md overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="hidden md:table-cell">Last Donation</TableHead>
                  <TableHead className="hidden md:table-cell">Total Donations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => (
                  <TableRow key={donor.id} className="hover:bg-softPink/10">
                    <TableCell className="font-medium">{donor.id}</TableCell>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white 
                        ${donor.bloodGroup.includes('-') ? 'bg-medicalBlue' : 'bg-bloodRed'}`}>
                        {donor.bloodGroup}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(donor.lastDonation).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{donor.donations}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium 
                        ${donor.status === 'active' 
                          ? 'bg-healthGreen/20 text-healthGreen' 
                          : 'bg-mediumGray/20 text-mediumGray'}`}>
                        {donor.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-medicalBlue"
                          onClick={() => handleViewDonor(donor)}
                        >
                          <BadgeInfo className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Donor details dialog */}
      <Dialog open={viewDonorOpen} onOpenChange={setViewDonorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donor Details</DialogTitle>
          </DialogHeader>
          {selectedDonor && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{selectedDonor.name}</h3>
                <Badge className={selectedDonor.status === 'active' ? 'bg-healthGreen' : 'bg-mediumGray'}>
                  {selectedDonor.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Donor ID</p>
                  <p className="font-medium">{selectedDonor.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white 
                    ${selectedDonor.bloodGroup.includes('-') ? 'bg-medicalBlue' : 'bg-bloodRed'}`}>
                    {selectedDonor.bloodGroup}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Donation</p>
                  <p className="font-medium">{new Date(selectedDonor.lastDonation).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Donations</p>
                  <p className="font-medium">{selectedDonor.donations}</p>
                </div>
              </div>
              <div className="pt-4">
                <Button className="w-full bg-bloodRed hover:bg-bloodRedDark">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Record New Donation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for stats cards
const DonorStatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  description: string;
}> = ({ 
  title, 
  value, 
  icon,
  description 
}) => {
  return (
    <Card className="shadow-card border-t-4 border-t-softPink-medium">
      <CardContent className="pt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-mediumGray">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-mediumGray mt-1">{description}</p>
          </div>
          <div className="p-3 bg-softPink-light rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorsTabContent;
