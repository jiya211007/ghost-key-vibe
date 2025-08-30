import React, { useState } from 'react';
import { useLoading } from '../context/LoadingContext.jsx';
import { toast } from 'react-hot-toast';
import AdvancedSearch from '../components/AdvancedSearch.jsx';
import { 
  ArticleCardSkeleton, 
  ArticleListSkeleton, 
  ProfileSkeleton, 
  DashboardStatsSkeleton,
  TableSkeleton,
  FormSkeleton,
  CommentSkeleton,
  SearchResultsSkeleton,
  PaginationSkeleton
} from '../components/LoadingSkeletons.jsx';

const DemoPage = () => {
  const { showLoading, hideLoading, withLoading } = useLoading();
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [activeDemo, setActiveDemo] = useState('skeletons');

  // Demo functions
  const showSuccessToast = () => {
    toast.success('This is a success message!', {
      description: 'Operation completed successfully.'
    });
  };

  const showErrorToast = () => {
    toast.error('This is an error message!', {
      description: 'Something went wrong. Please try again.'
    });
  };

  const showLoadingToast = () => {
    toast.loading('Processing your request...', {
      description: 'Please wait while we complete the operation.'
    });
  };

  const showInfoToast = () => {
    toast('This is an info message!', {
      description: 'Here is some additional information.'
    });
  };

  const simulateLoading = async () => {
    showLoading('Processing your request...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    hideLoading();
    toast.success('Loading completed!');
  };

  const simulateAsyncOperation = async () => {
    await withLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'Operation completed!';
      },
      'Performing async operation...'
    );
    toast.success('Async operation completed!');
  };

  const handleSearch = (query) => {
    toast.success(`Searching for: ${query}`);
  };

  const handleFilter = (filters) => {
    toast.success('Filters applied!', {
      description: `Applied ${Object.keys(filters).length} filters`
    });
  };

  const demos = [
    { id: 'skeletons', label: 'Loading Skeletons', icon: '🔄' },
    { id: 'toasts', label: 'Toast Notifications', icon: '🔔' },
    { id: 'loading', label: 'Global Loading', icon: '⏳' },
    { id: 'search', label: 'Advanced Search', icon: '🔍' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enhanced UX Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Showcasing all the enhanced user experience features
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{demo.icon}</span>
                {demo.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        {activeDemo === 'skeletons' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Loading Skeletons
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Beautiful loading states that provide visual feedback while content loads.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Article Card Skeleton
                  </h3>
                  <ArticleCardSkeleton />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Article List Skeleton
                  </h3>
                  <ArticleListSkeleton />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Profile Skeleton
                  </h3>
                  <ProfileSkeleton />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Dashboard Stats Skeleton
                  </h3>
                  <DashboardStatsSkeleton />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Form Skeleton
                  </h3>
                  <FormSkeleton fields={3} />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Table Skeleton
                  </h3>
                  <TableSkeleton rows={4} columns={3} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'toasts' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Toast Notifications
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Rich, interactive notifications with different types and descriptions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={showSuccessToast}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Show Success Toast
                </button>
                
                <button
                  onClick={showErrorToast}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Show Error Toast
                </button>
                
                <button
                  onClick={showLoadingToast}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show Loading Toast
                </button>
                
                <button
                  onClick={showInfoToast}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Show Info Toast
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'loading' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Global Loading States
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Consistent loading states across the entire application with custom messages.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={simulateLoading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Show Loading (3s)
                </button>
                
                <button
                  onClick={simulateAsyncOperation}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Async Operation (2s)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'search' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Advanced Search & Filters
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Powerful search with advanced filtering options for better content discovery.
              </p>
              
              <AdvancedSearch
                onSearch={handleSearch}
                onFilter={handleFilter}
                categories={['Technology', 'Programming', 'Web Development', 'Design', 'Business']}
                showAdvanced={showAdvancedSearch}
                onToggleAdvanced={() => setShowAdvancedSearch(!showAdvancedSearch)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;
