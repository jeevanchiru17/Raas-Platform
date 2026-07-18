import * as dotenv from 'dotenv';
dotenv.config();

import createServer from './app';
import { initSockets } from './sockets/socketManager';
import { connectDB } from './config/mongo';
import { db } from './config/firebase';
import { pubsub } from './config/pubsub';

const start = async () => {
  const app = createServer();
  
  // Initialize underlying http server before mounting socket.io
  await app.ready();

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const io = initSockets(app.server, corsOrigin);

  await connectDB();

  const PORT = parseInt(process.env.PORT || '5001', 10);
  
  app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`\n🚀 RaaS Fastify Backend running on port ${PORT}`);
    console.log(`📊 GCP Project: ${process.env.GOOGLE_CLOUD_PROJECT || 'Not configured'}`);
    console.log(`🤖 ROS Bridge: ${process.env.ROSBRIDGE_URL || 'ws://localhost:9090'}\n`);
  });
};

start();

export { db, pubsub };
