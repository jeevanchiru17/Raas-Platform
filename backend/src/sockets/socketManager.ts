import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: Server | null = null;

export function initSockets(server: HTTPServer, corsOrigin: string): Server {
  io = new Server(server, {
    cors: {
      origin: corsOrigin || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('subscribe:robot', (robotId: string) => {
      socket.join(`robot:${robotId}`);
      console.log(`Client subscribed to robot:${robotId}`);
    });

    socket.on('command:robot', async (data: { robotId: string; command: string; params?: any }) => {
      const { robotId, command, params } = data;
      if (io) {
        io.to(`robot:${robotId}`).emit('command', { command, params });
      }
    });
  });

  // Simulate telemetry for demo
  setInterval(() => {
    if (io) {
      io.emit('robot:telemetry', {
        robotId: 'mock-1',
        battery: Math.floor(Math.random() * 100),
        location: { x: Math.random() * 100, y: Math.random() * 100 },
        status: 'active',
        timestamp: new Date()
      });
    }
  }, 5000);

  return io;
}

export const getIo = (): Server | null => io;
