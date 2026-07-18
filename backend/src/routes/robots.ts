import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createRobotSchema, commandRobotSchema, robotIdParamsSchema } from './schemas';
import { db } from '../config/firebase';
import { pubsub } from '../config/pubsub';
import localDb from '../config/localDb';

export default async function robotsRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (request, reply) => {
    try {
      if (!db) {
        return await localDb.getRobots();
      }
      const robots = await db.collection('robots').get();
      const robotList = robots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return robotList;
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });

  server.post('/', {
    schema: {
      body: createRobotSchema
    }
  }, async (request, reply) => {
    try {
      const { name, type, location } = request.body;

      if (!db) {
        const newRobotObj = await localDb.addRobot({ name, type, location });
        return { id: newRobotObj.id, message: 'Robot deployed successfully', robot: newRobotObj };
      }

      const docRef = await db.collection('robots').add({
        name,
        type,
        location: location || 'Warehouse Bay',
        status: 'online',
        battery: 100,
        createdAt: new Date(),
        telemetry: []
      });
      return { id: docRef.id, message: 'Robot deployed successfully' };
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });

  server.get('/:id', {
    schema: {
      params: robotIdParamsSchema
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      if (!db) {
        const robots = await localDb.getRobots();
        const found = robots.find(r => r.id === id) || robots[0];
        if (!found) {
          reply.status(404);
          return { error: 'Robot not found' };
        }
        return found;
      }
      const robot = await db.collection('robots').doc(id).get();
      if (!robot.exists) {
        reply.status(404);
        return { error: 'Robot not found' };
      }
      return { id, ...robot.data() };
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });

  server.post('/:id/command', {
    schema: {
      params: robotIdParamsSchema,
      body: commandRobotSchema
    }
  }, async (request, reply) => {
    try {
      const { id: robotId } = request.params;
      const { command, params } = request.body;

      if (db) {
        // Log command to Firestore
        await db.collection('commands').add({
          robotId,
          command,
          params,
          timestamp: new Date(),
          status: 'pending'
        });
      }

      if (pubsub) {
        // Publish to Pub/Sub for robot to consume
        const topic = pubsub.topic(process.env.PUBSUB_TOPIC_COMMANDS || 'robot-commands');
        await topic.publish(Buffer.from(JSON.stringify({
          robotId,
          command,
          params,
          timestamp: new Date().toISOString()
        })));
      }

      return { message: 'Command sent', robotId, command };
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });
}
