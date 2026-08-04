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
  const baseClasses = "px-6 py-3 rounded-full font-medium transition-all duration-300";

  const variants = {
    primary: "bg-black text-white dark:bg-white dark:text-blue-900 hover:bg-gray-800 dark:hover:bg-blue-100 shadow-lg border border-black/10 dark:border-none",
    outline: "bg-transparent border-2 border-black/20 dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
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
