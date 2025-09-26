import React from 'react';
import { Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
        <p className="mb-4">Criado por Sarah Silva</p>
        <div className="flex justify-center space-x-6">
          <a
            href="https://www.linkedin.com/in/sarah-dev-silva/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn de Sarah Silva"
            className="text-gray-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            <Linkedin size={24} />
          </a>
          <a
            href="https://www.instagram.com/loopdasarah/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Sarah Silva"
            className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
          >
            <Instagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
