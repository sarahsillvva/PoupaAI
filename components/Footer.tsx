import React from 'react';
import { Linkedin, Instagram, MessageSquare } from 'lucide-react';

const Footer: React.FC = () => {
  const handleFeedbackClick = () => {
    window.dispatchEvent(new CustomEvent('open-feedback-modal'));
  };

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 dark:text-gray-400">
        <div className="mb-4 flex justify-center items-center gap-4">
            <p>Criado por Sarah Silva</p>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button onClick={handleFeedbackClick} className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"> <MessageSquare size={14}/> Enviar Feedback</button>
        </div>
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
