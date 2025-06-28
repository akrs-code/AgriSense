import React, { useEffect, useState } from 'react';
import { Sprout, Wifi, WifiOff } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute bottom-32 right-10 w-28 h-28 bg-white rounded-full"></div>
      </div>

      <div className="text-center z-10">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Sprout size={64} className="text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">AgriSense</h1>
          <p className="text-primary-light text-xl font-medium">Connecting Farmers & Buyers</p>
        </div>

        {/* Loading Progress */}
        <div className="w-64 mx-auto mb-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/80 text-sm mt-2">{progress}% Loading...</p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2 text-white/90">
          {isOnline ? (
            <>
              <Wifi size={16} />
              <span className="text-sm">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={16} />
              <span className="text-sm">Offline Mode Available</span>
            </>
          )}
        </div>

        {/* Version */}
        <p className="text-white/60 text-xs mt-4">Version 1.0.0</p>
      </div>
    </div>
  );
};