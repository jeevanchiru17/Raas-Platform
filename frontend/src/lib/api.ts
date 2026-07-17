import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type RobotType = 'warehouse' | 'delivery' | 'cleaning' | 'security';
export type RobotStatus = 'online' | 'active' | 'offline' | 'maintenance';
export type TaskStatus = 'pending' | 'running' | 'active' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Robot {
  id: string;
  name: string;
  type: RobotType;
  status: RobotStatus;
  battery: number;
  location?: string;
}

export interface Task {
  id: string;
  name: string;
  robotId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
}

export interface CreateRobotPayload {
  name: string;
  type: RobotType;
  location?: string;
}

export interface CreateTaskPayload {
  name: string;
  robotId: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface DashboardStats {
  totalRobots: number;
  activeRobots: number;
  pendingTasks: number;
  totalCredits: number;
}

export interface TelemetryPoint {
  time: string;
  battery: number;
}

// ─── API Functions ─────────────────────────────────────────────────────────

export const robotsApi = {
  list: (): Promise<Robot[]> =>
    apiClient.get<Robot[]>('/api/robots').then((r) => r.data),

  create: (payload: CreateRobotPayload): Promise<Robot> =>
    apiClient.post<Robot>('/api/robots', payload).then((r) => r.data),

  getById: (id: string): Promise<Robot> =>
    apiClient.get<Robot>(`/api/robots/${id}`).then((r) => r.data),

  sendCommand: (id: string, command: string): Promise<void> =>
    apiClient.post(`/api/robots/${id}/command`, { command }).then(() => undefined),
};

export const tasksApi = {
  list: (): Promise<Task[]> =>
    apiClient.get<Task[]>('/api/tasks').then((r) => r.data),

  create: (payload: CreateTaskPayload): Promise<Task> =>
    apiClient.post<Task>('/api/tasks', payload).then((r) => r.data),

  getById: (id: string): Promise<Task> =>
    apiClient.get<Task>(`/api/tasks/${id}`).then((r) => r.data),
};
