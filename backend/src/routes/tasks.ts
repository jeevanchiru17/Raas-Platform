import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createTaskSchema } from './schemas';
import { db } from '../config/firebase';
import localDb from '../config/localDb';

export default async function tasksRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (request, reply) => {
    try {
      if (!db) {
        return await localDb.getTasks();
      }
      const tasks = await db.collection('tasks').get();
      const taskList = tasks.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return taskList;
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });

  server.post('/', {
    schema: {
      body: createTaskSchema
    }
  }, async (request, reply) => {
    try {
      const { name, robotId, priority, dueDate } = request.body;

      if (!db) {
        const newTaskObj = await localDb.addTask({ name, robotId, priority, dueDate });
        return { id: newTaskObj.id, message: 'Task created successfully', task: newTaskObj };
      }

      const docRef = await db.collection('tasks').add({
        name,
        robotId,
        priority,
        dueDate: dueDate || 'ASAP',
        status: 'pending',
        createdAt: new Date()
      });
      return { id: docRef.id, message: 'Task created successfully' };
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });
}
