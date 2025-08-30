import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  Bookmark,
  Clock,
  Calendar,
  Tag,
  User,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Send,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext.jsx';
import { getArticleBySlug, likeArticle, unlikeArticle, addComment, getRelatedArticles } from '../api/articles.js';

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch article data
  const { data: articleResponse, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => {
      console.log('Fetching article with slug:', slug);
      return getArticleBySlug(slug);
    },
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      console.log('Article fetched successfully:', data);
    },
    onError: (error) => {
      console.log('Error fetching article:', error);
    }
  });

  // Extract article from response
  const article = articleResponse?.data;
  
  console.log('Article Response:', articleResponse);
  console.log('Extracted Article:', article);

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['relatedArticles', slug],
    queryFn: () => getRelatedArticles(slug),
    enabled: !!article,
    staleTime: 5 * 60 * 1000,
  });

  // Like/Unlike mutations
  const likeMutation = useMutation({
    mutationFn: () => likeArticle(article.id),
    onSuccess: () => {
      setIsLiked(true);
      queryClient.invalidateQueries(['article', slug]);
      toast.success('Article liked!');
    },
    onError: () => toast.error('Failed to like article'),
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeArticle(article.id),
    onSuccess: () => {
      setIsLiked(false);
      queryClient.invalidateQueries(['article', slug]);
      toast.success('Like removed');
    },
    onError: () => toast.error('Failed to remove like'),
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: (commentData) => addComment(article.id, commentData),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries(['article', slug]);
      toast.success('Comment added successfully!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  // Handle like/unlike
  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please login to like articles');
      return;
    }
    
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    commentMutation.mutate({ content: commentText.trim() });
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle bookmark
  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark articles');
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  // Check if user has liked the article
  useEffect(() => {
    if (article && user) {
      setIsLiked(article.likes?.some(like => like.user === user.id) || false);
    }
  }, [article, user]);

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Format date
  const formatDate = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Article not found</p>
          <button
            onClick={() => navigate('/explore')}
            className="btn btn-primary"
          >
            Browse Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 lg:h-96">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block bg-primary-600 text-white text-sm px-3 py-1 rounded-full font-medium mb-3">
                {article.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {article.title}
              </h1>
              <p className="text-lg text-white/90 line-clamp-2">
                {article.excerpt}
              </p>
            </div>
          </div>

          {/* Article Meta */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 dark:text-primary-300 font-semibold text-lg">
                    {getInitials(article.author.name)}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {article.author.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {article.author.bio || 'Developer & Writer'}
                  </div>
                </div>
              </div>

              {/* Article Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(article.publishedAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {article.readingTime} min read
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  {article.views?.toLocaleString() || 0} views
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  <Tag className="w-3 h-3 mr-2" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isLiked
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{article.likes?.length || 0}</span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{article.comments?.length || 0}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Bookmark Button */}
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {/* More Options */}
                <button className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Comments ({article.comments?.length || 0})
            </h3>

            {/* Add Comment */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-700 dark:text-primary-300 font-semibold text-sm">
                      {getInitials(user.firstName || user.username)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!commentText.trim() || commentMutation.isLoading}
                        className="btn btn-primary btn-sm flex items-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {commentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 border border-gray-200 dark:border-gray-700 rounded-lg mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Please login to leave a comment
                </p>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {article.comments?.length > 0 ? (
                article.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                        {getInitials(comment.author.name)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 4).map((relatedArticle) => (
                <article
                  key={relatedArticle.id}
                  className="group cursor-pointer"
                >
                  <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                    <img
                      src={relatedArticle.coverImage}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <Link to={`/articles/${relatedArticle.slug}`}>
                      {relatedArticle.title}
                    </Link>
                  </h4>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{relatedArticle.author.name}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(relatedArticle.publishedAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
