import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoader = ({ isLoading, message = 'Loading...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-sm mx-4 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {message}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we process your request...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
