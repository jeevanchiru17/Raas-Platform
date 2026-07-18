import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerSchema } from './schemas';
import { admin, db } from '../config/firebase';

export default async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.post('/register', {
    schema: {
      body: registerSchema
    }
  }, async (request, reply) => {
    const { email, password, name } = request.body;

    if (!db || !admin) {
      reply.status(400);
      return { error: 'Database/Firebase Admin not initialized. Please setup Firebase credentials.' };
    }

    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name
      });

      await db.collection('users').doc(userRecord.uid).set({
        email,
        name,
        createdAt: new Date(),
        subscription: 'free',
        robots: [],
        credits: 100
      });

      return { uid: userRecord.uid, message: 'User registered successfully' };
    } catch (error: any) {
      request.log.error(error, 'Registration error');
      reply.status(400);
      return { error: error.message };
    }
  });

  server.post('/login', async (request, reply) => {
    return { message: 'Use Firebase client SDK for authentication' };
  });
}
