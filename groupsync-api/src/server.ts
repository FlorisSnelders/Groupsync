import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { testConnection } from './config/database';
import { setupChatSocket } from './services/chat.service';

async function bootstrap() {
  // Test DB connection before starting
  await testConnection();

  const httpServer = http.createServer(app);

  // Socket.io for real-time chat
  const io = new SocketServer(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });
  setupChatSocket(io);

  httpServer.listen(config.port, () => {
    console.log(`🚀 GroupSync API running on port ${config.port}`);
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Health check: http://localhost:${config.port}/health`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
