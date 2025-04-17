import React from "react";
import Logo from "./Logo";
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-softPink text-darkGray border-t border-softPink-medium">
      <div className="max-w-7xl mx-auto py-8 px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
          </div>

          <div className="flex space-x-4">
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-softPink-medium flex items-center justify-center hover:bg-softPink-dark transition-colors text-darkGray hover:text-white"
            >
              <span className="sr-only">Facebook</span>
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-softPink-medium flex items-center justify-center hover:bg-softPink-dark transition-colors text-darkGray hover:text-white"
            >
              <span className="sr-only">Instagram</span>
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-softPink-medium flex items-center justify-center hover:bg-softPink-dark transition-colors text-darkGray hover:text-white"
            >
              <span className="sr-only">Twitter</span>
              <Twitter size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-softPink-medium flex items-center justify-center hover:bg-softPink-dark transition-colors text-darkGray hover:text-white"
            >
              <span className="sr-only">LinkedIn</span>
              <Linkedin size={16} />
            </a>
            <a
              href="#"
              className="w-8 h-8 rounded-full bg-softPink-medium flex items-center justify-center hover:bg-softPink-dark transition-colors text-darkGray hover:text-white"
            >
              <span className="sr-only">YouTube</span>
              <Youtube size={16} />
            </a>
          </div>
        </div>

        <div className="text-center text-sm text-darkGray/60 mt-8">
          <p>
            © {currentYear} Lifestream+ Blood Bank. <br />
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
