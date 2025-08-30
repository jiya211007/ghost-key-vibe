import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  AlertCircle,
  BookOpen,
  Tag,
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data
const mockArticle = {
  id: 1,
  title: "Building Scalable Microservices with Node.js and Docker",
  excerpt: "Learn how to design and implement microservices architecture using Node.js, Docker, and best practices for production deployment.",
  content: `# Building Scalable Microservices with Node.js and Docker

## Introduction

Microservices architecture has become increasingly popular in recent years, offering a way to build large, complex applications as a collection of small, independent services.

## What are Microservices?

Microservices are an architectural style where an application is built as a collection of small, autonomous services. Each service runs in its own process and communicates via well-defined APIs.

## Benefits

- **Scalability**: Services can be scaled independently
- **Maintainability**: Easier to understand and modify individual services
- **Technology Diversity**: Different services can use different technologies
- **Fault Isolation**: Failure in one service doesn't bring down the entire system

## Implementation

Here's a basic example of a Node.js microservice:

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Service running on port 3000');
});
\`\`\`

## Docker Implementation

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Conclusion

Building scalable microservices requires careful planning and implementation. Keep services small and focused, use consistent patterns, and implement proper monitoring.`,
  category: "Backend Development",
  tags: "Node.js, Microservices, Docker, Architecture",
  coverImage: "https://images.unsplash.com/photo-1555066931-4365d3080a8e?w=800&h=400&fit=crop",
  status: "approved",
  publishedAt: new Date('2024-01-15'),
  slug: "building-scalable-microservices-nodejs-docker"
};

const categories = [
  "Frontend Development",
  "Backend Development",
  "Full Stack",
  "Mobile Development",
  "DevOps",
  "Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "Database",
  "Testing",
  "Architecture",
  "Performance",
  "Security",
  "Other"
];

const EditArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showPreview, setShowPreview] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');

  // Mock query - will be replaced with actual API call
  const { data: article = mockArticle, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => Promise.resolve(mockArticle),
  });

  // Update form values when article data loads
  useEffect(() => {
    if (article) {
      setValue('title', article.title);
      setValue('excerpt', article.excerpt);
      setValue('content', article.content);
      setValue('category', article.category);
      setValue('tags', article.tags);
      setCoverImagePreview(article.coverImage);
    }
  }, [article, setValue]);

  // Mock mutation - will be replaced with actual API call
  const updateArticleMutation = useMutation({
    mutationFn: async (data) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Article updated successfully!');
      queryClient.invalidateQueries(['article', slug]);
      navigate(`/article/${slug}`);
    },
    onError: (error) => {
      toast.error('Failed to update article. Please try again.');
      setError('root', { message: error.message });
    },
  });

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Cover image must be less than 5MB');
        return;
      }
      
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('excerpt', data.excerpt);
      formData.append('content', data.content);
      formData.append('category', data.category);
      formData.append('tags', data.tags);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      await updateArticleMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error updating article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const wordCount = watchedContent ? watchedContent.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if user owns the article or is admin
  if (article.author.id !== user?.id && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to edit this article.</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          </div>
          <p className="text-gray-600">
            Update your article content and settings. Changes will be reviewed by our team.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Article Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: {
                      value: 10,
                      message: 'Title must be at least 10 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Title must be less than 100 characters',
                    },
                  })}
                  className={`input-field ${errors.title ? 'input-error' : ''}`}
                  placeholder="Enter a compelling title for your article"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
                {watchedTitle && (
                  <p className="mt-2 text-sm text-gray-500">
                    Slug: {generateSlug(watchedTitle)}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div className="lg:col-span-2">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  id="excerpt"
                  rows={3}
                  {...register('excerpt', {
                    required: 'Excerpt is required',
                    minLength: {
                      value: 50,
                      message: 'Excerpt must be at least 50 characters',
                    },
                    maxLength: {
                      value: 300,
                      message: 'Excerpt must be less than 300 characters',
                    },
                  })}
                  className={`input-field ${errors.excerpt ? 'input-error' : ''}`}
                  placeholder="Write a brief summary of your article"
                />
                {errors.excerpt && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  {...register('category', {
                    required: 'Category is required',
                  })}
                  className={`input-field ${errors.category ? 'input-error' : ''}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    id="tags"
                    type="text"
                    {...register('tags')}
                    className="input-field pl-10"
                    placeholder="Enter tags separated by commas"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Separate tags with commas (e.g., React, JavaScript, Web Development)
                </p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Cover Image
            </h2>

            <div className="space-y-4">
              {coverImagePreview ? (
                <div className="relative">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Upload a cover image for your article
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Recommended size: 1200x630px, Max size: 5MB
                  </p>
                  <label htmlFor="cover-image" className="btn btn-outline cursor-pointer">
                    Choose Image
                    <input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {!coverImagePreview && (
                <div className="text-center">
                  <label htmlFor="cover-image-alt" className="btn btn-outline cursor-pointer">
                    Choose Image
                    <input
                      id="cover-image-alt"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Article Content</h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {wordCount} words • {readingTime} min read
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`btn ${showPreview ? 'btn-primary' : 'btn-outline'} flex items-center`}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Preview
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
              {/* Markdown Editor */}
              <div className={showPreview ? '' : 'w-full'}>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  rows={20}
                  {...register('content', {
                    required: 'Content is required',
                    minLength: {
                      value: 100,
                      message: 'Content must be at least 100 characters',
                    },
                  })}
                  className={`input-field font-mono text-sm ${errors.content ? 'input-error' : ''}`}
                  placeholder="Write your article content in Markdown format..."
                />
                {errors.content && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.content.message}
                  </p>
                )}

                {/* Markdown Help */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Markdown Tips:</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>**bold** for <strong>bold text</strong></p>
                    <p>*italic* for <em>italic text</em></p>
                    <p># Heading for headers</p>
                    <p>`code` for inline code</p>
                    <p>``` for code blocks</p>
                    <p>- item for bullet lists</p>
                    <p>[text](url) for links</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="border-l border-gray-200 pl-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Preview</h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {watchedContent || 'Start writing to see a preview...'}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Root Error */}
          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.root.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Article...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Article
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticlePage;
