import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, LogIn } from "lucide-react";

const Login = () => {
  // Use location to get any state passed when navigating to this page
  const location = useLocation();
  const userType = location.state?.userType;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin credentials hardcoded for direct access (match backend)
  const ADMIN_EMAIL = "lifestream@gmail.com";
  const ADMIN_PASSWORD = "12345678";

  // Hospital demo credentials
  const HOSPITAL_EMAIL = "hospital@example.com";
  const HOSPITAL_PASSWORD = "hospital123";

  // Modify the useEffect to clear fields but not pre-fill them
  useEffect(() => {
    // Only clear tokens if we're on the login page (user has logged out)
    const path = window.location.pathname;
    if (path === "/" || path === "/login") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("bloodbank_user");
      console.log("Cleared existing auth tokens on login page load");
    }

    // Always clear the fields, regardless of userType
    setEmail("");
    setPassword("");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Clear any existing tokens before setting new ones
      localStorage.removeItem("auth_token");
      localStorage.removeItem("bloodbank_user");

      // Special case: When clicking direct login buttons from homepage
      if (userType === "admin" && email === "") {
        // For admin login button clicks, use hardcoded admin credentials
        try {
          console.log("Using admin credentials from button click");
          const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to authenticate admin");
          }

          const data = await response.json();
          if (data.success && data.token) {
            localStorage.setItem("auth_token", data.token);
            localStorage.setItem(
              "bloodbank_user",
              JSON.stringify({
                id: data.user.id || 999,
                name: "Administrator",
                email: "lifestream@gmail.com",
                role: "admin",
              })
            );

            toast({
              title: "Login successful",
              description: "Welcome, Administrator",
              variant: "default",
            });

            setTimeout(() => {
              window.location.href = "/admin";
            }, 100);
            return;
          } else {
            throw new Error("Admin authentication failed");
          }
        } catch (error) {
          console.error("Error during admin login:", error);
          toast({
            title: "Login Failed",
            description: "Admin authentication failed. Please contact support.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else if (userType === "hospital" && email === "") {
        // For hospital login button clicks, use hospital credentials
        try {
          console.log("Using hospital credentials from button click");
          // Use the API to authenticate hospital credentials
          const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: HOSPITAL_EMAIL,
              password: HOSPITAL_PASSWORD,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to authenticate hospital");
          }

          const data = await response.json();
          if (data.success && data.token) {
            localStorage.setItem("auth_token", data.token);
            localStorage.setItem("bloodbank_user", JSON.stringify(data.user));

            toast({
              title: "Login successful",
              description: `Welcome, ${data.user.name}`,
              variant: "default",
            });

            window.location.href = "/dashboard";
            return;
          } else {
            throw new Error("Hospital authentication failed");
          }
        } catch (error) {
          console.error("Hospital login error:", error);
          toast({
            title: "Login Failed",
            description: "Hospital login failed. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // For manual credential entry, perform proper authentication
      try {
        // Call the authentication API directly for proper validation
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        if (!response.ok) {
          // Get specific error message if available
          const errorData = await response.json();
          throw new Error(errorData.message || "Authentication failed");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Authentication failed");
        }

        // Store authentication data
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("bloodbank_user", JSON.stringify(data.user));

        // Show success message
        toast({
          title: "Login successful",
          description: `Welcome, ${data.user.name}`,
          variant: "default",
        });

        // Redirect based on user role
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } catch (error) {
        console.error("Authentication error:", error);

        // Show appropriate error message based on the error
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";

        // Check for specific error types
        if (
          errorMessage.toLowerCase().includes("not found") ||
          errorMessage.toLowerCase().includes("no user") ||
          errorMessage.toLowerCase().includes("invalid email")
        ) {
          toast({
            title: "Login Failed",
            description: "Email not found. Please check your email address.",
            variant: "destructive",
          });
        } else if (
          errorMessage.toLowerCase().includes("password") ||
          errorMessage.toLowerCase().includes("invalid credentials")
        ) {
          toast({
            title: "Login Failed",
            description: "Incorrect password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description:
              errorMessage || "Invalid credentials. Please try again.",
            variant: "destructive",
          });
        }

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-stone-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-bloodRed hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an Hospital account?{" "}
              <Link to="/register" className="text-bloodRed hover:underline">
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
