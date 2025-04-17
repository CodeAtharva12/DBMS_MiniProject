import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Hospital } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-softPink to-white">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-bloodRed mb-4">
            Welcome to LIFESTREAM<span className="text-bloodRed">+</span>
            <br /> Blood Bank
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Connecting hospitals with life-saving blood supplies. Our platform
            streamlines the blood request process for medical facilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Admin Login Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-bloodRed overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-white to-softPink-light pb-2">
              <CardTitle className="text-xl text-bloodRed flex items-center justify-center">
                <Shield className="h-6 w-6 mr-2 text-bloodRed" />
                Admin Login
              </CardTitle>
              <CardDescription className="text-center">
                For LIFESTREAM+ Blood Bank administrators only
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-6 text-center">
                Access the admin dashboard to manage blood inventory and
                hospital requests.
              </p>
              <Button
                className="w-full bg-bloodRed hover:bg-bloodRedDark text-white"
                onClick={() =>
                  navigate("/login", { state: { userType: "admin" } })
                }
              >
                Login as Admin
              </Button>
              <p className="text-xs text-gray-500 mt-4 text-center">
                <b>Note:</b> This login is exclusively for LIFESTREAM+ Blood
                Bank administrators.
              </p>
            </CardContent>
          </Card>

          {/* Hospital Login Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-medicalBlue overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-white to-softPink-light pb-2">
              <CardTitle className="text-xl text-medicalBlue flex items-center justify-center">
                <Hospital className="h-6 w-6 mr-2 text-medicalBlue" />
                Hospital Login
              </CardTitle>
              <CardDescription className="text-center">
                For medical facilities requesting blood
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-6 text-center">
                Request blood units from LIFESTREAM+ Blood Bank and track your
                request status.
              </p>
              <div className="flex flex-col w-full space-y-3">
                <Button
                  className="w-full bg-medicalBlue hover:bg-blue-700 text-white"
                  onClick={() =>
                    navigate("/login", { state: { userType: "hospital" } })
                  }
                >
                  Login as Hospital
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-medicalBlue text-medicalBlue hover:bg-blue-50"
                  onClick={() => navigate("/register")}
                >
                  Register Hospital
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 max-w-2xl text-center">
          <h2 className="text-xl font-semibold text-bloodRed mb-2">
            About LIFESTREAM+ Blood Bank
          </h2>
          <p className="text-gray-700">
            LIFESTREAM+ is dedicated to providing hospitals with a reliable
            source of blood products. Our state-of-the-art facilities ensure the
            highest quality standards for all blood units.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
