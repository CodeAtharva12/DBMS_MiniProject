
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Droplets, Users, Hospital, Award } from 'lucide-react';
import BloodDropModel from './BloodDropModel';

interface StatProps {
  number: string;
  label: string;
  icon: React.ReactNode;
}

const Stat = ({ number, label, icon }: StatProps) => (
  <div className="p-6 bg-white rounded-lg shadow-md border border-softPink-medium/30 flex items-start gap-4 hover:shadow-lg transition-shadow">
    <div className="p-3 bg-gradient-to-br from-softPink to-softPink-medium rounded-full">
      {icon}
    </div>
    <div>
      <div className="text-3xl sm:text-4xl font-bold text-darkGray">{number}</div>
      <div className="text-mediumGray text-sm mt-1">{label}</div>
    </div>
  </div>
);

const StatsSection = () => {
  return (
    <section id="impact" className="bg-gradient-to-br from-softPink-light to-white py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-10">
          <div className="bg-bloodRed text-white px-3 py-1 rounded-full text-sm font-medium">Impact</div>
          <h2 className="text-3xl md:text-4xl font-bold text-darkGray">Making a Difference, One Donation at a Time</h2>
        </div>
        
        <p className="text-darkGray/90 max-w-2xl mb-12 text-lg">
          Every donation counts in saving lives. Join our community of generous donors today and be part of our mission to ensure blood availability for all in need.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-16">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Stat 
                number="10,000+" 
                label="Lives saved through donations" 
                icon={<Droplets className="h-6 w-6 text-bloodRed" />} 
              />
              <Stat 
                number="5,000+" 
                label="Active donors in our network" 
                icon={<Users className="h-6 w-6 text-bloodRed" />} 
              />
              <Stat 
                number="120+" 
                label="Partner medical facilities" 
                icon={<Hospital className="h-6 w-6 text-bloodRed" />} 
              />
              <Stat 
                number="98%" 
                label="Successful blood transfusions" 
                icon={<Award className="h-6 w-6 text-bloodRed" />} 
              />
            </div>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <Button className="bg-bloodRed hover:bg-bloodRedDark text-white font-medium rounded-full px-6">
                Donate Now
              </Button>
              <Button variant="outline" className="border-bloodRed text-bloodRed hover:bg-softPink-light rounded-full px-6">
                Request Blood
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-brownRed to-bloodRed rounded-lg p-4 aspect-video flex items-center justify-center shadow-lg overflow-hidden relative">
            <BloodDropModel className="w-full h-full" />
            <div className="absolute bottom-4 right-4 text-white bg-bloodRed p-2 rounded-full">
              <Droplets className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
