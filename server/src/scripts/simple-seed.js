import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config({ path: '../.env' });

console.log('🔍 Starting simple seed...');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Not loaded');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Create a simple user
const createUser = async () => {
  try {
    console.log('👤 Creating test user...');
    
    // Define a simple user schema
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: String,
      lastName: String,
      role: { type: String, default: 'user' },
      isVerified: { type: Boolean, default: true },
      isActive: { type: Boolean, default: true }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      return existingUser;
    }
    
    // Create new user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = new User({
      username: 'testuser',
      email: 'test@devnovate.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    });
    
    const savedUser = await user.save();
    console.log('✅ Test user created:', savedUser.username);
    return savedUser;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

// Create a simple article
const createArticle = async (user) => {
  try {
    console.log('📝 Creating test article...');
    
    // Define a simple article schema
    const articleSchema = new mongoose.Schema({
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      excerpt: String,
      content: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      category: String,
      tags: [String],
      status: { type: String, default: 'published' },
      isFeatured: { type: Boolean, default: false },
      isTrending: { type: Boolean, default: false },
      readingTime: Number,
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      publishedAt: { type: Date, default: Date.now }
    });
    
    const Article = mongoose.model('Article', articleSchema);
    
    // Check if article already exists
    const existingArticle = await Article.findOne({ slug: 'test-article' });
    if (existingArticle) {
      console.log('✅ Test article already exists');
      return existingArticle;
    }
    
    // Create new article
    const article = new Article({
      title: 'Test Article',
      slug: 'test-article',
      excerpt: 'This is a test article to verify the system is working.',
      content: '# Test Article\n\nThis is a test article content.',
      author: user._id,
      category: 'Testing',
      tags: ['test', 'demo'],
      status: 'published',
      isFeatured: true,
      isTrending: true,
      readingTime: 2,
      views: 100,
      likes: 25,
      comments: 5
    });
    
    const savedArticle = await article.save();
    console.log('✅ Test article created:', savedArticle.title);
    return savedArticle;
  } catch (error) {
    console.error('❌ Error creating article:', error);
    throw error;
  }
};

// Main function
const runSimpleSeed = async () => {
  try {
    console.log('🌱 Starting simple database seeding...');
    
    const connected = await connectDB();
    if (!connected) {
      console.log('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    const user = await createUser();
    const article = await createArticle(user);
    
    console.log('🎉 Simple seeding completed successfully!');
    console.log(`📊 Created 1 user and 1 article`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Simple seeding failed:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSimpleSeed();
}

export default runSimpleSeed;
