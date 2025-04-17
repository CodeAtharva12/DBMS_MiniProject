
import React from 'react';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  darkMode?: boolean;
}

const Logo = ({ className, size = 'md', darkMode = false }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={cn(
      "font-bold flex items-center", 
      sizeClasses[size], 
      darkMode ? "text-white" : "text-darkGray", 
      className
    )}>
      <Droplets 
        className={cn(
          "mr-1.5", 
          iconSizes[size], 
          darkMode ? "text-white" : "text-bloodRed"
        )} 
        fill={darkMode ? "white" : "#D32F2F"} 
        strokeWidth={2.5} 
      />
      <span className="font-serif">LifeStream</span>
      <span className="ml-1 text-bloodRed font-serif">+</span>
    </div>
  );
};

export default Logo;
