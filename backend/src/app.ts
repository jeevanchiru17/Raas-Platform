import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

import authRoutes from './routes/auth';
import robotsRoutes from './routes/robots';
import tasksRoutes from './routes/tasks';
import billingRoutes from './routes/billing';

const createServer = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Schema compiler configs for Zod validation
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Security middleware
  fastify.register(helmet, { contentSecurityPolicy: false });
  
  // CORS configuration
  fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Custom parser to capture the raw body as a buffer for Stripe webhook verification
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    try {
      const raw = body.toString('utf8');
      const parsed = raw ? JSON.parse(raw) : {};
      (req as any).rawBody = body; // Attach raw buffer
      done(null, parsed);
    } catch (err: any) {
      done(err, undefined);
    }
  });

  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date() };
  });

  // API Routes
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(robotsRoutes, { prefix: '/api/robots' });
  fastify.register(tasksRoutes, { prefix: '/api/tasks' });
  fastify.register(billingRoutes, { prefix: '/api/billing' });

  return fastify;
};

export default createServer;
