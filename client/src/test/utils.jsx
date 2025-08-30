import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext.jsx';

// Create a custom render function that includes providers
export function renderWithProviders(ui, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock data for testing
export const mockUser = {
  _id: '1',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'user',
  isAuthenticated: true,
};

export const mockArticle = {
  _id: '1',
  title: 'Test Article',
  slug: 'test-article',
  content: '# Test Content\n\nThis is a test article.',
  excerpt: 'Test excerpt',
  author: {
    _id: '1',
    firstName: 'Test',
    lastName: 'Author',
    username: 'testauthor',
    bio: 'Test bio',
  },
  category: 'Technology',
  tags: ['test', 'example'],
  status: 'approved',
  isPublished: true,
  publishedAt: new Date('2024-01-01'),
  readingTime: 2,
  views: 100,
  likes: 10,
  comments: 5,
};

export const mockComment = {
  _id: '1',
  content: 'Test comment',
  author: {
    _id: '1',
    firstName: 'Test',
    lastName: 'Commenter',
    username: 'testcommenter',
  },
  createdAt: new Date('2024-01-01'),
  likes: 2,
};

// Mock API responses
export const mockApiResponse = (data, success = true) => ({
  data: {
    success,
    data,
    message: success ? 'Success' : 'Error',
  },
});

// Mock API error
export const mockApiError = (message = 'API Error', status = 400) => {
  const error = new Error(message);
  error.response = {
    data: { message, success: false },
    status,
  };
  return error;
};
