import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex space-x-1.5" data-cy="loading-spinner">
        <span className="block w-2.5 h-2.5 rounded-full bg-sky-500 animate-dot-pulse-delay-1"></span>
        <span className="block w-2.5 h-2.5 rounded-full bg-sky-500 animate-dot-pulse-delay-2"></span>
        <span className="block w-2.5 h-2.5 rounded-full bg-sky-500 animate-dot-pulse"></span>
      </div>
    </div>
  );
};

export default SplashScreen;
