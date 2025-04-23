import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRightCircle, 
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react';
import { useProcess, useAuth } from '../context';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

const TasksPage: React.FC = () => {
  const { processes } = useProcess();
  const { user } = useAuth();
  const [filter, setFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const navigate = useNavigate();
  
  // Collect all steps across all active processes that are assigned to the current user
  const allTasks = React.useMemo(() => {
    return processes
      .filter((p) => p.status === 'active')
      .flatMap((process) =>
        process.steps.map((step) => ({
          ...step,
          processId: process.id,
          processName: process.name,
        }))
      )
      .filter((task) => {
        // In a real app, this would match the assignee to the user
        // For demo, we'll show all tasks
        return true;
      });
  }, [processes, user]);
  
  const filteredTasks = React.useMemo(() => {
    return allTasks.filter((task) => {
      const matchesStatus = filter === 'all' || task.status === filter;
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.processName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [allTasks, filter, searchQuery]);
  
  const tasksByStatus = {
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress').length,
    'pending': filteredTasks.filter((t) => t.status === 'pending').length,
    'completed': filteredTasks.filter((t) => t.status === 'completed').length,
    'overdue': filteredTasks.filter((t) => t.status === 'overdue').length,
  };
  
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <ArrowRightCircle className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const handleViewTask = (processId: string) => {
    navigate(`/process/${processId}`);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">
          Manage all your assigned process tasks
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className={`bg-blue-50 border-l-4 border-blue-500 ${filter === 'in-progress' ? 'ring-2 ring-blue-500' : ''}`}>
          <Card.Content className="py-4">
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => setFilter(filter === 'in-progress' ? 'all' : 'in-progress')}
            >
              <div className="flex items-center">
                <ArrowRightCircle className="h-5 w-5 text-blue-500 mr-3" />
                <span className="font-medium">In Progress</span>
              </div>
              <span className="bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded-full text-sm">
                {tasksByStatus['in-progress']}
              </span>
            </button>
          </Card.Content>
        </Card>
        
        <Card className={`bg-amber-50 border-l-4 border-amber-500 ${filter === 'pending' ? 'ring-2 ring-amber-500' : ''}`}>
          <Card.Content className="py-4">
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-3" />
                <span className="font-medium">Pending</span>
              </div>
              <span className="bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full text-sm">
                {tasksByStatus['pending']}
              </span>
            </button>
          </Card.Content>
        </Card>
        
        <Card className={`bg-red-50 border-l-4 border-red-500 ${filter === 'overdue' ? 'ring-2 ring-red-500' : ''}`}>
          <Card.Content className="py-4">
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => setFilter(filter === 'overdue' ? 'all' : 'overdue')}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <span className="font-medium">Overdue</span>
              </div>
              <span className="bg-red-100 text-red-800 font-medium px-2.5 py-0.5 rounded-full text-sm">
                {tasksByStatus['overdue']}
              </span>
            </button>
          </Card.Content>
        </Card>
        
        <Card className={`bg-green-50 border-l-4 border-green-500 ${filter === 'completed' ? 'ring-2 ring-green-500' : ''}`}>
          <Card.Content className="py-4">
            <button 
              className="w-full flex justify-between items-center"
              onClick={() => setFilter(filter === 'completed' ? 'all' : 'completed')}
            >
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium">Completed</span>
              </div>
              <span className="bg-green-100 text-green-800 font-medium px-2.5 py-0.5 rounded-full text-sm">
                {tasksByStatus['completed']}
              </span>
            </button>
          </Card.Content>
        </Card>
      </div>
      
      <Card className="mb-6">
        <Card.Content className="py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </Card.Content>
      </Card>
      
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={`${task.processId}-${task.id}`} className="hover:shadow-md transition-shadow duration-200">
              <Card.Content className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-start">
                    <StatusIcon status={task.status} />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <h3 className="text-base font-medium text-gray-900">
                          {task.title}
                        </h3>
                        <span className="ml-2">
                          <Badge
                            variant={
                              task.status === 'completed'
                                ? 'success'
                                : task.status === 'in-progress'
                                ? 'primary'
                                : task.status === 'overdue'
                                ? 'danger'
                                : 'default'
                            }
                          >
                            {task.status === 'in-progress'
                              ? 'In Progress'
                              : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Badge>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Process: {task.processName}
                      </p>
                      {task.dueDate && (
                        <p className="text-sm mt-1 flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-500">Due: {new Date(task.dueDate).toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTask(task.processId)}
                    >
                      View Process
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' || searchQuery
              ? "No tasks match your current filters."
              : "You don't have any assigned tasks."}
          </p>
          {(filter !== 'all' || searchQuery) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;