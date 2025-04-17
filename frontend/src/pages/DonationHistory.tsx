import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Calendar, DropletIcon, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { donationApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

// Define the donation interface
interface Donation {
  id: number;
  donorName: string;
  donorId: number;
  bloodGroup: string;
  units: number;
  donationDate: string;
  expiryDate: string;
  status: string;
  recordedBy?: string;
}

const DonationHistory = () => {
  const { user, loading, isAdmin } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  
  // Function to fetch donations from API
  const fetchDonations = async () => {
    try {
      setDataLoading(true);
      const response = await donationApi.getAll();
      
      if (response.success) {
        // Map API response to our donation format
        const mappedDonations: Donation[] = response.data.map((item: any) => ({
          id: item.donation_id,
          donorName: item.donor_name || 'Unknown Donor',
          donorId: item.donor_id,
          bloodGroup: item.blood_group,
          units: item.units,
          donationDate: item.donation_date ? new Date(item.donation_date).toISOString().split('T')[0] : 'Unknown',
          expiryDate: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'Unknown',
          status: item.status || 'valid',
          recordedBy: item.recorded_by || 'System'
        }));
        
        setDonations(mappedDonations);
      } else {
        throw new Error(response.message || 'Failed to fetch donations');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load donation history",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };
  
  useEffect(() => {
    if (user && isAdmin()) {
      fetchDonations();
    }
  }, [user]);
  
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

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = (donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          donation.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(donation.donorId).includes(searchTerm));
    const matchesBloodGroup = filterBloodGroup === 'all' || donation.bloodGroup === filterBloodGroup;
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    
    return matchesSearch && matchesBloodGroup && matchesStatus;
  });
  
  const exportToCsv = () => {
    const headers = ['ID', 'Donor Name', 'Donor ID', 'Blood Group', 'Units', 'Donation Date', 'Expiry Date', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredDonations.map(donation => [
        donation.id,
        `"${donation.donorName}"`,
        donation.donorId,
        donation.bloodGroup,
        donation.units,
        donation.donationDate,
        donation.expiryDate,
        donation.status
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'donation_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-lightGray">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Donation History</h1>
            <div className="flex space-x-2">
              <Button 
                onClick={exportToCsv}
                className="bg-medicalBlue hover:bg-medicalBlue/90"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                onClick={fetchDonations}
                variant="outline"
                className="border-medicalBlue text-medicalBlue hover:bg-medicalBlue/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="page-title">Donation History</h1>
              <p className="text-gray-600 mt-2">
                View and manage all blood donation records
              </p>
            </div>
            
            <Button 
              onClick={exportToCsv} 
              className="bg-medicalBlue hover:bg-medicalBlueDark"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
          
          <Card className="mb-8 shadow-card">
            <CardHeader>
              <CardTitle className="text-xl text-bloodRed">Search & Filter</CardTitle>
              <CardDescription>Find specific donation records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by donor or blood group"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <DropletIcon className="mr-2 h-4 w-4" />
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
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Status" />
                    </div>
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
              <CardTitle className="text-xl text-bloodRed">Donation Records</CardTitle>
              <CardDescription>
                {filteredDonations.length} {filteredDonations.length === 1 ? 'record' : 'records'} found
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto">
              {dataLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bloodRed"></div>
                  <span className="ml-3 text-gray-600">Loading donation records...</span>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No donation records found</p>
                  <Button 
                    onClick={fetchDonations}
                    variant="outline" 
                    className="mt-4"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-softPink/20">
                      <TableHead>ID</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Donation Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.map((donation) => (
                      <TableRow key={donation.id} className="hover:bg-softPink/10">
                        <TableCell>{donation.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{donation.donorName}</p>
                            <p className="text-xs text-gray-500">ID: {donation.donorId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-bloodRed text-white">{donation.bloodGroup}</Badge>
                        </TableCell>
                        <TableCell>{donation.units}</TableCell>
                        <TableCell>{donation.donationDate}</TableCell>
                        <TableCell>{donation.expiryDate}</TableCell>
                        <TableCell>
                          {donation.status === 'valid' ? (
                            <Badge className="bg-healthGreen">Valid</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 border-gray-300">Expired</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonationHistory;
