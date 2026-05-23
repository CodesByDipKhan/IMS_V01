import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'back' | 'dashboard' | 'action'; // back = red, dashboard = blue, action = green
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'action', children, className = '', ...props }) => {
  let colorClasses = '';

  if (variant === 'back') {
    colorClasses = 'bg-red-500 hover:bg-red-600';
  } else if (variant === 'dashboard') {
    colorClasses = 'bg-blue-600 hover:bg-blue-700';
  } else {
    // action button (Clear, Register, Save, Print, Search, Login) is green
    colorClasses = 'bg-green-500 hover:bg-green-600';
  }

  return (
    <button
      className={`btn-pop px-6 py-2.5 rounded-lg font-bold text-white text-center select-none shadow-md outline-none transition-all duration-200 ease-in-out cursor-pointer ${colorClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
