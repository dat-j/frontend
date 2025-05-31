import axios from 'axios';
import { WorkflowNode, WorkflowEdge } from '../store/workflowStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowDto {
  name: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  settings?: Record<string, any>;
}

export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
}

export const workflowService = {
  // Get all workflows
  async getWorkflows(): Promise<Workflow[]> {
    const response = await api.get('/workflows');
    return response.data;
  },

  // Get workflow by ID
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  // Get active workflow
  async getActiveWorkflow(): Promise<Workflow | null> {
    const response = await api.get('/workflows/active');
    return response.data;
  },

  // Create new workflow
  async createWorkflow(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  // Update workflow
  async updateWorkflow(id: string, data: UpdateWorkflowDto): Promise<Workflow> {
    const response = await api.patch(`/workflows/${id}`, data);
    return response.data;
  },

  // Delete workflow
  async deleteWorkflow(id: string): Promise<void> {
    await api.delete(`/workflows/${id}`);
  },

  // Update workflow nodes
  async updateNodes(id: string, nodes: WorkflowNode[]): Promise<Workflow> {
    const response = await api.patch(`/workflows/${id}/nodes`, { nodes });
    return response.data;
  },

  // Update workflow edges
  async updateEdges(id: string, edges: WorkflowEdge[]): Promise<Workflow> {
    const response = await api.patch(`/workflows/${id}/edges`, { edges });
    return response.data;
  },

  // Activate workflow
  async activateWorkflow(id: string): Promise<Workflow> {
    const response = await api.post(`/workflows/${id}/activate`);
    return response.data;
  },

  // Validate workflow
  async validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): Promise<any> {
    const response = await api.post('/workflows/validate', { nodes, edges });
    return response.data;
  },

  // Duplicate workflow
  async duplicateWorkflow(id: string, newName: string): Promise<Workflow> {
    const response = await api.post(`/workflows/${id}/duplicate`, { newName });
    return response.data;
  },
}; 