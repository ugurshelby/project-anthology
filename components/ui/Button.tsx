import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'f1' | 'anthology';
};

const base = 'px-4 py-2 border border-white/10 bg-white/5 transition-all duration-300 font-mono text-[10px] uppercase tracking-[0.15em] focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black';
const variants: Record<string, string> = {
  f1: 'hover:bg-white hover:text-black hover:border-white text-gray-300',
  anthology: 'hover:bg-white hover:text-black hover:border-white text-gray-300',
};

const Button: React.FC<ButtonProps> = ({ variant = 'anthology', className = '', ...props }) => {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

export default Button;
