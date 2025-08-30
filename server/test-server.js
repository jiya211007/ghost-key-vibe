import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { verifyConnection } from './src/config/mailer.js';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

console.log('Testing server configuration...');

try {
  // Test database connection
  console.log('Testing database connection...');
  await connectDB();
  console.log('✅ Database connection successful');
  
  // Test email connection
  console.log('Testing email connection...');
  await verifyConnection();
  console.log('✅ Email connection successful');
  
  console.log('✅ All tests passed! Server is ready to start.');
  process.exit(0);
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
