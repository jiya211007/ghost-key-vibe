import React from 'react';

// Article Card Skeleton
export const ArticleCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-6">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-4/6"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
);

// Article List Skeleton
export const ArticleListSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex space-x-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
    <div className="text-center mb-6">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-32 mx-auto"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto"></div>
      </div>
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto"></div>
      </div>
    </div>
    
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
    </div>
    
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
                  colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-24' : 'w-20'
                }`}
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-48"></div>
    
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
      
      <div className="flex space-x-3 pt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  </div>
);

// Comment Skeleton
export const CommentSkeleton = () => (
  <div className="flex space-x-3 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
    <div className="flex-1">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

// Search Results Skeleton
export const SearchResultsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Pagination Skeleton
export const PaginationSkeleton = () => (
  <div className="flex items-center justify-center space-x-2 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    ))}
  </div>
);
