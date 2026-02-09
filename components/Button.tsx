import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'bronze';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // Increased base rounding to rounded-3xl for the specific organic look
  const baseStyles = "inline-flex items-center justify-center rounded-3xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]";
  
  const variants = {
    primary: "bg-medical-blue text-white hover:bg-blue-600 focus:ring-blue-500 shadow-blue-500/20",
    // Refined bronze for premium look with specific shadow
    bronze: "bg-medical-bronze text-white hover:bg-[#B08D4C] focus:ring-[#C5A059] shadow-[#C5A059]/30",
    secondary: "bg-white text-medical-text border border-gray-100 hover:bg-gray-50 focus:ring-gray-200",
    outline: "border-2 border-medical-blue text-medical-blue hover:bg-blue-50 focus:ring-blue-500",
    ghost: "text-medical-text hover:bg-gray-100 shadow-none",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};