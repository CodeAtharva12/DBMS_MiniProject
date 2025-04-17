
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { Droplets } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  titleAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  titleAction,
  className,
  contentClassName
}) => {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <Navbar />
      
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-softPink-medium/30 to-transparent -z-10"></div>
      
      <main className="flex-grow py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {(title || titleAction) && (
            <div className="glass-card p-6 mb-8 overflow-hidden relative">
              <div className="absolute -top-12 -right-12 opacity-5">
                <Droplets className="w-40 h-40 text-bloodRed" />
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                {title && (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-bloodRed rounded-full"></div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-darkGray">{title}</h1>
                    </div>
                    {subtitle && <p className="text-mediumGray mt-2 ml-3">{subtitle}</p>}
                  </div>
                )}
                
                {titleAction && (
                  <div className="md:ml-auto">
                    {titleAction}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={cn("animate-fade-in", contentClassName)}>
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PageLayout;
