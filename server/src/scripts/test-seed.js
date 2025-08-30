import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

console.log('🔍 Testing database connection...');
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

// Test basic operations
const testOperations = async () => {
  try {
    console.log('🧪 Testing basic operations...');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ name: String, value: Number });
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = new TestModel({ name: 'test', value: 42 });
    await testDoc.save();
    console.log('✅ Document created successfully');
    
    // Test reading
    const found = await TestModel.findOne({ name: 'test' });
    console.log('✅ Document read successfully:', found);
    
    // Clean up
    await TestModel.deleteMany({});
    console.log('✅ Cleanup completed');
    
    return true;
  } catch (error) {
    console.error('❌ Test operations failed:', error);
    return false;
  }
};

// Main test function
const runTests = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.log('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    const operationsOk = await testOperations();
    if (operationsOk) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Some tests failed');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
};

// Run tests
runTests();
