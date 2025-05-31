import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { workflowService, Workflow, CreateWorkflowDto } from '../services/workflowService';

export interface WorkflowNodeData {
  label: string;
  message?: string;
  messageType?: string;
  
  // New flexible element system
  elements?: Array<{
    id: string;
    type: 'text' | 'image' | 'video' | 'file' | 'button' | 'quick_reply' | 'generic_card' | 'list_item';
    content?: string; // For text content
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    fileUrl?: string;
    // Button specific
    buttonType?: 'postback' | 'web_url' | 'phone_number';
    payload?: string;
    url?: string;
    // Quick reply specific
    quickReplyPayload?: string;
    // Generic card specific
    buttons?: Array<{
      type: 'postback' | 'web_url' | 'phone_number';
      title: string;
      payload?: string;
      url?: string;
    }>;
  }>;
  
  // Legacy fields (keep for backward compatibility)
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  
  // Facebook Messenger Platform message types
  quickReplies?: Array<{
    title: string;
    payload: string;
    imageUrl?: string;
  }>;
  
  // Button template buttons
  buttonTemplate?: {
    buttons: Array<{
      type: 'postback' | 'web_url' | 'phone_number';
      title: string;
      payload?: string;
      url?: string;
    }>;
  };
  
  // Attachment URL for image, video, file
  attachmentUrl?: string;
  
  // Receipt template specific fields
  recipientName?: string;
  orderNumber?: string;
  currency?: string;
  paymentMethod?: string;
  summary?: {
    subtotal: number;
    shippingCost: number;
    totalTax: number;
    totalCost: number;
  };
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

interface WorkflowStore {
  // State
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  currentWorkflow: Workflow | null;
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: WorkflowNode | null) => void;
  
  // API Actions
  loadWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  loadActiveWorkflow: () => Promise<void>;
  createWorkflow: (data: CreateWorkflowDto) => Promise<void>;
  saveCurrentWorkflow: () => Promise<void>;
  saveNodes: () => Promise<void>;
  saveEdges: () => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  activateWorkflow: (id: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNode: null,
  currentWorkflow: null,
  workflows: [],
  isLoading: false,
  error: null,

  // Basic actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({ nodes: newNodes });
    
    // Auto-save nodes if we have a current workflow
    const { currentWorkflow, saveNodes } = get();
    if (currentWorkflow) {
      saveNodes();
    }
  },

  onEdgesChange: (changes) => {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({ edges: newEdges });
    
    // Auto-save edges if we have a current workflow
    const { currentWorkflow, saveEdges } = get();
    if (currentWorkflow) {
      saveEdges();
    }
  },

  onConnect: (connection) => {
    const newEdges = addEdge(connection, get().edges);
    set({ edges: newEdges });
    
    // Auto-save edges if we have a current workflow
    const { currentWorkflow, saveEdges } = get();
    if (currentWorkflow) {
      saveEdges();
    }
  },

  addNode: (node) => {
    const newNodes = [...get().nodes, node];
    set({ nodes: newNodes });
    
    // Auto-save nodes if we have a current workflow
    const { currentWorkflow, saveNodes } = get();
    if (currentWorkflow) {
      saveNodes();
    }
  },

  updateNode: (nodeId, data) => {
    const newNodes = get().nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    );
    set({ nodes: newNodes });
    
    // Auto-save nodes if we have a current workflow
    const { currentWorkflow, saveNodes } = get();
    if (currentWorkflow) {
      saveNodes();
    }
  },

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    const newNodes = nodes.filter((node) => node.id !== nodeId);
    const newEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    
    set({
      nodes: newNodes,
      edges: newEdges,
    });
    
    // Auto-save if we have a current workflow
    const { currentWorkflow, saveNodes, saveEdges } = get();
    if (currentWorkflow) {
      saveNodes();
      saveEdges();
    }
  },

  setSelectedNode: (node) => set({ selectedNode: node }),

  // API Actions
  loadWorkflows: async () => {
    try {
      set({ isLoading: true, error: null });
      const workflows = await workflowService.getWorkflows();
      set({ workflows, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load workflows',
        isLoading: false 
      });
    }
  },

  loadWorkflow: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const workflow = await workflowService.getWorkflow(id);
      set({ 
        currentWorkflow: workflow,
        nodes: workflow.nodes,
        edges: workflow.edges,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load workflow',
        isLoading: false 
      });
    }
  },

  loadActiveWorkflow: async () => {
    try {
      set({ isLoading: true, error: null });
      const workflow = await workflowService.getActiveWorkflow();
      if (workflow) {
        set({ 
          currentWorkflow: workflow,
          nodes: workflow.nodes,
          edges: workflow.edges,
        });
      }
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load active workflow',
        isLoading: false 
      });
    }
  },

  createWorkflow: async (data: CreateWorkflowDto) => {
    try {
      set({ isLoading: true, error: null });
      const workflow = await workflowService.createWorkflow({
        ...data,
        nodes: get().nodes,
        edges: get().edges,
      });
      set({ 
        currentWorkflow: workflow,
        workflows: [...get().workflows, workflow],
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create workflow',
        isLoading: false 
      });
    }
  },

  saveCurrentWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow) return;

    try {
      set({ isLoading: true, error: null });
      await workflowService.updateNodes(currentWorkflow.id, nodes);
      await workflowService.updateEdges(currentWorkflow.id, edges);
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save workflow',
        isLoading: false 
      });
    }
  },

  saveNodes: async () => {
    const { currentWorkflow, nodes } = get();
    if (!currentWorkflow) return;

    try {
      await workflowService.updateNodes(currentWorkflow.id, nodes);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save nodes'
      });
    }
  },

  saveEdges: async () => {
    const { currentWorkflow, edges } = get();
    if (!currentWorkflow) return;

    try {
      await workflowService.updateEdges(currentWorkflow.id, edges);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save edges'
      });
    }
  },

  deleteWorkflow: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await workflowService.deleteWorkflow(id);
      const { workflows, currentWorkflow } = get();
      
      set({ 
        workflows: workflows.filter(w => w.id !== id),
        currentWorkflow: currentWorkflow?.id === id ? null : currentWorkflow,
        nodes: currentWorkflow?.id === id ? [] : get().nodes,
        edges: currentWorkflow?.id === id ? [] : get().edges,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete workflow',
        isLoading: false 
      });
    }
  },

  activateWorkflow: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const workflow = await workflowService.activateWorkflow(id);
      const { workflows } = get();
      
      // Update workflow list and set as current
      const updatedWorkflows = workflows.map(w => ({
        ...w,
        isActive: w.id === id
      }));
      
      set({ 
        workflows: updatedWorkflows,
        currentWorkflow: workflow,
        nodes: workflow.nodes,
        edges: workflow.edges,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to activate workflow',
        isLoading: false 
      });
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
})); 