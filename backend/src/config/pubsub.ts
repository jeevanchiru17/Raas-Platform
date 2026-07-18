import { PubSub } from '@google-cloud/pubsub';

let pubsub: PubSub | null = null;

try {
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    pubsub = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
  } else {
    console.warn('GCP Project ID not set. Pub/Sub disabled.');
  }
} catch (error: any) {
  console.warn('GCP Pub/Sub initialization skipped (for development):', error.message);
}

export { pubsub };
