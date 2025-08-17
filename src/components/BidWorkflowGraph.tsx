import { useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  ArrowRight,
  MapPin,
  DollarSign,
  Calendar,
  Truck,
  FileText,
  Send
} from 'lucide-react';

interface BidWorkflowGraphProps {
  currentStep?: number;
  completedSteps?: number[];
  isProcessing?: boolean;
}

type WorkflowStep = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed';
  position: { x: number; y: number };
};

const workflowSteps: WorkflowStep[] = [
  {
    id: '1',
    label: 'Bid Information',
    description: 'Basic bid details and type',
    icon: FileText,
    status: 'pending',
    position: { x: 50, y: 50 }
  },
  {
    id: '2', 
    label: 'Route Details',
    description: 'Origin and destination',
    icon: MapPin,
    status: 'pending',
    position: { x: 300, y: 50 }
  },
  {
    id: '3',
    label: 'Transportation',
    description: 'Vehicle and equipment requirements',
    icon: Truck,
    status: 'pending',
    position: { x: 550, y: 50 }
  },
  {
    id: '4',
    label: 'Timeline',
    description: 'Schedule and deadlines',
    icon: Calendar,
    status: 'pending',
    position: { x: 175, y: 200 }
  },
  {
    id: '5',
    label: 'Budget',
    description: 'Pricing and budget limits',
    icon: DollarSign,
    status: 'pending',
    position: { x: 425, y: 200 }
  },
  {
    id: '6',
    label: 'Submit Bid',
    description: 'Review and publish',
    icon: Send,
    status: 'pending',
    position: { x: 300, y: 350 }
  }
];

const WorkflowNode = ({ data }: { data: WorkflowStep }) => {
  const IconComponent = data.icon;
  
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'active':
        return 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-600';
    }
  };

  const getStatusIcon = () => {
    if (data.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (data.status === 'active') {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className={`
      p-4 rounded-lg border-2 transition-all duration-200 min-w-[180px]
      ${getStatusColor()}
    `}>
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <h3 className="font-medium text-sm">{data.label}</h3>
      </div>
      <p className="text-xs opacity-75">{data.description}</p>
      {data.status === 'active' && (
        <Badge variant="secondary" className="mt-2 text-xs">
          In Progress
        </Badge>
      )}
    </div>
  );
};

export function BidWorkflowGraph({ 
  currentStep = 0, 
  completedSteps = [], 
  isProcessing = false 
}: BidWorkflowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    // Update step statuses based on props
    const updatedSteps = workflowSteps.map((step, index) => {
      let status: 'pending' | 'active' | 'completed' = 'pending';
      
      if (completedSteps.includes(index + 1)) {
        status = 'completed';
      } else if (currentStep === index + 1) {
        status = 'active';
      }

      return { ...step, status };
    });

    // Create nodes
    const flowNodes: Node[] = updatedSteps.map((step) => ({
      id: step.id,
      type: 'default',
      position: step.position,
      data: step,
      draggable: false,
      selectable: false,
    }));

    // Create edges to connect the workflow steps
    const flowEdges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        animated: currentStep === 2,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: completedSteps.includes(2) ? '#10b981' : '#6b7280' }
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        type: 'smoothstep',
        animated: currentStep === 3,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: completedSteps.includes(3) ? '#10b981' : '#6b7280' }
      },
      {
        id: 'e1-4',
        source: '1',
        target: '4',
        type: 'smoothstep',
        animated: currentStep === 4,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: completedSteps.includes(4) ? '#10b981' : '#6b7280' }
      },
      {
        id: 'e3-5',
        source: '3',
        target: '5',
        type: 'smoothstep',
        animated: currentStep === 5,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: completedSteps.includes(5) ? '#10b981' : '#6b7280' }
      },
      {
        id: 'e4-6',
        source: '4',
        target: '6',
        type: 'smoothstep',
        animated: currentStep === 6,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: completedSteps.includes(6) ? '#10b981' : '#6b7280' }
      },
      {
        id: 'e5-6',
        source: '5',
        target: '6',
        type: 'smoothstep',
        animated: currentStep === 6,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: completedSteps.includes(6) ? '#10b981' : '#6b7280' }
      }
    ];

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [currentStep, completedSteps, setNodes, setEdges]);

  const nodeTypes = {
    default: WorkflowNode,
  };

  return (
    <div className="h-[500px] w-full border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        style={{ backgroundColor: 'transparent' }}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls showInteractive={false} />
        
        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 p-4 bg-card rounded-lg border shadow-lg">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-sm font-medium">Processing bid creation...</span>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}