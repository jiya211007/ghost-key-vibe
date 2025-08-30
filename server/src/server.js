import app from './app.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

// Debug: Check if environment variables are loaded
console.log('🔍 Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Not loaded');
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '✅ Loaded' : '❌ Not loaded');
console.log('Current working directory:', process.cwd());
console.log('Env file path:', path.resolve('../.env'));

// Get port from environment or use default
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Import database connection function
import { connectDB } from './config/db.js';
import { verifyConnection as verifyEmailConnection } from './config/mailer.js';

// Connect to database first
connectDB()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    // Verify email connection if SMTP is configured
    if (process.env.SMTP_HOST) {
      verifyEmailConnection()
        .then(() => console.log('✅ Email service verified'))
        .catch(() => console.log('⚠️ Email service not available'));
    }
    
    // Start server after database connection
    startServer();
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

// Start server function
function startServer() {
  const server = app.listen(PORT, () => {
    console.log('🚀 Devnovate Blog Server Starting...');
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔗 Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`📊 Database: MongoDB Atlas`);
    console.log(`📧 Email Service: ${process.env.SMTP_HOST ? 'Configured' : 'Not configured'}`);
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log('🎉 Ready to serve!');
  });
  
  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('✅ Server closed successfully');
      console.log('🔄 Shutting down gracefully...');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Handle different shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });

  // Handle process warnings
  process.on('warning', (warning) => {
    console.warn('⚠️ Process Warning:', warning.name, warning.message);
    console.warn('⚠️ Stack:', warning.stack);
  });
}

// Export server for testing
export default app;
