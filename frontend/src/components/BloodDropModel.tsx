
import React, { useState, useEffect } from 'react';
import { Droplets, Syringe, ClipboardCheck } from 'lucide-react';

const BloodDropModel: React.FC<{ className?: string }> = ({ className }) => {
  const [mounted, setMounted] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Set up pulsing animation
    const pulseInterval = setInterval(() => {
      setPulsing(prev => !prev);
    }, 1200);
    
    return () => clearInterval(pulseInterval);
  }, []);

  if (!mounted) {
    return <BloodDropFallback />;
  }

  return (
    <div className={`w-full h-full rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
      <div className="relative w-full h-full bg-gradient-to-br from-bloodRed to-bloodRedDark flex items-center justify-center">
        {/* Background imagery */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-bloodRedDark/20 rounded-full blur-3xl"></div>
          <div className="absolute top-0 left-0 w-2/3 h-2/3 bg-amber/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Blood drop visualization */}
        <div className="relative flex flex-col items-center justify-center gap-8">
          <div className={`relative transition-transform duration-1000 ${pulsing ? 'scale-105' : 'scale-100'}`}>
            <div className="relative flex flex-col items-center">
              <Droplets 
                className="h-24 w-24 text-white animate-pulse" 
                fill="rgba(255,255,255,0.7)"
                strokeWidth={1.5}
              />
              <div className="mt-4 text-white text-lg font-medium">Every Drop Counts</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="flex flex-col items-center gap-2">
              <Syringe className="h-12 w-12 text-white opacity-80" />
              <span className="text-white text-sm">Donate</span>
            </div>
            
            <div className="w-px h-16 bg-white/30"></div>
            
            <div className="flex flex-col items-center gap-2">
              <ClipboardCheck className="h-12 w-12 text-white opacity-80" />
              <span className="text-white text-sm">Save Lives</span>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/80 animate-pulse"
            style={{
              width: `${6 + Math.random() * 10}px`,
              height: `${6 + Math.random() * 10}px`,
              top: `${10 + Math.random() * 80}%`,
              left: `${10 + Math.random() * 80}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Fallback while the component is loading
function BloodDropFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-softPink-dark">
      <Droplets className="w-16 h-16 text-white animate-pulse" />
    </div>
  );
}

export default BloodDropModel;
