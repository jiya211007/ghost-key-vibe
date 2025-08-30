import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, mockArticle, mockComment } from '../../test/utils.jsx';
import ArticleDetailPage from '../ArticleDetailPage.jsx';

// Mock the API modules
vi.mock('../../api/articles.js', () => ({
  getArticleBySlug: vi.fn(),
  incrementViews: vi.fn(),
}));

vi.mock('../../api/comments.js', () => ({
  getCommentsByArticle: vi.fn(),
  createComment: vi.fn(),
}));

vi.mock('../../api/likes.js', () => ({
  toggleLike: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'test-article' }),
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock the auth context
vi.mock('../../context/AuthContext.jsx', async () => {
  const actual = await vi.importActual('../../context/AuthContext.jsx');
  return {
    ...actual,
    useAuth: () => ({
      user: {
        _id: '1',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      },
      isAuthenticated: true,
    }),
  };
});

import { getArticleBySlug, incrementViews } from '../../api/articles.js';
import { getCommentsByArticle, createComment } from '../../api/comments.js';
import { toggleLike } from '../../api/likes.js';

describe('ArticleDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    getArticleBySlug.mockResolvedValue({
      data: mockArticle,
    });
    
    getCommentsByArticle.mockResolvedValue({
      data: [mockComment],
    });
    
    incrementViews.mockResolvedValue({
      data: { success: true, message: 'View count updated' },
    });
    
    toggleLike.mockResolvedValue({
      data: { success: true, liked: true },
    });
    
    createComment.mockResolvedValue({
      data: { success: true, message: 'Comment created successfully' },
    });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<ArticleDetailPage />);
    
    expect(screen.getByText('Loading article...')).toBeInTheDocument();
  });

  it('renders article content when loaded', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays author information correctly', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });
    
    expect(screen.getByText('@testauthor')).toBeInTheDocument();
  });

  it('shows article statistics', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('100 views')).toBeInTheDocument();
      expect(screen.getByText('10 likes')).toBeInTheDocument();
      expect(screen.getByText('5 comments')).toBeInTheDocument();
    });
  });

  it('displays tags when available', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#example')).toBeInTheDocument();
    });
  });

  it('shows comments section', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Comments (1)')).toBeInTheDocument();
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });
  });

  it('allows authenticated users to add comments', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
      expect(screen.getByText('Post Comment')).toBeInTheDocument();
    });
  });

  it('shows edit button for article author', async () => {
    // Mock user as article author
    vi.mocked(require('../../context/AuthContext.jsx').useAuth).mockReturnValue({
      user: {
        _id: '1', // Same as article author
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      },
      isAuthenticated: true,
    });

    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    getArticleBySlug.mockRejectedValue(new Error('Article not found'));
    
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading article')).toBeInTheDocument();
      expect(screen.getByText('Article not found')).toBeInTheDocument();
    });
  });

  it('increments view count when article loads', async () => {
    renderWithProviders(<ArticleDetailPage />);
    
    await waitFor(() => {
      expect(incrementViews).toHaveBeenCalledWith('test-article');
    });
  });
});
