import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Import models
import User from '../models/User.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@devnovate.com',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    bio: 'Platform administrator with full access to all features.',
    isVerified: true,
    isActive: true
  },
  {
    username: 'moderator',
    email: 'moderator@devnovate.com',
    password: 'Mod@123',
    firstName: 'Moderator',
    lastName: 'User',
    role: 'moderator',
    bio: 'Content moderator helping maintain quality standards.',
    isVerified: true,
    isActive: true
  },
  {
    username: 'john_doe',
    email: 'john@devnovate.com',
    password: 'User@123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    bio: 'Tech enthusiast and software developer.',
    isVerified: true,
    isActive: true
  },
  {
    username: 'jane_smith',
    email: 'jane@devnovate.com',
    password: 'User@123',
    firstName: 'Jane',
    lastName: 'Smith',
    bio: 'Designer and creative professional.',
    isVerified: true,
    isActive: true
  },
  {
    username: 'tech_writer',
    email: 'tech@devnovate.com',
    password: 'User@123',
    firstName: 'Tech',
    lastName: 'Writer',
    bio: 'Technology writer and content creator.',
    isVerified: true,
    isActive: true
  }
];

const sampleArticles = [
  {
    title: 'Getting Started with React: A Beginner\'s Guide',
    content: `# Getting Started with React: A Beginner's Guide

React is a powerful JavaScript library for building user interfaces. In this comprehensive guide, we'll explore the fundamentals of React and help you get started on your journey to becoming a React developer.

## What is React?

React is an open-source JavaScript library developed by Facebook (now Meta) for building user interfaces, particularly single-page applications. It's used for handling the view layer and can be used for developing both web and mobile applications.

## Key Concepts

### 1. Components
Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.

### 2. JSX
JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.

### 3. State and Props
State is used for data that can change over time, while props are used to pass data from parent to child components.

## Setting Up Your First React Project

1. Install Node.js
2. Create a new React project using Create React App
3. Start the development server
4. Begin building your components

## Best Practices

- Keep components small and focused
- Use meaningful names for components and props
- Follow the single responsibility principle
- Write clean, readable code

React is an excellent choice for modern web development, and with practice, you'll be building amazing applications in no time!`,
    category: 'Programming',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    excerpt: 'Learn the fundamentals of React and start building modern web applications with this comprehensive beginner\'s guide.',
    metaTitle: 'React Beginner Guide - Learn React Fundamentals',
    metaDescription: 'Master React basics with our comprehensive beginner\'s guide. Learn components, JSX, state, and props to build modern web applications.'
  },
  {
    title: 'The Future of Artificial Intelligence in 2024',
    content: `# The Future of Artificial Intelligence in 2024

Artificial Intelligence continues to evolve at an unprecedented pace, reshaping industries and transforming how we live and work. Let's explore the key trends and developments that will define AI in 2024.

## Current State of AI

AI has made significant strides in recent years, with breakthroughs in machine learning, natural language processing, and computer vision. These advancements have led to practical applications across various sectors.

## Key Trends for 2024

### 1. Generative AI
Generative AI models like GPT-4 and DALL-E have revolutionized content creation, enabling new forms of creativity and productivity.

### 2. AI in Healthcare
AI is transforming healthcare through improved diagnostics, drug discovery, and personalized medicine.

### 3. Autonomous Systems
Self-driving cars, drones, and robots are becoming more sophisticated and reliable.

### 4. AI Ethics and Governance
As AI becomes more powerful, discussions around ethics, bias, and regulation are gaining importance.

## Impact on Industries

- **Healthcare**: Improved diagnostics and treatment planning
- **Finance**: Better risk assessment and fraud detection
- **Education**: Personalized learning experiences
- **Manufacturing**: Increased efficiency and quality control

## Challenges and Considerations

While AI offers tremendous potential, it also presents challenges:
- Job displacement concerns
- Privacy and security issues
- Bias and fairness in AI systems
- Need for responsible AI development

The future of AI is bright, but it requires careful consideration of both opportunities and challenges.`,
    category: 'Technology',
    tags: ['AI', 'Machine Learning', 'Technology', 'Future'],
    excerpt: 'Explore the latest trends and developments in artificial intelligence that will shape the future in 2024 and beyond.',
    metaTitle: 'AI Future 2024 - Latest Trends and Developments',
    metaDescription: 'Discover the future of artificial intelligence in 2024. Explore key trends, industry impacts, and challenges in AI development.'
  },
  {
    title: 'Essential Design Principles for Modern Web Applications',
    content: `# Essential Design Principles for Modern Web Applications

Good design is crucial for creating web applications that users love to use. In this article, we'll explore the fundamental design principles that every developer and designer should understand.

## Core Design Principles

### 1. Visual Hierarchy
Establish a clear visual hierarchy to guide users through your interface. Use size, color, and spacing to create focal points.

### 2. Consistency
Maintain consistency in design elements, interactions, and terminology throughout your application.

### 3. Accessibility
Design for all users, including those with disabilities. Follow WCAG guidelines and test with assistive technologies.

### 4. Responsive Design
Ensure your application works seamlessly across all devices and screen sizes.

## User Experience Considerations

- **Simplicity**: Keep interfaces clean and uncluttered
- **Feedback**: Provide clear feedback for user actions
- **Error Handling**: Design intuitive error messages and recovery paths
- **Loading States**: Show appropriate loading indicators

## Modern Design Trends

- **Minimalism**: Clean, focused interfaces
- **Micro-interactions**: Subtle animations that enhance usability
- **Dark Mode**: Alternative color schemes for better user preference
- **Glassmorphism**: Modern visual effects using transparency and blur

## Tools and Resources

- Design systems and component libraries
- Prototyping tools like Figma and Sketch
- User testing and feedback platforms
- Accessibility testing tools

Great design is invisible to users but makes their experience seamless and enjoyable. Focus on these principles to create applications that users will love.`,
    category: 'Design',
    tags: ['Design', 'UX', 'UI', 'Web Design', 'User Experience'],
    excerpt: 'Master the essential design principles that will help you create modern, user-friendly web applications.',
    metaTitle: 'Web Design Principles - Essential Guidelines for Modern Apps',
    metaDescription: 'Learn essential design principles for modern web applications. Master visual hierarchy, consistency, accessibility, and responsive design.'
  },
  {
    title: 'Building Scalable Backend Systems with Node.js',
    content: `# Building Scalable Backend Systems with Node.js

Node.js has become a popular choice for building scalable backend systems. In this article, we'll explore best practices and patterns for creating robust, scalable applications.

## Why Node.js for Backend?

Node.js offers several advantages for backend development:
- **Event-driven architecture** for handling concurrent connections
- **JavaScript everywhere** for full-stack development
- **Rich ecosystem** with npm packages
- **High performance** for I/O-intensive applications

## Architecture Patterns

### 1. Microservices
Break your application into small, focused services that can be developed and deployed independently.

### 2. Event-Driven Architecture
Use events to decouple components and improve scalability.

### 3. CQRS (Command Query Responsibility Segregation)
Separate read and write operations for better performance and scalability.

## Performance Optimization

- **Caching**: Implement Redis or in-memory caching
- **Database optimization**: Use proper indexing and query optimization
- **Load balancing**: Distribute traffic across multiple instances
- **Monitoring**: Track performance metrics and bottlenecks

## Security Best Practices

- Input validation and sanitization
- Authentication and authorization
- Rate limiting and DDoS protection
- Secure communication with HTTPS
- Regular security updates

## Deployment and DevOps

- Containerization with Docker
- CI/CD pipelines
- Environment management
- Monitoring and logging
- Auto-scaling strategies

Building scalable backend systems requires careful planning and implementation of these patterns and practices.`,
    category: 'Programming',
    tags: ['Node.js', 'Backend', 'Scalability', 'Architecture', 'Performance'],
    excerpt: 'Learn how to build scalable backend systems using Node.js with proven architecture patterns and best practices.',
    metaTitle: 'Node.js Backend Scalability - Building Robust Systems',
    metaDescription: 'Master Node.js backend development with scalability patterns, performance optimization, and security best practices.'
  },
  {
    title: 'The Psychology of User Engagement in Digital Products',
    content: `# The Psychology of User Engagement in Digital Products

Understanding user psychology is crucial for creating engaging digital products. In this article, we'll explore the psychological principles that drive user engagement and how to apply them in your designs.

## Core Psychological Principles

### 1. Social Proof
Users are more likely to engage when they see others doing the same. Display testimonials, user counts, and social activity.

### 2. Reciprocity
When you provide value to users, they're more likely to give back. Offer free content, tools, or resources.

### 3. Scarcity
Limited availability creates urgency and increases perceived value. Use time-limited offers or exclusive content.

### 4. Authority
Users trust and engage more with authoritative sources. Showcase expertise and credentials.

## Engagement Triggers

- **Gamification**: Points, badges, and leaderboards
- **Personalization**: Tailored experiences based on user behavior
- **Progress indicators**: Show users their advancement
- **Social features**: Community and collaboration elements

## Behavioral Design Patterns

- **Habit formation**: Create routines and triggers
- **Variable rewards**: Unpredictable outcomes increase engagement
- **Ease of use**: Reduce friction and cognitive load
- **Emotional connection**: Appeal to users' emotions and values

## Measuring Engagement

- User retention rates
- Time spent in app
- Feature adoption rates
- Social sharing and referrals
- User feedback and satisfaction

Understanding user psychology helps create products that naturally encourage engagement and build lasting user relationships.`,
    category: 'Business',
    tags: ['Psychology', 'User Engagement', 'UX Design', 'Behavioral Design', 'Product Design'],
    excerpt: 'Discover the psychological principles that drive user engagement and learn how to apply them in your digital products.',
    metaTitle: 'User Engagement Psychology - Drive Digital Product Success',
    metaDescription: 'Master the psychology of user engagement in digital products. Learn social proof, reciprocity, scarcity, and authority principles.'
  }
];

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    console.log('🗑️ Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Create users
const createUsers = async () => {
  try {
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.username} (${user.role})`);
    }
    
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

// Create articles
const createArticles = async (users) => {
  try {
    const createdArticles = [];
    const adminUser = users.find(u => u.role === 'admin');
    const regularUsers = users.filter(u => u.role === 'user');
    
    for (let i = 0; i < sampleArticles.length; i++) {
      const articleData = sampleArticles[i];
      const author = regularUsers[i % regularUsers.length];
      
      const article = new Article({
        ...articleData,
        author: author._id,
        status: 'approved',
        isPublished: true,
        publishedAt: new Date(),
        approvedBy: adminUser._id,
        approvalDate: new Date()
      });
      
      await article.save();
      createdArticles.push(article);
      console.log(`📝 Created article: ${article.title}`);
    }
    
    return createdArticles;
  } catch (error) {
    console.error('❌ Error creating articles:', error);
    throw error;
  }
};

// Create sample comments
const createComments = async (users, articles) => {
  try {
    const createdComments = [];
    
    for (const article of articles) {
      // Create 2-4 comments per article
      const commentCount = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < commentCount; i++) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        
        const comment = new Comment({
          content: `Great article! This is comment ${i + 1} on "${article.title}". Very informative and well-written.`,
          author: commenter._id,
          article: article._id,
          status: 'approved'
        });
        
        await comment.save();
        createdComments.push(comment);
      }
      
      console.log(`💬 Created ${commentCount} comments for article: ${article.title}`);
    }
    
    return createdComments;
  } catch (error) {
    console.error('❌ Error creating comments:', error);
    throw error;
  }
};

// Create sample likes
const createLikes = async (users, articles) => {
  try {
    let likeCount = 0;
    
    for (const article of articles) {
      // Randomly like articles with 60-80% probability
      for (const user of users) {
        if (Math.random() < 0.7) {
          const like = new Like({
            user: user._id,
            targetType: 'article',
            target: article._id,
            type: 'like'
          });
          
          await like.save();
          likeCount++;
        }
      }
    }
    
    console.log(`❤️ Created ${likeCount} likes`);
    return likeCount;
  } catch (error) {
    console.error('❌ Error creating likes:', error);
    throw error;
  }
};

// Update article engagement counts
const updateEngagementCounts = async (articles) => {
  try {
    for (const article of articles) {
      await article.updateEngagementCounts();
    }
    console.log('📊 Updated article engagement counts');
  } catch (error) {
    console.error('❌ Error updating engagement counts:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearData();
    
    // Create users
    console.log('\n👥 Creating users...');
    const users = await createUsers();
    
    // Create articles
    console.log('\n📝 Creating articles...');
    const articles = await createArticles(users);
    
    // Create comments
    console.log('\n💬 Creating comments...');
    const comments = await createComments(users, articles);
    
    // Create likes
    console.log('\n❤️ Creating likes...');
    const likes = await createLikes(users, articles);
    
    // Update engagement counts
    console.log('\n📊 Updating engagement counts...');
    await updateEngagementCounts(articles);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📝 Articles: ${articles.length}`);
    console.log(`   💬 Comments: ${comments.length}`);
    console.log(`   ❤️ Likes: ${likes}`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('   Admin: admin@devnovate.com / Admin@123');
    console.log('   Moderator: moderator@devnovate.com / Mod@123');
    console.log('   User: john@devnovate.com / User@123');
    
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
