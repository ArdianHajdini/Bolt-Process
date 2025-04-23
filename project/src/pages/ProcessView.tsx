import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRightCircle, 
  AlertTriangle,
  FileUp,
  CheckSquare,
  MessageSquare,
  UserCheck,
  FileText,
  Edit,
  Copy,
  Archive,
  PenSquare
} from 'lucide-react';
import { useProcess, Process, ProcessStep } from '../context/ProcessContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';
import Checkbox from '../components/ui/Checkbox';

const StepStatusIcon = ({ status }: { status: string }) => {
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

const StepCard = ({ 
  step, 
  index, 
  processId,
  isActive, 
  onComplete 
}: { 
  step: ProcessStep;
  index: number;
  processId: string;
  isActive: boolean;
  onComplete: (data?: any) => void;
}) => {
  const [fileSelected, setFileSelected] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [textConfirmation, setTextConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canComplete = 
    (!step.requiresUpload || fileSelected) &&
    (!step.requiresCheckbox || checkboxChecked) &&
    (!step.requiresTextConfirmation || textConfirmation.trim().length > 0);
  
  const handleComplete = () => {
    if (!canComplete) return;
    
    setIsSubmitting(true);
    
    // Simulate upload delay
    setTimeout(() => {
      onComplete({
        fileUploaded: fileSelected,
        confirmed: checkboxChecked,
        notes: textConfirmation,
      });
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card 
      className={`mb-4 relative overflow-hidden transition-all duration-200 ${
        step.status === 'completed' 
          ? 'border-l-4 border-green-500 bg-green-50'
          : isActive
          ? 'border-l-4 border-blue-500 shadow-md'
          : 'opacity-75'
      }`}
    >
      <Card.Header className="flex justify-between items-center">
        <div className="flex items-center">
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-semibold mr-2 ${
            step.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : isActive
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {index + 1}
          </span>
          <Card.Title className="flex items-center">
            <StepStatusIcon status={step.status} />
            <span className="ml-2">{step.title}</span>
            {step.status === 'overdue' && (
              <Badge variant="danger" className="ml-2">Overdue</Badge>
            )}
          </Card.Title>
        </div>
        <div>
          {step.status === 'completed' && (
            <Badge variant="success">Completed</Badge>
          )}
          {step.status === 'in-progress' && (
            <Badge variant="primary">In Progress</Badge>
          )}
          {step.status === 'pending' && (
            <Badge variant="default">Pending</Badge>
          )}
        </div>
      </Card.Header>
      
      <Card.Content>
        <p className="text-sm text-gray-600 mb-4">{step.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-500 mr-1">Assignee:</span>
            <span className="font-medium">{step.assignee}</span>
          </div>
          
          {step.dueDate && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-500 mr-1">Due:</span>
              <span className="font-medium">
                {new Date(step.dueDate).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="mt-4 space-y-4">
            {step.requiresUpload && (
              <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <div className="flex items-center mb-2">
                  <FileUp className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium">Upload Required</span>
                </div>
                <input
                  type="file"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setFileSelected(e.target.files && e.target.files.length > 0)}
                />
              </div>
            )}
            
            {step.requiresCheckbox && (
              <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <Checkbox
                  label="I confirm this step has been completed according to the process requirements"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
              </div>
            )}
            
            {step.requiresTextConfirmation && (
              <div>
                <Textarea
                  label="Completion Notes"
                  value={textConfirmation}
                  onChange={(e) => setTextConfirmation(e.target.value)}
                  placeholder="Provide details about how this step was completed..."
                  rows={3}
                />
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={!canComplete}
                isLoading={isSubmitting}
              >
                Complete Step
              </Button>
            </div>
          </div>
        )}
        
        {step.status === 'completed' && (
          <div className="mt-4 p-3 bg-green-100 rounded-md text-green-800 text-sm">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span className="font-medium">Completed</span>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

const ProcessView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    processes, 
    setActiveProcess, 
    activeProcess, 
    completeStep,
    saveAsTemplate,
    updateProcess 
  } = useProcess();
  
  const [showGeneratePdf, setShowGeneratePdf] = useState(false);
  
  React.useEffect(() => {
    if (id) {
      const process = processes.find((p) => p.id === id);
      if (process) {
        setActiveProcess(process);
      } else {
        navigate('/');
      }
    }
    
    return () => {
      setActiveProcess(null);
    };
  }, [id, processes, setActiveProcess, navigate]);
  
  if (!activeProcess) {
    return <div>Loading...</div>;
  }
  
  const process = activeProcess;
  
  const completedSteps = process.steps.filter(
    (step) => step.status === 'completed'
  ).length;
  
  const totalSteps = process.steps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);
  
  const handleStepComplete = (stepId: string, data?: any) => {
    completeStep(process.id, stepId, data);
  };
  
  const handleArchive = () => {
    updateProcess({
      ...process,
      status: 'archived',
    });
    navigate('/');
  };
  
  const handleSaveTemplate = () => {
    saveAsTemplate(process);
  };
  
  const handleGeneratePdf = () => {
    setShowGeneratePdf(true);
    
    // In a real app, this would generate and download a PDF
    setTimeout(() => {
      setShowGeneratePdf(false);
    }, 2000);
  };
  
  const getActiveStepIndex = () => {
    const inProgressIndex = process.steps.findIndex(
      (step) => step.status === 'in-progress'
    );
    
    if (inProgressIndex !== -1) {
      return inProgressIndex;
    }
    
    const pendingIndex = process.steps.findIndex(
      (step) => step.status === 'pending'
    );
    
    return pendingIndex;
  };
  
  const activeStepIndex = getActiveStepIndex();
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{process.name}</h1>
          <p className="text-gray-600">{process.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<Edit size={16} />}
            onClick={() => navigate(`/process/edit/${process.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            leftIcon={<Copy size={16} />}
            onClick={handleSaveTemplate}
          >
            Save as Template
          </Button>
          <Button
            variant="outline"
            leftIcon={<FileText size={16} />}
            onClick={handleGeneratePdf}
            isLoading={showGeneratePdf}
          >
            Generate PDF
          </Button>
          {process.status !== 'archived' && (
            <Button
              variant="outline"
              leftIcon={<Archive size={16} />}
              onClick={handleArchive}
            >
              Archive
            </Button>
          )}
        </div>
      </div>
      
      <Card className="mb-6">
        <Card.Content className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="mt-1 flex items-center">
                <Badge
                  variant={
                    process.status === 'completed'
                      ? 'success'
                      : process.status === 'active'
                      ? 'primary'
                      : process.status === 'archived'
                      ? 'secondary'
                      : 'default'
                  }
                >
                  {process.status.charAt(0).toUpperCase() + process.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="mt-1 text-sm text-gray-900">{process.department}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(process.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
          <span className="text-sm font-medium text-gray-700">
            {completedSteps} of {totalSteps} steps completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Process Steps</h2>
      
      {process.steps.map((step, index) => (
        <StepCard
          key={step.id}
          step={step}
          index={index}
          processId={process.id}
          isActive={index === activeStepIndex && process.status === 'active'}
          onComplete={(data) => handleStepComplete(step.id, data)}
        />
      ))}
    </div>
  );
};

export default ProcessView;