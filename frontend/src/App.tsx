import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DonorManagement from "./pages/DonorManagement";
import BloodInventory from "./pages/BloodInventory";
import BloodRequests from "./pages/BloodRequests";
import AdminDashboard from "./pages/AdminDashboard";
import DonationHistory from "./pages/DonationHistory";
import RequestHistory from "./pages/RequestHistory";
import Reports from "./pages/Reports";
import Hospitals from "./pages/Hospitals";

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/donors" element={<DonorManagement />} />
              <Route path="/inventory" element={<BloodInventory />} />
              <Route path="/requests" element={<RequestHistory />} />
              <Route path="/blood-requests" element={<BloodRequests />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/donation-history" element={<DonationHistory />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
