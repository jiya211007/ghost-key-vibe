import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  Save, 
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Eye as PreviewIcon,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { createArticle } from '../api/articles.js';

const CreateArticlePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    coverImage: null,
    coverImagePreview: null
  });
  
  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  // Categories (matching server validation)
  const categories = [
    'Technology',
    'Programming', 
    'Design',
    'Business',
    'Marketing',
    'Productivity',
    'Career',
    'Education',
    'Health',
    'Lifestyle',
    'Other'
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // Remove cover image
  const removeCoverImage = () => {
    if (formData.coverImagePreview) {
      URL.revokeObjectURL(formData.coverImagePreview);
    }
    setFormData(prev => ({
      ...prev,
      coverImage: null,
      coverImagePreview: null
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length < 20) {
      newErrors.excerpt = 'Excerpt must be at least 20 characters';
    } else if (formData.excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt must be less than 300 characters (server limit)';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create article mutation
  const createArticleMutation = useMutation({
    mutationFn: createArticle,
    onSuccess: (response) => {
      console.log('Article creation response:', response);
      
      toast.success('Article created successfully!');
      queryClient.invalidateQueries(['articles']);
      
      // Handle different response structures
      const article = response.data?.article || response.article || response.data || response;
      const slug = article?.slug;
      
      console.log('Extracted article:', article);
      console.log('Extracted slug:', slug);
      
      if (slug) {
        console.log('Navigating to:', `/articles/${slug}`);
        // Add a small delay to ensure the article is available
        setTimeout(() => {
          navigate(`/articles/${slug}`);
        }, 500);
      } else {
        console.error('No slug found in response:', response);
        console.error('Full response structure:', JSON.stringify(response, null, 2));
        toast.error('Article created but cannot navigate to it. Redirecting to explore page.');
        navigate('/explore');
      }
    },
    onError: (error) => {
      console.error('Create article error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create article';
      toast.error(message);
    }
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('excerpt', formData.excerpt.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('category', formData.category);
      
      // Process tags - send as individual form fields for validation
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 20)
        .slice(0, 10); // Limit to 10 tags
      
      // Send tags as separate form fields (required by server validation)
      tagsArray.forEach((tag, index) => {
        formDataToSend.append(`tags[${index}]`, tag);
      });
      
      // Append cover image if exists
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }
      
      console.log('Creating article...', {
        title: formData.title,
        category: formData.category,
        tags: tagsArray,
        hasImage: !!formData.coverImage
      });
      
      await createArticleMutation.mutateAsync(formDataToSend);
    } catch (error) {
      console.error('Error creating article:', error);
    }
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Article
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share your knowledge with the community
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="btn btn-outline btn-sm flex items-center"
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              
              <button
                type="submit"
                form="article-form"
                disabled={createArticleMutation.isLoading}
                className="btn btn-primary btn-sm flex items-center"
              >
                {createArticleMutation.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Publish Article
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="article-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {!showPreview ? (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-xl border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your article title..."
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Article Excerpt *
                    </label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.excerpt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Write a brief summary of your article..."
                    />
                    {errors.excerpt && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.excerpt}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formData.excerpt.length}/300 characters
                    </p>
                  </div>

                  {/* Content */}
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Article Content * (Markdown supported)
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={20}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono ${
                        errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Write your article content using Markdown..."
                    />
                    {errors.content && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.content}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {formData.content.trim().split(/\s+/).filter(w => w.length > 0).length} words
                      </span>
                      <span>
                        ~{calculateReadingTime(formData.content)} min read
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Preview Mode */
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {formData.coverImagePreview && (
                      <img
                        src={formData.coverImagePreview}
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    
                    <h1 className="text-3xl font-bold mb-4">
                      {formData.title || 'Your Article Title'}
                    </h1>
                    
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic">
                      {formData.excerpt || 'Your article excerpt will appear here...'}
                    </p>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        className="prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300"
                      >
                        {formData.content || '*Start writing your content to see the preview...*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="space-y-6">
                {/* Cover Image */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Cover Image
                  </h3>
                  
                  {formData.coverImagePreview ? (
                    <div className="relative">
                      <img
                        src={formData.coverImagePreview}
                        alt="Cover preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Upload cover image</span>
                        <span className="text-xs">PNG, JPG up to 5MB</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Category & Tags */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Article Details
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tags
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="react, javascript, tutorial (comma separated)"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Separate tags with commas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Article Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Article Stats
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Characters:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.content.length.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Words:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.content.trim().split(/\s+/).filter(w => w.length > 0).length.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reading time:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ~{calculateReadingTime(formData.content)} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticlePage;