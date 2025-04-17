import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { authApi } from "@/services/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateContact = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length !== 10) {
      setContactError("Contact number must be exactly 10 digits");
      return false;
    }
    setContactError("");
    return true;
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    setContact(numericValue);
    validateContact(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!validateContact(contact)) {
      return;
    }

    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Hospital address is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use extended register function that includes contact and address
      await registerWithDetails();
      toast({
        title: "Success",
        description:
          "Registration successful! You can now log in with your credentials.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Registration failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithDetails = async () => {
    try {
      // Use the API client instead of direct fetch
      const response = await authApi.register({
        name,
        email,
        password,
        role: "hospital",
        contact_number: contact,
        address,
      });

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-lightGray">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl w-full shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-bloodRed">
              Create an Hospital Account
            </CardTitle>
            <CardDescription>
              Or{" "}
              <Link
                to="/login"
                className="font-medium text-medicalBlue hover:underline"
              >
                sign in to your existing account
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Hospital Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Enter your Hospital name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-address">Email address</Label>
                  <Input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    name="contact"
                    type="tel"
                    required
                    placeholder="10-digit contact number"
                    value={contact}
                    onChange={handleContactChange}
                    maxLength={10}
                    className={contactError ? "border-red-500" : ""}
                  />
                  {contactError && (
                    <p className="text-red-500 text-xs mt-1">{contactError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Hospital Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    required
                    placeholder="Enter complete hospital address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="resize-none h-[38px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-6 mb-4">
                <b>Note:</b> Only New Hospitals can register
              </p>

              <Button
                type="submit"
                className="w-full bg-bloodRed hover:bg-bloodRedDark flex items-center justify-center gap-2 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Register
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
