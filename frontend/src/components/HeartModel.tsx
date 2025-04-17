import React, { useState, useEffect } from "react";
import { Droplets } from "lucide-react";

// A CSS-based blood drop animation
const BloodDropModel: React.FC<{ className?: string }> = ({ className }) => {
  const [mounted, setMounted] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Set up pulsing animation
    const pulseInterval = setInterval(() => {
      setPulsing((prev) => !prev);
    }, 1000);

    return () => clearInterval(pulseInterval);
  }, []);

  if (!mounted) {
    return <BloodDropFallback />;
  }

  return (
    <div
      className={`w-full h-full rounded-lg overflow-hidden flex items-center justify-center ${className}`}
    >
      <div className="relative w-full h-full bg-gradient-to-br from-brownRed/80 to-bloodRed/80 flex items-center justify-center">
        {/* Background imagery */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 right-0 w-full h-full bg-softPink-dark/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-bloodRed/20 rounded-full blur-3xl"></div>
        </div>

        {/* Blood drop shape using CSS */}
        <div
          className={`relative w-32 h-32 ${
            pulsing ? "scale-110" : "scale-100"
          } transition-transform duration-1000`}
        >
          <div className="relative w-20 h-20 bg-bloodRed rounded-full mx-auto">
            <div
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-0 h-0 
                           border-l-[20px] border-r-[20px] border-t-[30px] 
                           border-l-transparent border-r-transparent border-t-bloodRed"
            ></div>
          </div>

          {/* Additional droplets */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <Droplets className="h-8 w-8 text-bloodRed animate-bounce" />
          </div>
        </div>

        {/* Animated blood particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-bloodRed/90 animate-pulse"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${1 + Math.random()}s`,
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
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 bg-bloodRed rounded-full animate-pulse"></div>
    </div>
  );
}

export default BloodDropModel;
