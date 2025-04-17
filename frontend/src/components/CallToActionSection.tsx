
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Droplets } from 'lucide-react';

interface CallToActionSectionProps {
  id: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const CallToActionSection = ({
  id,
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}: CallToActionSectionProps) => {
  return (
    <section id={id} className="bg-softPink py-12 md:py-16 px-6 md:px-12 border-t border-softPink-medium relative overflow-hidden">
      {/* Visual elements in the background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <Heart className="absolute top-6 left-[10%] w-20 h-20 text-bloodRed" />
        <Droplets className="absolute bottom-8 right-[15%] w-16 h-16 text-bloodRed" />
        <Heart className="absolute top-1/3 right-[5%] w-12 h-12 text-bloodRed" />
        <Droplets className="absolute bottom-1/4 left-[20%] w-10 h-10 text-bloodRed" />
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="md:w-2/3 mb-6 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-darkGray mb-2 flex items-center">
            <Heart className="mr-2 h-6 w-6 text-bloodRed" strokeWidth={2.5} />
            {title}
          </h2>
          <p className="text-darkGray/90">{description}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {secondaryButtonText && secondaryButtonLink && (
            <Button asChild className="action-btn-secondary">
              <a href={secondaryButtonLink}>{secondaryButtonText}</a>
            </Button>
          )}
          <Button asChild className="action-btn-primary">
            <a href={primaryButtonLink}>{primaryButtonText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
