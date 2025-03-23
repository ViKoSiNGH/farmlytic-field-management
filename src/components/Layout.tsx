
import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-farm-green-light dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar />
      <main className={cn(
        "container max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-fade-in",
        className
      )}>
        {children}
      </main>
    </div>
  );
}
