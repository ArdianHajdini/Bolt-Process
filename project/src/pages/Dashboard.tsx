import React, { useState } from 'react';
import { 
  ArrowRightCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart4,
  ListChecks,
  Users,
  FileCheck,
} from 'lucide-react';
import { useProcess, Process } from '../context/ProcessContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-gray-500" />;
    case 'in-progress':
      return <ArrowRightCircle className="h-5 w-5 text-blue-500" />;
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'overdue':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="default">Pending</Badge>;
    case 'in-progress':
      return <Badge variant="primary">In Progress</Badge>;
    case 'completed':
      return <Badge variant="success">Completed</Badge>;
    case 'overdue':
      return <Badge variant="danger">Overdue</Badge>;
    case 'draft':
      return <Badge variant="default">Draft</Badge>;
    case 'active':
      return <Badge variant="primary">Active</Badge>;
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

const ProcessCard = ({ process }: { process: Process }) => {
  const navigate = useNavigate();
  const { setActiveProcess } = useProcess();
  
  const completedSteps = process.steps.filter(
    (step) => step.status === 'completed'
  ).length;
  
  const totalSteps = process.steps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);
  
  const handleClick = () => {
    setActiveProcess(process);
    navigate(`/process/${process.id}`);
  };
  
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <Card.Header>
        <div className="flex justify-between items-center">
          <Card.Title>{process.name}</Card.Title>
          <StatusBadge status={process.status} />
        </div>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-gray-600 mb-4">{process.description}</p>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">{process.department}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium">
              {new Date(process.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card.Content>
      <Card.Footer>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleClick}
          className="w-full"
        >
          View Process
        </Button>
      </Card.Footer>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { processes, templates } = useProcess();
  const [filter, setFilter] = useState('all');
  
  const filteredProcesses = processes.filter((process) => {
    if (filter === 'all') return true;
    return process.status === filter;
  });
  
  // Stats calculation
  const activeProcesses = processes.filter(p => p.status === 'active').length;
  const completedProcesses = processes.filter(p => p.status === 'completed').length;
  const totalTemplates = templates.length;
  const overdueSteps = processes.flatMap(p => 
    p.steps.filter(s => s.status === 'overdue')
  ).length;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-50 border-l-4 border-blue-600">
          <Card.Content className="flex items-center py-4">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <BarChart4 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Active Processes</p>
              <p className="text-2xl font-bold">{activeProcesses}</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card className="bg-green-50 border-l-4 border-green-600">
          <Card.Content className="flex items-center py-4">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold">{completedProcesses}</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card className="bg-teal-50 border-l-4 border-teal-600">
          <Card.Content className="flex items-center py-4">
            <div className="p-3 rounded-full bg-teal-100 mr-4">
              <ListChecks className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-teal-600">Templates</p>
              <p className="text-2xl font-bold">{totalTemplates}</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card className={`${overdueSteps > 0 ? 'bg-red-50 border-l-4 border-red-600' : 'bg-gray-50 border-l-4 border-gray-400'}`}>
          <Card.Content className="flex items-center py-4">
            <div className={`p-3 rounded-full ${overdueSteps > 0 ? 'bg-red-100' : 'bg-gray-100'} mr-4`}>
              <AlertTriangle className={`h-6 w-6 ${overdueSteps > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${overdueSteps > 0 ? 'text-red-600' : 'text-gray-600'}`}>Overdue Tasks</p>
              <p className="text-2xl font-bold">{overdueSteps}</p>
            </div>
          </Card.Content>
        </Card>
      </div>
      
      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Processes
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              filter === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              filter === 'completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              filter === 'draft'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Drafts
          </button>
        </nav>
      </div>
      
      {/* Process list */}
      {filteredProcesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProcesses.map((process) => (
            <ProcessCard key={process.id} process={process} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex justify-center">
            <FileCheck className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No processes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? "You don't have any processes yet."
              : `You don't have any ${filter} processes.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;