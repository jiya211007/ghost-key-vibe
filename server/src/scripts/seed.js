import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Article from '../models/Article.js';

// Load environment variables
dotenv.config({ path: '../.env' });

// Sample users data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@devnovate.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    bio: 'Platform administrator and tech enthusiast',
    avatar: null,
    isVerified: true,
    isActive: true
  },
  {
    username: 'sarahchen',
    email: 'sarah@devnovate.com',
    password: 'Password123!',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'user',
    bio: 'Full-stack developer passionate about microservices and cloud architecture',
    avatar: null,
    isVerified: true,
    isActive: true
  },
  {
    username: 'alexrodriguez',
    email: 'alex@devnovate.com',
    password: 'Password123!',
    firstName: 'Alex',
    lastName: 'Rodriguez',
    role: 'user',
    bio: 'Frontend specialist focused on React and modern web technologies',
    avatar: null,
    isVerified: true,
    isActive: true
  },
  {
    username: 'emilywatson',
    email: 'emily@devnovate.com',
    password: 'Password123!',
    firstName: 'Emily',
    lastName: 'Watson',
    role: 'user',
    bio: 'Machine learning engineer and data science enthusiast',
    avatar: null,
    isVerified: true,
    isActive: true
  }
];

// Sample articles data
const sampleArticles = [
  {
    title: "Building Scalable Microservices with Node.js and Docker",
    slug: "building-scalable-microservices-nodejs-docker",
    excerpt: "Learn how to design and implement microservices architecture using Node.js, Docker, and best practices for production deployment.",
    content: `# Building Scalable Microservices with Node.js and Docker

Microservices architecture has become the go-to approach for building scalable, maintainable applications. In this comprehensive guide, we'll explore how to implement microservices using Node.js and Docker.

## What are Microservices?

Microservices are small, independent services that communicate with each other through well-defined APIs. Each service is responsible for a specific business capability and can be developed, deployed, and scaled independently.

## Benefits of Microservices

- **Scalability**: Scale individual services based on demand
- **Maintainability**: Easier to maintain and update individual services
- **Technology Diversity**: Use different technologies for different services
- **Fault Isolation**: Failure in one service doesn't bring down the entire system

## Implementation with Node.js

Node.js is an excellent choice for microservices due to its:
- Event-driven, non-blocking I/O
- Rich ecosystem of packages
- Fast development cycle
- Excellent performance for I/O-intensive operations

## Docker Integration

Docker provides containerization that ensures consistency across different environments and makes deployment easier.

## Conclusion

Microservices with Node.js and Docker provide a robust foundation for building scalable applications. The key is to start small and gradually decompose your monolithic application.`,
    author: null, // Will be set to actual user ID
    category: "Backend Development",
    tags: ["Node.js", "Microservices", "Docker", "Architecture"],
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d3080a8e?w=800&h=400&fit=crop",
    status: "published",
    isFeatured: true,
    isTrending: true,
    readingTime: 8,
    views: 12450,
    likes: 342,
    comments: 89,
    publishedAt: new Date('2024-01-15')
  },
  {
    title: "The Future of Frontend: React Server Components Deep Dive",
    slug: "react-server-components-deep-dive",
    excerpt: "Explore React Server Components and understand how they're revolutionizing the way we build modern web applications.",
    content: `# The Future of Frontend: React Server Components Deep Dive

React Server Components represent a paradigm shift in how we think about React applications. This revolutionary feature allows us to render components on the server while maintaining the interactive capabilities of client-side React.

## What are Server Components?

Server Components are React components that run on the server and can access server-side resources like databases, file systems, and APIs. They're rendered to HTML on the server and sent to the client, reducing the JavaScript bundle size.

## Key Benefits

- **Reduced Bundle Size**: Less JavaScript sent to the client
- **Better Performance**: Faster initial page loads
- **Server-Side Data Fetching**: Direct access to backend resources
- **SEO Friendly**: Better search engine optimization

## Implementation

Server Components work seamlessly with existing React patterns and can be mixed with Client Components for optimal performance.

## Conclusion

React Server Components are the future of React development, offering better performance and developer experience.`,
    author: null, // Will be set to actual user ID
    category: "Frontend Development",
    tags: ["React", "Server Components", "Next.js", "Performance"],
    coverImage: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop",
    status: "published",
    isFeatured: true,
    isTrending: true,
    readingTime: 12,
    views: 18920,
    likes: 567,
    comments: 156,
    publishedAt: new Date('2024-01-12')
  },
  {
    title: "Machine Learning in Production: From Model to API",
    slug: "machine-learning-production-model-api",
    excerpt: "A comprehensive guide to deploying machine learning models in production environments with proper monitoring and scaling.",
    content: `# Machine Learning in Production: From Model to API

Deploying machine learning models to production is a complex process that requires careful consideration of infrastructure, monitoring, and scalability. This guide covers the essential aspects of ML model deployment.

## Production Challenges

- **Model Versioning**: Managing different versions of models
- **Monitoring**: Tracking model performance and drift
- **Scaling**: Handling increased load and traffic
- **Security**: Protecting sensitive data and models

## Best Practices

- Use containerization for consistent deployments
- Implement proper logging and monitoring
- Set up automated retraining pipelines
- Monitor model performance metrics

## Conclusion

Successful ML model deployment requires a combination of technical expertise and operational best practices.`,
    author: null, // Will be set to actual user ID
    category: "Machine Learning",
    tags: ["ML", "Production", "API", "Monitoring"],
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    status: "published",
    isFeatured: true,
    isTrending: true,
    readingTime: 15,
    views: 9876,
    likes: 234,
    comments: 67,
    publishedAt: new Date('2024-01-10')
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      users.push(await user.save());
    }
    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Seed articles
const seedArticles = async (users) => {
  try {
    // Clear existing articles
    await Article.deleteMany({});
    console.log('🗑️ Cleared existing articles');

    const articles = [];
    for (let i = 0; i < sampleArticles.length; i++) {
      const articleData = sampleArticles[i];
      const user = users[i + 1]; // Skip admin user for articles
      
      const article = new Article({
        ...articleData,
        author: user._id
      });
      articles.push(await article.save());
    }
    console.log(`✅ Created ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    const users = await seedUsers();
    const articles = await seedArticles(users);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${users.length} users and ${articles.length} articles`);
    
    // Display created data
    console.log('\n👥 Users created:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Role: ${user.role}`);
    });
    
    console.log('\n📝 Articles created:');
    articles.forEach(article => {
      console.log(`  - ${article.title} by ${article.author}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
