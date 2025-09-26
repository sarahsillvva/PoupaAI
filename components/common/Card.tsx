import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div id={id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;