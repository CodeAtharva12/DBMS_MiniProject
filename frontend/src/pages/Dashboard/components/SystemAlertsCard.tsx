
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

const SystemAlertsCard: React.FC = () => {
  return (
    <Card className="shadow-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-bloodRed">System Alerts</CardTitle>
          <AlertCircle className="h-5 w-5 text-gray-400" />
        </div>
        <CardDescription>Important notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="bg-red-50 p-4 rounded-md border-l-4 border-red-500 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Critical: Low AB- Inventory</p>
              <p className="text-xs text-red-600 mt-1">Only 3 units remaining - Schedule donation drive</p>
            </div>
          </li>
          <li className="bg-amber-50 p-4 rounded-md border-l-4 border-amber-500 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Warning: Units Expiring Soon</p>
              <p className="text-xs text-amber-600 mt-1">12 units expire within 7 days - Check expiry report</p>
            </div>
          </li>
          <li className="bg-green-50 p-4 rounded-md border-l-4 border-green-500 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">System Update Complete</p>
              <p className="text-xs text-green-600 mt-1">Database optimization finished - Performance improved</p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default SystemAlertsCard;
