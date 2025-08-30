import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import slugify from 'slugify';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devnovate');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample users data with diverse profiles
const sampleUsers = [
  {
    username: 'tech_guru_sarah',
    email: 'sarah@techguru.com',
    password: 'TechGuru123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    bio: 'Full-stack developer with 8+ years experience. Passionate about React, Node.js, and cloud architecture. Always learning, always sharing.',
    role: 'user',
    isVerified: true
  },
  {
    username: 'ai_researcher_alex',
    email: 'alex@airesearch.com',
    password: 'AIResearch123!',
    firstName: 'Alex',
    lastName: 'Chen',
    bio: 'AI/ML researcher and data scientist. PhD in Computer Science. Love exploring the intersection of AI and real-world applications.',
    role: 'user',
    isVerified: true
  },
  {
    username: 'design_maven_emma',
    email: 'emma@designmaven.com',
    password: 'DesignMaven123!',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    bio: 'UX/UI designer with a passion for creating beautiful, accessible, and user-centered digital experiences.',
    role: 'user',
    isVerified: true
  },
  {
    username: 'devops_master_mike',
    email: 'mike@devopsmaster.com',
    password: 'DevOps123!',
    firstName: 'Mike',
    lastName: 'Thompson',
    bio: 'DevOps engineer specializing in Kubernetes, Docker, and CI/CD pipelines. Building scalable infrastructure since 2015.',
    role: 'user',
    isVerified: true
  },
  {
    username: 'startup_founder_lisa',
    email: 'lisa@startup.com',
    password: 'Startup123!',
    firstName: 'Lisa',
    lastName: 'Wang',
    bio: 'Serial entrepreneur and startup advisor. Founded 3 successful tech companies. Helping others navigate the startup journey.',
    role: 'user',
    isVerified: true
  },
  {
    username: 'admin_demo',
    email: 'admin@devnovate.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    bio: 'Platform administrator ensuring quality content and smooth operations for the Devnovate community.',
    role: 'admin',
    isVerified: true
  },
  {
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'admin',
    firstName: 'Platform',
    lastName: 'Administrator',
    bio: 'Platform administrator with full access to manage content, users, and system settings.',
    role: 'admin',
    isVerified: true
  },
  {
    username: 'codmking2212',
    email: 'codmking2212@gmail.com',
    password: 'Kingo2212@',
    firstName: 'User',
    lastName: 'Account',
    bio: 'Active platform user exploring the latest in technology and development.',
    role: 'user',
    isVerified: true
  }
];

// Comprehensive articles with modern topics and realistic content
const sampleArticles = [
  {
    title: 'Building Scalable React Applications with TypeScript and Vite',
    excerpt: 'Learn how to set up a modern React development environment with TypeScript, Vite, and best practices for scalable architecture.',
    content: `# Building Scalable React Applications with TypeScript and Vite

As React applications grow in complexity, maintaining code quality and developer experience becomes crucial. In this comprehensive guide, we'll explore how to build scalable React applications using TypeScript and Vite.

## Why TypeScript + Vite?

TypeScript provides static type checking that catches errors at compile time, while Vite offers lightning-fast development with hot module replacement. Together, they create a powerful development environment.

## Setting Up the Project

First, let's create a new Vite project with TypeScript:

\`\`\`bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
\`\`\`

## Project Structure

A well-organized project structure is essential for scalability:

\`\`\`
src/
├── components/
│   ├── ui/
│   └── features/
├── hooks/
├── utils/
├── types/
├── stores/
└── pages/
\`\`\`

## Component Architecture

Use compound components and composition patterns for flexible, reusable components:

\`\`\`typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => {
  return (
    <div className={\`card \${className || ''}\`}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
\`\`\`

## State Management

For complex state, consider Zustand or Redux Toolkit:

\`\`\`typescript
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
\`\`\`

## Performance Optimization

Implement code splitting and lazy loading:

\`\`\`typescript
const HomePage = lazy(() => import('./pages/HomePage'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
\`\`\`

## Testing Strategy

Set up comprehensive testing with Vitest and Testing Library:

\`\`\`typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
\`\`\`

## Conclusion

Building scalable React applications requires careful planning and the right tools. TypeScript and Vite provide an excellent foundation for modern React development.

Happy coding! 🚀`,
    category: 'Programming',
    tags: ['React', 'TypeScript', 'Vite', 'JavaScript', 'Frontend'],
    authorUsername: 'tech_guru_sarah',
    status: 'approved',
    featured: true,
    views: 1247,
    likes: 89,
    comments: 12
  },
  {
    title: 'The Future of Artificial Intelligence in Healthcare',
    excerpt: 'Exploring how AI is revolutionizing healthcare from diagnosis to treatment, and what the future holds for medical technology.',
    content: `# The Future of Artificial Intelligence in Healthcare

Artificial Intelligence is transforming healthcare at an unprecedented pace. From diagnostic imaging to personalized treatment plans, AI is revolutionizing how we approach medical care.

## Current Applications

### Medical Imaging
AI-powered diagnostic tools are now capable of detecting cancers, fractures, and other conditions with accuracy that often exceeds human specialists.

### Drug Discovery
Machine learning algorithms are accelerating drug discovery processes, reducing development time from decades to years.

### Personalized Medicine
AI analyzes genetic data, lifestyle factors, and medical history to create personalized treatment plans.

## Challenges and Considerations

### Data Privacy
Healthcare data is sensitive, requiring robust security measures and ethical considerations.

### Regulatory Approval
AI medical devices must pass rigorous testing and regulatory approval processes.

### Integration with Existing Systems
Healthcare institutions must adapt their infrastructure to incorporate AI tools effectively.

## The Road Ahead

The next decade will see AI become increasingly integrated into healthcare workflows, improving patient outcomes and reducing costs.

## Conclusion

AI in healthcare represents one of the most promising applications of artificial intelligence, with the potential to save millions of lives and improve quality of care worldwide.`,
    category: 'Technology',
    tags: ['AI', 'Healthcare', 'Machine Learning', 'Medicine', 'Future Tech'],
    authorUsername: 'ai_researcher_alex',
    status: 'approved',
    featured: true,
    views: 2156,
    likes: 145,
    comments: 23
  },
  {
    title: 'Design Systems: Building Consistent User Experiences',
    excerpt: 'A comprehensive guide to creating and maintaining design systems that scale across products and teams.',
    content: `# Design Systems: Building Consistent User Experiences

Design systems are the backbone of scalable, consistent user interfaces. They ensure that every touchpoint with your product feels cohesive and intentional.

## What is a Design System?

A design system is a collection of reusable components, guided by clear standards, that can be assembled to build applications consistently and efficiently.

## Key Components

### Design Tokens
Design tokens are the visual design atoms of the design system:
- Colors
- Typography
- Spacing
- Border radius
- Shadows

### Component Library
Reusable UI components with defined variants and states:
- Buttons
- Forms
- Navigation
- Cards
- Modals

### Documentation
Clear guidelines on when and how to use each component.

## Implementation Strategy

### 1. Audit Existing Designs
Catalog all existing UI patterns and identify inconsistencies.

### 2. Define Design Principles
Establish the core principles that will guide design decisions.

### 3. Create Core Components
Start with the most commonly used components.

### 4. Document Everything
Comprehensive documentation ensures proper adoption.

### 5. Govern and Evolve
Establish processes for maintaining and evolving the system.

## Tools and Technologies

### Figma
For designing and prototyping components.

### Storybook
For documenting and testing components in isolation.

### Design Tokens
Use tools like Style Dictionary to manage design tokens.

## Benefits

- **Consistency**: Unified experience across products
- **Efficiency**: Faster development and design
- **Scalability**: Easy to maintain as teams grow
- **Quality**: Fewer bugs and design inconsistencies

## Common Pitfalls

- Not getting buy-in from stakeholders
- Over-engineering early components
- Poor documentation
- Lack of governance

## Conclusion

A well-implemented design system is an investment that pays dividends in consistency, efficiency, and user experience quality.`,
    category: 'Design',
    tags: ['Design Systems', 'UX', 'UI', 'Frontend', 'Component Library'],
    authorUsername: 'design_maven_emma',
    status: 'approved',
    views: 892,
    likes: 67,
    comments: 8
  },
  {
    title: 'Kubernetes in Production: Lessons Learned',
    excerpt: 'Real-world insights from running Kubernetes clusters in production environments, including common pitfalls and best practices.',
    content: `# Kubernetes in Production: Lessons Learned

After managing Kubernetes clusters in production for over 5 years, I've learned valuable lessons that can help others avoid common pitfalls.

## The Journey Begins

When we first adopted Kubernetes, we were excited about the promise of container orchestration and scalability. However, the learning curve was steep.

## Key Lessons

### 1. Start Simple
Don't try to implement every Kubernetes feature from day one. Begin with basic deployments and services.

### 2. Monitoring is Critical
Implement comprehensive monitoring before you go to production:
- Cluster health
- Application metrics
- Resource utilization
- Error rates

### 3. Resource Management
Always set resource requests and limits:

\`\`\`yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
\`\`\`

### 4. Security Hardening
- Use Pod Security Standards
- Implement Network Policies
- Regular security updates
- RBAC configuration

### 5. Backup Strategy
Have a solid backup and disaster recovery plan:
- ETCD backups
- Persistent volume backups
- Configuration backups

## Common Pitfalls

### Over-Engineering
Starting with complex service mesh implementations before understanding basic Kubernetes concepts.

### Ignoring Resource Limits
Not setting resource limits leads to noisy neighbor problems and cluster instability.

### Poor Networking Design
Not planning network architecture leads to security and performance issues.

## Tools That Help

### ArgoCD
For GitOps-based deployments

### Prometheus + Grafana
For monitoring and alerting

### Velero
For backup and restore operations

### Istio/Linkerd
For service mesh (when you're ready)

## Performance Optimization

### Node Management
- Use appropriate instance types
- Implement cluster autoscaling
- Regular node maintenance

### Pod Optimization
- Right-size your containers
- Use horizontal pod autoscaling
- Implement pod disruption budgets

## Conclusion

Kubernetes is powerful but complex. Start simple, learn incrementally, and always prioritize observability and security.

The journey is challenging, but the benefits of a well-managed Kubernetes environment are worth the investment.`,
    category: 'Technology',
    tags: ['Kubernetes', 'DevOps', 'Container', 'Production', 'Infrastructure'],
    authorUsername: 'devops_master_mike',
    status: 'approved',
    views: 1834,
    likes: 98,
    comments: 15
  },
  {
    title: 'From Idea to IPO: Building a Successful Tech Startup',
    excerpt: 'A founder\'s journey through the startup ecosystem, sharing insights on fundraising, team building, and scaling challenges.',
    content: `# From Idea to IPO: Building a Successful Tech Startup

Building a successful tech startup is one of the most challenging yet rewarding experiences an entrepreneur can have. Here's what I learned from my journey.

## The Beginning: Idea Validation

### Problem-First Approach
Every successful startup solves a real problem. We spent months talking to potential customers before writing a single line of code.

### MVP Development
Our first product was intentionally simple:
- Core functionality only
- Built in 3 months
- Cost under $50,000

### Early Feedback Loop
Customer feedback shaped every feature decision:
- Weekly user interviews
- Analytics-driven development
- Rapid iteration cycles

## Finding Product-Market Fit

### Metrics That Matter
- Customer retention rates
- Net Promoter Score (NPS)
- Customer acquisition cost vs. lifetime value

### Pivot When Necessary
We pivoted twice before finding our winning formula. Don't be afraid to change direction based on data.

## Building the Team

### Early Hiring
Your first 10 employees define your company culture:
- Hire for attitude and cultural fit
- Look for generalists early on
- Invest in people who believe in the mission

### Leadership Development
As a founder, your role constantly evolves:
- CEO skills are learnable
- Delegate early and often
- Build systems and processes

## Fundraising Journey

### Seed Round ($2M)
- Focused on product development
- 18-month runway
- Angels and early-stage VCs

### Series A ($15M)
- Proven product-market fit
- Clear growth metrics
- Tier 1 VC partnership

### Series B & Beyond
- International expansion
- Market leadership position
- Scaling challenges

## Scaling Challenges

### Technical Debt
Growing fast means making tradeoffs:
- Allocate time for refactoring
- Invest in automation early
- Monitor technical metrics

### Company Culture
Maintaining culture while growing:
- Document values and practices
- Regular culture assessments
- Intentional hiring decisions

### Market Competition
As you grow, competition intensifies:
- Focus on differentiation
- Build economic moats
- Customer success is key

## Lessons Learned

### 1. Cash is King
Always have 12-18 months of runway. Fundraising takes longer than expected.

### 2. Customer Success Drives Growth
Happy customers are your best sales team. Invest heavily in customer success.

### 3. Build for Scale Early
Technical and organizational decisions made early have long-term consequences.

### 4. Mental Health Matters
The founder journey is emotionally challenging. Build support systems.

### 5. Mission Clarity
A clear mission helps with hiring, fundraising, and decision-making.

## The IPO Journey

Going public was the culmination of 8 years of work:
- Extensive preparation (18 months)
- Regulatory compliance
- Public market readiness

## Advice for New Founders

1. **Start with the problem, not the solution**
2. **Talk to customers constantly**
3. **Build a strong network early**
4. **Learn from failures quickly**
5. **Take care of your health**

## Conclusion

Building a successful startup requires persistence, adaptability, and a bit of luck. Focus on solving real problems, building great teams, and serving customers well.

The journey is difficult, but the impact you can have makes it all worthwhile.`,
    category: 'Business',
    tags: ['Startup', 'Entrepreneurship', 'Fundraising', 'IPO', 'Leadership'],
    authorUsername: 'startup_founder_lisa',
    status: 'approved',
    featured: true,
    views: 3245,
    likes: 187,
    comments: 34
  }
];

// Additional trending articles for variety
const trendingArticles = [
  {
    title: 'Next.js 14: What\'s New and Why You Should Care',
    excerpt: 'Exploring the latest features in Next.js 14, including improved performance, new routing capabilities, and developer experience enhancements.',
    content: `# Next.js 14: What's New and Why You Should Care

Next.js 14 brings significant improvements to performance, developer experience, and new features that make React development even more enjoyable.

## Key Features

### App Router Improvements
The App Router is now stable and includes:
- Improved caching strategies
- Better error handling
- Enhanced nested layouts

### Server Actions
Server actions allow you to run server-side code directly from your components:

\`\`\`typescript
async function createPost(formData: FormData) {
  'use server'
  
  const title = formData.get('title')
  const content = formData.get('content')
  
  await db.post.create({
    data: { title, content }
  })
}
\`\`\`

### Turbopack (Alpha)
Turbopack offers significant build performance improvements:
- 20x faster than Webpack
- Better development experience
- Incremental bundling

## Migration Guide

Upgrading to Next.js 14 is straightforward for most applications. Here's what you need to know...

## Performance Benchmarks

Our tests show significant improvements in:
- Build times: 40% faster
- Hot reload: 60% faster
- Bundle size: 15% smaller

## Conclusion

Next.js 14 represents a major step forward for React development. The improvements to performance and developer experience make it a compelling upgrade.`,
    category: 'Programming',
    tags: ['Next.js', 'React', 'JavaScript', 'Web Development', 'Performance'],
    authorUsername: 'tech_guru_sarah',
    status: 'approved',
    views: 1876,
    likes: 123,
    comments: 18
  },
  {
    title: 'Machine Learning in Edge Computing: Bringing AI to IoT Devices',
    excerpt: 'How edge computing is enabling machine learning on resource-constrained devices, opening new possibilities for IoT applications.',
    content: `# Machine Learning in Edge Computing: Bringing AI to IoT Devices

Edge computing is revolutionizing how we deploy machine learning models, bringing intelligence directly to IoT devices and enabling real-time decision-making.

## The Edge Computing Revolution

Traditional cloud-based ML requires constant connectivity and introduces latency. Edge computing solves these challenges by processing data locally.

## Key Benefits

### Reduced Latency
- Real-time processing
- No network delays
- Better user experience

### Privacy and Security
- Data stays on device
- Reduced attack surface
- Compliance with regulations

### Cost Efficiency
- Reduced bandwidth usage
- Lower cloud computing costs
- Offline capability

## Technical Challenges

### Resource Constraints
IoT devices have limited:
- Processing power
- Memory
- Storage
- Battery life

### Model Optimization Techniques

#### Quantization
Reducing model precision from 32-bit to 8-bit or even lower:

\`\`\`python
import tensorflow as tf

# Convert to TensorFlow Lite with quantization
converter = tf.lite.TFLiteConverter.from_saved_model(model_path)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()
\`\`\`

#### Pruning
Removing unnecessary weights and connections:

\`\`\`python
import tensorflow_model_optimization as tfmot

# Apply magnitude-based pruning
prune_low_magnitude = tfmot.sparsity.keras.prune_low_magnitude
pruned_model = prune_low_magnitude(model)
\`\`\`

#### Knowledge Distillation
Training smaller models to mimic larger ones.

## Real-World Applications

### Smart Security Cameras
- Real-time person detection
- Privacy-preserving analytics
- Reduced cloud storage costs

### Industrial IoT
- Predictive maintenance
- Quality control
- Safety monitoring

### Healthcare Devices
- Continuous health monitoring
- Emergency detection
- Patient privacy protection

## Tools and Frameworks

### TensorFlow Lite
Google's solution for mobile and embedded devices.

### ONNX Runtime
Microsoft's cross-platform inference engine.

### Core ML
Apple's framework for iOS devices.

### Edge Impulse
End-to-end platform for edge ML development.

## Implementation Strategy

### 1. Model Selection
Choose models designed for edge deployment:
- MobileNet for computer vision
- DistilBERT for NLP
- Efficient architectures

### 2. Optimization Pipeline
- Train full model
- Apply optimization techniques
- Test on target hardware
- Iterate based on performance

### 3. Deployment Considerations
- Over-the-air updates
- Fallback mechanisms
- Performance monitoring

## Future Trends

### Federated Learning
Training models across distributed devices while preserving privacy.

### Specialized Hardware
- Neural Processing Units (NPUs)
- AI accelerators
- Custom silicon

### 5G Integration
Enhanced connectivity enabling new edge computing scenarios.

## Conclusion

Edge computing is democratizing AI by making machine learning accessible on resource-constrained devices. As hardware improves and optimization techniques advance, we'll see even more innovative applications.

The future of AI is distributed, and edge computing is leading the way.`,
    category: 'Technology',
    tags: ['Machine Learning', 'Edge Computing', 'IoT', 'AI', 'Embedded Systems'],
    authorUsername: 'ai_researcher_alex',
    status: 'approved',
    views: 1432,
    likes: 89,
    comments: 11
  }
];

// Combine all articles
const allArticles = [...sampleArticles, ...trendingArticles];

// Sample comments data
const sampleComments = [
  {
    content: 'Great article! The TypeScript setup section was particularly helpful. I\'ve been struggling with Vite configuration.',
    authorUsername: 'devops_master_mike'
  },
  {
    content: 'This is exactly what I needed for my current project. The component architecture patterns are solid.',
    authorUsername: 'design_maven_emma'
  },
  {
    content: 'AI in healthcare is fascinating. The potential for early disease detection could save millions of lives.',
    authorUsername: 'tech_guru_sarah'
  },
  {
    content: 'Having worked in healthcare tech, I can confirm these trends are real and accelerating.',
    authorUsername: 'startup_founder_lisa'
  },
  {
    content: 'Design systems have transformed how our team works. The consistency improvements are immediately visible.',
    authorUsername: 'ai_researcher_alex'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date within last year
      });
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }

    // Create a user lookup map
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.username] = user._id;
    });

    // Create articles
    const createdArticles = [];
    for (const articleData of allArticles) {
      const authorId = userMap[articleData.authorUsername];
      if (!authorId) {
        console.log(`❌ Author not found: ${articleData.authorUsername}`);
        continue;
      }

      const slug = slugify(articleData.title, { lower: true, strict: true });
      const wordCount = articleData.content.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      // Random creation date within last 3 months
      const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      
      const article = new Article({
        title: articleData.title,
        slug,
        excerpt: articleData.excerpt,
        content: articleData.content,
        author: authorId,
        category: articleData.category,
        tags: articleData.tags,
        status: articleData.status,
        featured: articleData.featured || false,
        views: articleData.views + Math.floor(Math.random() * 100), // Add some randomness
        wordCount,
        readingTime,
        createdAt,
        updatedAt: createdAt,
        publishedAt: articleData.status === 'approved' ? createdAt : null,
        isPublished: articleData.status === 'approved',
      });

      await article.save();
      await article.populate('author', 'username firstName lastName');
      createdArticles.push(article);
      console.log(`✅ Created article: ${article.title}`);
    }

    // Create comments
    const createdComments = [];
    for (const article of createdArticles) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments per article
      
      for (let i = 0; i < numComments; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomCommentData = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        const comment = new Comment({
          content: randomCommentData.content,
          author: randomUser._id,
          article: article._id,
          createdAt: new Date(article.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // After article creation
        });

        await comment.save();
        createdComments.push(comment);
      }
    }

    console.log(`✅ Created ${createdComments.length} comments`);

    // Create likes
    const createdLikes = [];
    for (const article of createdArticles) {
      const numLikes = Math.floor(Math.random() * createdUsers.length * 0.7); // Random likes
      const shuffledUsers = [...createdUsers].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numLikes; i++) {
        const like = new Like({
          user: shuffledUsers[i]._id,
          targetType: 'article',
          target: article._id,
          createdAt: new Date(article.createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        });

        await like.save();
        createdLikes.push(like);
      }
    }

    console.log(`✅ Created ${createdLikes.length} likes`);

    // Update article stats
    for (const article of createdArticles) {
      const likes = await Like.countDocuments({ targetType: 'article', target: article._id });
      const comments = await Comment.countDocuments({ article: article._id });
      
      await Article.findByIdAndUpdate(article._id, {
        likesCount: likes,
        commentsCount: comments,
      });
    }

    console.log('✅ Updated article statistics');

    console.log(`
🎉 Database seeding completed successfully!

📊 Summary:
   👥 Users: ${createdUsers.length}
   📝 Articles: ${createdArticles.length}
   💬 Comments: ${createdComments.length}
   ❤️  Likes: ${createdLikes.length}

🚀 Your Devnovate platform is now ready for presentation!

📧 Login Credentials:
   Main Admin: admin@gmail.com / admin
   Demo Admin: admin@devnovate.com / Admin123!
   Your Account: codmking2212@gmail.com / Kingo2212@
   Demo User: sarah@techguru.com / TechGuru123!
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding script
if (process.env.NODE_ENV !== 'production') {
  await connectDB();
  await seedDatabase();
} else {
  console.log('❌ Seeding is not allowed in production environment');
}
