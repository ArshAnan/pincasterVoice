"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="/map-background.jpg" 
            alt="Map Background" 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Navigate Your World With Precision
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover places, save favorites, and explore with our powerful mapping platform.
              Voice-enabled for hands-free navigation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/explore" className="px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg transition-all hover:bg-blue-100 shadow-lg">
                Start Exploring
              </Link>
              <Link href="/features" className="px-8 py-4 border-2 border-white rounded-lg font-semibold text-lg transition-all hover:bg-white/10">
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>
      
      {/* You can add more sections below the hero */}
    </div>
  );
};

export default HomePage;
