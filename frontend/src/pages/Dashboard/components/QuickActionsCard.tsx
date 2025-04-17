
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Calendar, Droplet, History, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const QuickActionsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>LIFESTREAM+ Services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/requests">
          <Button className="w-full justify-start bg-bloodRed hover:bg-bloodRedDark">
            <Droplet className="mr-2 h-4 w-4" />
            Request Blood
          </Button>
        </Link>
        <Link to="/requests">
          <Button className="w-full justify-start bg-bloodRed hover:bg-bloodRedDark">
            <ClipboardList className="mr-2 h-4 w-4" />
            View Requests
          </Button>
        </Link>
        <Link to="/requests">
          <Button className="w-full justify-start bg-bloodRed hover:bg-bloodRedDark">
            <History className="mr-2 h-4 w-4" />
            Request History
          </Button>
        </Link>
        <Link to="/requests">
          <Button className="w-full justify-start bg-bloodRed hover:bg-bloodRedDark">
            <AlertCircle className="mr-2 h-4 w-4" />
            Emergency Request
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
