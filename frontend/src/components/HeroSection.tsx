
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Droplets } from 'lucide-react';

const HeroSection = () => {
  const { user, isAdmin, isHospital } = useAuth();

  return (
    <section className="bg-softPink py-16 md:py-24 px-6 md:px-12 text-center relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-5 -right-5 w-64 h-64 bg-softPink-dark/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-softPink-dark/10 rounded-full blur-3xl"></div>
        
        {/* Floating droplets */}
        <Droplets className="absolute top-12 left-[10%] w-12 h-12 text-softPink-dark opacity-20" />
        <Droplets className="absolute bottom-24 right-[15%] w-10 h-10 text-softPink-dark opacity-20" />
        <Droplets className="absolute top-36 right-[20%] w-8 h-8 text-softPink-dark opacity-15" />
        <Droplets className="absolute bottom-36 left-[25%] w-10 h-10 text-softPink-dark opacity-15" />
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-brownRed flex items-center justify-center shadow-xl">
            <Droplets className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-darkGray mb-6">
          Donate Blood Today, Save a Life Tomorrow
        </h1>
        <p className="text-darkGray/90 text-lg mb-8 max-w-2xl mx-auto">
          Join our mission to provide life-saving blood to those in need. Your donation can
          make a difference in someone's life.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {user ? (
            <>
              <Button asChild className="action-btn-primary">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              {isAdmin() ? (
                <Button asChild className="action-btn-secondary">
                  <Link to="/donors">Manage Donors</Link>
                </Button>
              ) : isHospital() ? (
                <Button asChild className="action-btn-secondary">
                  <Link to="/requests">Request Blood</Link>
                </Button>
              ) : null}
            </>
          ) : (
            <>
              <Button asChild className="action-btn-primary">
                <Link to="/register">Register</Link>
              </Button>
              <Button asChild className="action-btn-secondary">
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-12 flex justify-center">
          <a href="#donate" className="flex items-center text-darkGray hover:text-bloodRed transition-colors">
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
        
        {/* Blood drop animation at the bottom */}
        <div className="mt-12 flex justify-center opacity-90">
          <div className="w-8 h-8 bg-bloodRed rounded-full relative animate-bounce">
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 
                          border-l-[8px] border-r-[8px] border-t-[12px] 
                          border-l-transparent border-r-transparent border-t-bloodRed"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
