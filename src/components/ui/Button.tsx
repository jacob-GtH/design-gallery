// components/ui/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  className?: string;
} & React.ComponentPropsWithoutRef<typeof motion.button>;

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = "px-6 py-3 rounded-full font-medium transition-all";

  const variants = {
    primary: "bg-white text-blue-900 hover:bg-blue-100 shadow-lg",
    outline: "bg-transparent border-2 border-white  hover:bg-white/10"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};