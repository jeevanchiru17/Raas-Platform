import { FastifyInstance, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getSubscriptionSchema, createCheckoutSessionSchema, createPortalSessionSchema } from './schemas';
import stripe from '../config/stripe';
import { db } from '../config/firebase';
import localDb from '../config/localDb';

const getUserSubscription = async (userId: string) => {
  if (db) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const data = userDoc.data() || {};
        return {
          plan: data.subscription || 'free',
          credits: data.credits || 100,
          creditsUsed: data.creditsUsed || 0,
          robots: (data.robots || []).length,
          robotsLimit: data.subscription === 'pro' ? 50 : 10,
          stripeCustomerId: data.stripeCustomerId || null,
          features: data.subscription === 'pro' 
            ? ['50 Active Robots', '1000 Monthly Credits', 'Advanced Analytics', '100 GB Data Storage', 'Priority 24/7 Support']
            : ['5 Active Robots', '100 Monthly Credits', 'Basic Monitoring', '1 GB Data Storage']
        };
      }
    } catch (e) {
      console.error('Error fetching user subscription from DB:', e);
    }
  }
  
  return localDb.getSubscription(userId);
};

const updateUserSubscription = async (userId: string, plan: string, stripeCustomerId: string | null = null) => {
  if (db) {
    try {
      const updates: any = {
        subscription: plan,
        credits: plan === 'pro' ? 1000 : 100
      };
      if (stripeCustomerId) {
        updates.stripeCustomerId = stripeCustomerId;
      }
      await db.collection('users').doc(userId).update(updates);
    } catch (e) {
      console.error('Failed to update user subscription in DB:', e);
    }
  }
  
  return localDb.updateSubscription(userId, plan, stripeCustomerId);
};

const findUserIdByCustomerId = async (customerId: string) => {
  if (db) {
    try {
      const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
      if (!userQuery.empty) {
        return userQuery.docs[0].id;
      }
    } catch (e) {
      console.error('Error looking up customer ID in DB:', e);
    }
  }
  const sub = await localDb.getSubscription('global-user');
  if (sub && sub.stripeCustomerId === customerId) {
    return 'global-user';
  }
  return 'global-user';
};

export default async function billingRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  server.get('/subscription', {
    schema: {
      querystring: getSubscriptionSchema
    }
  }, async (request, reply) => {
    try {
      const userId = request.query.userId || 'global-user';
      const sub = await getUserSubscription(userId);
      return sub;
    } catch (error: any) {
      reply.status(500);
      return { error: error.message };
    }
  });

  server.post('/create-checkout-session', {
    schema: {
      body: createCheckoutSessionSchema
    }
  }, async (request, reply) => {
    try {
      const userId = request.body?.userId || 'global-user';
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'; // Updated to new Vite port

      if (!stripe) {
        // Mock checkout redirection - simulates upgrading immediately
        console.log(`[Stripe Mock] Upgrading user ${userId} to pro plan`);
        await updateUserSubscription(userId, 'pro');
        return { url: `${frontendUrl}/billing?session_id=mock_checkout_completed` };
      }

      const priceId = process.env.STRIPE_PRO_PRICE_ID;
      if (!priceId) {
        reply.status(400);
        return { error: 'STRIPE_PRO_PRICE_ID environment variable is missing.' };
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        client_reference_id: userId,
        metadata: {
          userId: userId
        },
        success_url: `${frontendUrl}/billing?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/billing?cancelled=true`,
      });

      return { url: session.url };
    } catch (error: any) {
      console.error('Checkout Session Error:', error);
      reply.status(500);
      return { error: error.message };
    }
  });

  server.post('/create-portal-session', {
    schema: {
      body: createPortalSessionSchema
    }
  }, async (request, reply) => {
    try {
      const userId = request.body?.userId || 'global-user';
      const sub = await getUserSubscription(userId);
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'; // Updated to new Vite port

      if (!stripe) {
        // Mock portal redirection - simulates cancellation/downgrade immediately
        console.log(`[Stripe Mock] Downgrading user ${userId} to free plan`);
        await updateUserSubscription(userId, 'free');
        return { url: `${frontendUrl}/billing?mock_action=cancel` };
      }

      if (!sub.stripeCustomerId) {
        reply.status(400);
        return { error: 'No Stripe customer ID associated with this subscription.' };
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: sub.stripeCustomerId,
        return_url: `${frontendUrl}/billing`,
      });

      return { url: session.url };
    } catch (error: any) {
      console.error('Portal Session Error:', error);
      reply.status(500);
      return { error: error.message };
    }
  });

  server.post('/webhook', async (request: FastifyRequest, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    let event: any;

    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('Stripe or Webhook Secret not configured. Accepting simulation event.');
      event = request.body;
    } else {
      try {
        const rawBody = (request as any).rawBody;
        if (!rawBody) {
          throw new Error('Raw request body buffer is missing');
        }
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        reply.status(400);
        return `Webhook Error: ${err.message}`;
      }
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || (session.metadata && session.metadata.userId) || 'global-user';
        console.log(`[Webhook] Payment succeeded for session ${session.id}, upgrading user ${userId} to pro`);
        await updateUserSubscription(userId, 'pro', session.customer);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = await findUserIdByCustomerId(subscription.customer);
        console.log(`[Webhook] Subscription deleted: ${subscription.id}, downgrading user ${userId} to free`);
        await updateUserSubscription(userId, 'free');
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event type ${event.type}`);
    }

    return { received: true };
  });
}
