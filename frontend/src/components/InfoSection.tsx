
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Droplets, Heart } from 'lucide-react';

interface InfoSectionProps {
  id: string;
  label: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageUrl?: string;
  reversed?: boolean;
}

const InfoSection = ({
  id,
  label,
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  imageUrl,
  reversed = false,
}: InfoSectionProps) => {
  return (
    <section id={id} className="bg-softPink py-16 md:py-24 px-6 md:px-12">
      <div className={`max-w-7xl mx-auto flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}>
        <div className="md:w-1/2">
          <div className="text-sm font-medium mb-2 text-bloodRed">{label}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-darkGray mb-4">{title}</h2>
          <p className="text-darkGray/90 mb-6">{description}</p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="action-btn-primary">
              <a href={primaryButtonLink}>{primaryButtonText}</a>
            </Button>
            
            {secondaryButtonText && secondaryButtonLink && (
              <a href={secondaryButtonLink} className="inline-flex items-center text-darkGray hover:text-bloodRed">
                {secondaryButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="bg-softPink-medium rounded-lg p-8 aspect-video flex items-center justify-center overflow-hidden shadow-lg transition-transform hover:scale-[1.02] duration-300">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Blood Donation" 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-softPink-dark to-brownRed rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/blood-cells.jpg" 
                    alt="Blood Cells" 
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
                <Heart className="relative z-10 w-24 h-24 text-white animate-pulse" strokeWidth={1.5} />
                <Droplets className="absolute bottom-8 right-8 w-12 h-12 text-white opacity-80" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
