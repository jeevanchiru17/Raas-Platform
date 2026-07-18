import * as fs from 'fs';
import * as path from 'path';
import { isMongoConnected } from './mongo';
import Robot from '../models/Robot';
import Task from '../models/Task';
import Subscription from '../models/Subscription';

const dataDir = path.join(__dirname, '../../data');
const dbFilePath = path.join(dataDir, 'database.json');

interface RobotItem {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  battery: number;
  createdAt: string;
}

interface TaskItem {
  id: string;
  name: string;
  robotId: string;
  status: string;
  priority: string;
  dueDate: string;
  createdAt: string;
}

interface SubscriptionItem {
  plan: string;
  credits: number;
  creditsUsed: number;
  robots: number;
  robotsLimit: number;
  stripeCustomerId: string | null;
  features: string[];
}

interface MemoryDb {
  robots: RobotItem[];
  tasks: TaskItem[];
  subscriptions: Record<string, SubscriptionItem>;
}

// Default initial seed state
const initialData: MemoryDb = {
  robots: [
    { id: 'robot-1', name: 'Warehouse Bot 1', type: 'warehouse', status: 'online', battery: 85, location: 'Warehouse A', createdAt: new Date().toISOString() }
  ],
  tasks: [
    { id: 'task-1', name: 'Pick and place items', robotId: 'robot-1', status: 'pending', priority: 'high', dueDate: 'ASAP', createdAt: new Date().toISOString() }
  ],
  subscriptions: {
    'global-user': {
      plan: 'free',
      credits: 100,
      creditsUsed: 25,
      robots: 1,
      robotsLimit: 10,
      stripeCustomerId: null,
      features: ['5 Active Robots', '100 Monthly Credits', 'Basic Monitoring', '1 GB Data Storage']
    }
  }
};

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const saveDatabase = (data: MemoryDb) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
};

const loadDatabase = (): MemoryDb => {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error reading database file, initializing fresh store:', error);
  }
  saveDatabase(initialData);
  return { ...initialData };
};

const memoryDb: MemoryDb = loadDatabase();

const localDb = {
  getRobots: async (): Promise<any[]> => {
    if (isMongoConnected()) {
      try {
        const docs = await Robot.find().sort({ createdAt: -1 });
        if (docs.length > 0) return docs;
      } catch (e: any) {
        console.error('Mongo Robot query fallback:', e.message);
      }
    }
    return memoryDb.robots || [];
  },

  addRobot: async (robotData: Partial<RobotItem>): Promise<RobotItem> => {
    const newRobot: RobotItem = {
      id: robotData.id || `robot-${Date.now()}`,
      name: robotData.name || 'Alpha-Unit',
      type: robotData.type || 'warehouse',
      location: robotData.location || 'Bay 1',
      status: robotData.status || 'online',
      battery: robotData.battery !== undefined ? robotData.battery : 100,
      createdAt: robotData.createdAt || new Date().toISOString()
    };
    memoryDb.robots.unshift(newRobot);
    saveDatabase(memoryDb);

    if (isMongoConnected()) {
      try {
        await Robot.create(newRobot);
      } catch (e: any) {
        console.error('Mongo Robot insert fallback:', e.message);
      }
    }
    return newRobot;
  },

  getTasks: async (): Promise<any[]> => {
    if (isMongoConnected()) {
      try {
        const docs = await Task.find().sort({ createdAt: -1 });
        if (docs.length > 0) return docs;
      } catch (e: any) {
        console.error('Mongo Task query fallback:', e.message);
      }
    }
    return memoryDb.tasks || [];
  },

  addTask: async (taskData: Partial<TaskItem>): Promise<TaskItem> => {
    const newTask: TaskItem = {
      id: taskData.id || `task-${Date.now()}`,
      name: taskData.name || 'Autonomous Task',
      robotId: taskData.robotId || 'unassigned',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || 'ASAP',
      status: taskData.status || 'pending',
      createdAt: taskData.createdAt || new Date().toISOString()
    };
    memoryDb.tasks.unshift(newTask);
    saveDatabase(memoryDb);

    if (isMongoConnected()) {
      try {
        await Task.create(newTask);
      } catch (e: any) {
        console.error('Mongo Task insert fallback:', e.message);
      }
    }
    return newTask;
  },

  getSubscription: async (userId: string = 'global-user'): Promise<any> => {
    if (!memoryDb.subscriptions[userId]) {
      memoryDb.subscriptions[userId] = {
        plan: 'free',
        credits: 100,
        creditsUsed: 25,
        robots: memoryDb.robots.length,
        robotsLimit: 10,
        stripeCustomerId: null,
        features: ['5 Active Robots', '100 Monthly Credits', 'Basic Monitoring', '1 GB Data Storage']
      };
      saveDatabase(memoryDb);
    }
    memoryDb.subscriptions[userId].robots = memoryDb.robots.length;

    if (isMongoConnected()) {
      try {
        let subDoc = await Subscription.findOne({ userId });
        if (!subDoc) {
          subDoc = await Subscription.create({ userId, ...memoryDb.subscriptions[userId] });
        }
        return subDoc;
      } catch (e: any) {
        console.error('Mongo Subscription fetch fallback:', e.message);
      }
    }
    return memoryDb.subscriptions[userId];
  },

  updateSubscription: async (userId: string = 'global-user', plan: string, stripeCustomerId: string | null = null): Promise<SubscriptionItem> => {
    if (!memoryDb.subscriptions[userId]) {
      memoryDb.subscriptions[userId] = {
        plan: 'free',
        credits: 100,
        creditsUsed: 25,
        robots: memoryDb.robots.length,
        robotsLimit: 10,
        stripeCustomerId: null,
        features: ['5 Active Robots', '100 Monthly Credits', 'Basic Monitoring', '1 GB Data Storage']
      };
    }
    const sub = memoryDb.subscriptions[userId];
    sub.plan = plan;
    if (stripeCustomerId) {
      sub.stripeCustomerId = stripeCustomerId;
    }
    if (plan === 'pro') {
      sub.credits = 1000;
      sub.robotsLimit = 50;
      sub.features = ['50 Active Robots', '1000 Monthly Credits', 'Advanced Analytics', '100 GB Data Storage', 'Priority 24/7 Support'];
    } else if (plan === 'business') {
      sub.credits = 3000;
      sub.robotsLimit = 150;
      sub.features = ['150 Active Robots', '3000 Monthly Credits', 'Team Workspace & RBAC', '500 GB Data Storage', '24/7 Priority SLA & Support'];
    } else {
      sub.credits = 100;
      sub.robotsLimit = 10;
      sub.features = ['5 Active Robots', '100 Monthly Credits', 'Basic Monitoring', '1 GB Data Storage'];
    }
    sub.robots = memoryDb.robots.length;
    saveDatabase(memoryDb);

    if (isMongoConnected()) {
      try {
        await Subscription.findOneAndUpdate({ userId }, sub, { upsert: true });
      } catch (e: any) {
        console.error('Mongo Subscription update fallback:', e.message);
      }
    }
    return sub;
  }
};

export default localDb;
