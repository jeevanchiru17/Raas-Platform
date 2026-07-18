import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createRobotSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['warehouse', 'delivery', 'cleaning', 'security']),
  location: z.string().optional(),
});

export const commandRobotSchema = z.object({
  command: z.string().min(1),
  params: z.any().optional(),
});

export const robotIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const createTaskSchema = z.object({
  name: z.string().min(1),
  robotId: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional(),
});

export const getSubscriptionSchema = z.object({
  userId: z.string().optional(),
});

export const createCheckoutSessionSchema = z.object({
  userId: z.string().optional(),
});

export const createPortalSessionSchema = z.object({
  userId: z.string().optional(),
});
