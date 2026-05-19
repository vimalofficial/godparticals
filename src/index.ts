import app from './app';
import config from './config';
import prisma from './config/database';

import { verifyMailConnection } from './library/mail';

const startServer = async () => {
  try {
    // ================================
    // DATABASE CONNECTION
    // ================================
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // ================================
    // START SERVER FIRST
    // ================================
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health check ready`);
    });

    // ================================
    // VERIFY MAIL CONNECTION
    // DO NOT BLOCK SERVER STARTUP
    // ================================
    verifyMailConnection()
      .then((mailStatus) => {
        if (!mailStatus) {
          console.log('❌ SMTP connection failed');
        } else {
          console.log('✅ SMTP connected successfully');
        }
      })
      .catch((error) => {
        console.error('❌ SMTP verification error:', error);
      });

    // ================================
    // HANDLE SERVER ERRORS
    // ================================
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

// ===================================
// GRACEFUL SHUTDOWN
// ===================================

const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');

  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
  }

  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ===================================
// START APPLICATION
// ===================================

startServer();