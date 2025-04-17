
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Clock, ClipboardList, Droplets, XCircle, PlusCircle, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Mock data - would come from API in a real application
const requestsData = [
  { 
    id: 'REQ001', 
    hospital: 'Memorial Hospital', 
    bloodGroup: 'A+', 
    units: 3, 
    requestDate: '2024-04-09', 
    status: 'pending',
    priority: 'high'
  },
  { 
    id: 'REQ002', 
    hospital: 'City Medical Center', 
    bloodGroup: 'O-', 
    units: 2, 
    requestDate: '2024-04-08', 
    status: 'approved',
    priority: 'medium'
  },
  { 
    id: 'REQ003', 
    hospital: 'University Hospital', 
    bloodGroup: 'B+', 
    units: 5, 
    requestDate: '2024-04-07', 
    status: 'fulfilled',
    priority: 'low'
  },
  { 
    id: 'REQ004', 
    hospital: 'Children\'s Hospital', 
    bloodGroup: 'AB-', 
    units: 1, 
    requestDate: '2024-04-06', 
    status: 'rejected',
    priority: 'high'
  },
  { 
    id: 'REQ005', 
    hospital: 'Veterans Medical Center', 
    bloodGroup: 'O+', 
    units: 4, 
    requestDate: '2024-04-05', 
    status: 'fulfilled',
    priority: 'medium'
  },
];

// Component for status badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-amber/20 text-amber-dark border-amber font-medium">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-healthGreen/20 text-healthGreen border-healthGreen font-medium">Approved</Badge>;
    case 'fulfilled':
      return <Badge variant="outline" className="bg-medicalBlue/20 text-medicalBlue border-medicalBlue font-medium">Fulfilled</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-bloodRed/20 text-bloodRed border-bloodRed font-medium">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// Component for priority indicator
const PriorityIndicator: React.FC<{ priority: string }> = ({ priority }) => {
  const colors = {
    high: 'bg-bloodRed',
    medium: 'bg-amber',
    low: 'bg-healthGreen',
  };
  
  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block w-2 h-2 rounded-full ${colors[priority as keyof typeof colors]}`}></span>
      <span className="text-xs capitalize">{priority}</span>
    </div>
  );
};

const RequestsTabContent: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  const [priority, setPriority] = useState('');
  const { toast } = useToast();
  
  const handleCreateRequest = () => {
    if (!bloodGroup || !units || !priority) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Blood request submitted to LIFESTREAM+ Blood Bank!",
    });
    
    // Reset form and close dialog
    setBloodGroup('');
    setUnits('');
    setPriority('');
    setIsNewRequestOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RequestStatCard 
          title="Total Requests" 
          value={requestsData.length} 
          icon={<ClipboardList className="h-8 w-8 text-bloodRed" />} 
        />
        <RequestStatCard 
          title="Pending Requests" 
          value={requestsData.filter(req => req.status === 'pending').length} 
          icon={<Clock className="h-8 w-8 text-amber" />} 
        />
        <RequestStatCard 
          title="Fulfilled Requests" 
          value={requestsData.filter(req => req.status === 'fulfilled').length} 
          icon={<CheckCircle2 className="h-8 w-8 text-healthGreen" />} 
        />
      </div>

      <Card className="shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Droplets className="mr-2 h-5 w-5 text-bloodRed" />
                Blood Requests
              </CardTitle>
              <CardDescription>Track and manage blood requests</CardDescription>
            </div>
            {!isAdmin() && (
              <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-bloodRed hover:bg-bloodRedDark text-white rounded-full">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Blood Request</DialogTitle>
                    <DialogDescription>
                      Fill out the form to request blood from LIFESTREAM+ Blood Bank.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
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
                      <Label>Blood Bank</Label>
                      <div className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <Droplet className="h-4 w-4 text-bloodRed mr-2" />
                          <p className="text-sm font-medium">LIFESTREAM+ Blood Bank</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">All requests are directed to LIFESTREAM+ Blood Bank</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units Required</Label>
                      <Input 
                        id="units" 
                        type="number" 
                        min="1" 
                        value={units} 
                        onChange={(e) => setUnits(e.target.value)} 
                        placeholder="Enter number of units"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-bloodRed hover:bg-bloodRedDark" onClick={handleCreateRequest}>
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead className="hidden md:table-cell">Hospital</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin() && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestsData.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell className="hidden md:table-cell">{request.hospital}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold text-white ${request.bloodGroup.includes('-') ? 'bg-medicalBlue' : 'bg-bloodRed'}`}>
                        {request.bloodGroup}
                      </span>
                    </TableCell>
                    <TableCell>{request.units}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-mediumGray" />
                        <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityIndicator priority={request.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    {isAdmin() && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-healthGreen">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-bloodRed">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for stats cards
const RequestStatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ReactNode;
}> = ({ 
  title, 
  value, 
  icon
}) => {
  return (
    <Card className="shadow-card">
      <CardContent className="pt-6 px-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-mediumGray">{title}</p>
            <h3 className="text-2xl font-bold mt-1 mb-0">{value}</h3>
          </div>
          <div className="p-3 bg-softPink-light rounded-full blood-pulse">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestsTabContent;
