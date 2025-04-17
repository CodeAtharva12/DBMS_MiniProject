import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { recipientApi, requestApi } from '@/services/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Sample data for fallback
const sampleRecipientsData = [
  {
    recipient_id: 1,
    organization_name: 'City General Hospital',
    email: 'info@citygeneral.com',
    contact_number: '(555) 123-4567',
    address: '123 Medical Center Dr, City, State 12345',
    status: 'active'
  },
  {
    recipient_id: 2,
    organization_name: 'County Medical Center',
    email: 'contact@countymedical.org',
    contact_number: '(555) 987-6543',
    address: '456 Health Blvd, County, State 67890',
    status: 'active'
  },
  {
    recipient_id: 3,
    organization_name: 'Children\'s Hospital',
    email: 'info@childrenshospital.org',
    contact_number: '(555) 456-7890',
    address: '789 Pediatric Way, Metro, State 34567',
    status: 'active'
  },
  {
    recipient_id: 4,
    organization_name: 'University Medical Center',
    email: 'admin@universitymed.edu',
    contact_number: '(555) 234-5678',
    address: '101 Academic Health Dr, College Town, State 45678',
    status: 'active'
  },
  {
    recipient_id: 5,
    organization_name: 'Veterans Memorial Hospital',
    email: 'info@veteransmemorial.org',
    contact_number: '(555) 876-5432',
    address: '202 Veterans Way, Liberty, State 56789',
    status: 'active'
  }
];

const Recipients = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [recipientRequests, setRecipientRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper function to use sample data
  const useSampleData = () => {
    setRecipients(sampleRecipientsData);
    
    // Set sample request counts
    const sampleCounts = {};
    sampleRecipientsData.forEach((recipient, index) => {
      sampleCounts[recipient.recipient_id] = [12, 8, 15, 6, 9][index];
    });
    setRecipientRequests(sampleCounts);
  };
  
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        console.log('Fetching recipients data...');
        const response = await recipientApi.getAll();
        console.log('Recipients API response:', response);
        
        // Check if we have valid data in the response
        if (response && Array.isArray(response.data)) {
          console.log('Setting recipients from API data:', response.data);
          setRecipients(response.data);
          
          // Fetch request counts for each recipient
          const requestCounts = {};
          for (const recipient of response.data) {
            try {
              const requestsResponse = await requestApi.getByRecipient(recipient.recipient_id);
              console.log(`Request response for recipient ${recipient.recipient_id}:`, requestsResponse);
              
              if (requestsResponse && Array.isArray(requestsResponse.data)) {
                requestCounts[recipient.recipient_id] = requestsResponse.data.length;
              } else {
                requestCounts[recipient.recipient_id] = 0;
              }
            } catch (err) {
              console.error(`Error fetching requests for recipient ${recipient.recipient_id}:`, err);
              requestCounts[recipient.recipient_id] = 0;
            }
          }
          
          setRecipientRequests(requestCounts);
        } else {
          console.warn('Invalid API response format, using sample data');
          useSampleData();
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching recipients:', err);
        setError('Failed to load hospital recipients. Please try again later.');
        useSampleData();
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin()) {
      fetchRecipients();
    }
  }, [user, isAdmin]);
  
  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user || !isAdmin()) {
    return <Navigate to="/login" />;
  }
  
  const filteredRecipients = recipients.filter(recipient => 
    recipient.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bloodRed mb-2">Hospital Recipients</h1>
          <p className="text-gray-600">View and manage hospital accounts that have requested blood from LIFESTREAM+ Blood Bank</p>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-lg rounded-lg overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-r from-white to-softPink-light">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-bloodRed">Registered Hospitals</CardTitle>
              <div className="mt-4 md:mt-0 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search hospitals..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              Hospitals that have requested blood from LIFESTREAM+ Blood Bank
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-softPink-light">
                  <TableRow>
                    <TableHead>Hospital</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Address</TableHead>
                    <TableHead>Requests</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.length > 0 ? (
                    filteredRecipients.map((recipient) => (
                      <TableRow key={recipient.recipient_id} className="hover:bg-softPink/10">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="bg-bloodRed/10 p-2 rounded-full mr-3">
                              <Building className="h-5 w-5 text-bloodRed" />
                            </div>
                            <div>
                              <div className="font-medium">{recipient.organization_name}</div>
                              <div className="text-sm text-gray-500 md:hidden flex items-center">
                                <Mail className="h-3 w-3 mr-1" /> {recipient.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-gray-400" />
                              {recipient.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {recipient.contact_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-xs">{recipient.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-softPink text-bloodRed hover:bg-softPink hover:cursor-default">
                            {recipientRequests[recipient.recipient_id] || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              recipient.status === 'active' 
                                ? 'bg-green-100 text-green-800 border border-green-300' 
                                : 'bg-gray-100 text-gray-800 border border-gray-300'
                            } hover:bg-green-100 hover:cursor-default`}
                          >
                            {recipient.status || 'inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {loading ? 'Loading hospitals...' : 'No hospitals found matching your search.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Recipients;
