import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const EnhancedToaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          padding: 0,
          margin: 0,
          boxShadow: 'none',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    >
      {(t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {t.type === 'success' && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
                {t.type === 'error' && (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                {t.type === 'loading' && (
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {t.type === 'default' && (
                  <Info className="h-6 w-6 text-blue-500" />
                )}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t.message}
                </p>
                {t.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => t.dismiss()}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </HotToaster>
  );
};

export default EnhancedToaster;
