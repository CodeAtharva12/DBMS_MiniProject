import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplet, Calendar, ClipboardList, TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SystemStatsCard: React.FC = () => {
  // Mock data for trend values (could be fetched from API in real implementation)
  const trends = {
    pending: { value: '+5%', isPositive: false },
    approved: { value: '+12%', isPositive: true },
    fulfilled: { value: '+8%', isPositive: true },
    total: { value: '+15%', isPositive: true },
  };
  
  return (
    <Card className="shadow-card card-hover">
      <CardHeader>
        <CardTitle className="text-xl text-bloodRed">Request Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <TooltipProvider>
            {/* Total Requests Stat Card */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-bloodRed/10 text-bloodRed rounded-full mx-auto mb-2 md:mb-3 group-hover:bg-bloodRed group-hover:text-white transition-colors">
                    <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-bloodRed flex items-center justify-center">
                    24
                    {trends.total.isPositive ? (
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Total Requests</p>
                  <p className="text-xs text-green-600 font-medium">{trends.total.value} this month</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-2 max-w-xs">
                <p className="text-sm font-medium">Total Blood Requests</p>
                <p className="text-xs text-gray-500">24 total requests submitted to Blood Bank</p>
                <p className="text-xs mt-1">Includes all pending, approved, and fulfilled requests</p>
                <hr className="my-1 border-gray-200" />
                <p className="text-xs italic">Last updated: Today</p>
              </TooltipContent>
            </Tooltip>

            {/* Pending Requests Stat Card */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-amber-500/10 text-amber-500 rounded-full mx-auto mb-2 md:mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Clock className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-amber-500 flex items-center justify-center">
                    8
                    {!trends.pending.isPositive ? (
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Pending Requests</p>
                  <p className="text-xs text-red-500 font-medium">{trends.pending.value} since last week</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-2 max-w-xs">
                <p className="text-sm font-medium">Pending Request Status</p>
                <p className="text-xs text-gray-500">8 requests awaiting approval from Blood Bank</p>
                <p className="text-xs mt-1">
                  <span className="text-amber-500 font-medium">Average wait time: 8 hours</span>
                </p>
                <hr className="my-1 border-gray-200" />
                <p className="text-xs italic">Last request submitted: 2 hours ago</p>
              </TooltipContent>
            </Tooltip>

            {/* Approved Requests Stat Card */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-medicalBlue/10 text-medicalBlue rounded-full mx-auto mb-2 md:mb-3 group-hover:bg-medicalBlue group-hover:text-white transition-colors">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-medicalBlue flex items-center justify-center">
                    12
                    {trends.approved.isPositive ? (
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Approved Requests</p>
                  <p className="text-xs text-green-600 font-medium">{trends.approved.value} this month</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-2 max-w-xs">
                <p className="text-sm font-medium">Approved Blood Requests</p>
                <p className="text-xs text-gray-500">12 requests approved by Blood Bank</p>
                <p className="text-xs mt-1">
                  4 requests scheduled for pickup today
                </p>
                <hr className="my-1 border-gray-200" />
                <p className="text-xs italic">Last approval: Yesterday</p>
              </TooltipContent>
            </Tooltip>

            {/* Emergency Requests Stat Card */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-white p-3 md:p-5 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 bg-red-500/10 text-red-500 rounded-full mx-auto mb-2 md:mb-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-red-500 flex items-center justify-center">
                    4
                    {trends.fulfilled.isPositive ? (
                      <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Emergency Requests</p>
                  <p className="text-xs text-green-600 font-medium">100% fulfilled</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="p-2 max-w-xs">
                <p className="text-sm font-medium">Emergency Request Status</p>
                <p className="text-xs text-gray-500">4 emergency requests this month</p>
                <p className="text-xs text-green-600 mt-1">
                  All emergency requests were fulfilled within 2 hours
                </p>
                <hr className="my-1 border-gray-200" />
                <p className="text-xs italic">Blood Bank priority response time: &lt;2 hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatsCard;
