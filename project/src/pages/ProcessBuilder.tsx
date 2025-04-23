import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  Trash2, 
  MoveVertical, 
  ArrowRight,
  Clock,
  UserCheck,
  FileUp,
  CheckSquare,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useProcess, Process, ProcessStep } from '../context/ProcessContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Checkbox from '../components/ui/Checkbox';

const ProcessBuilder: React.FC = () => {
  const { templates, createProcess, updateProcess, activeProcess } = useProcess();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [processDepartment, setProcessDepartment] = useState('');
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Initialize from template or active process
  useEffect(() => {
    if (id === 'new') {
      // New process, start fresh
      resetForm();
    } else if (activeProcess && activeProcess.id === id) {
      // Editing existing process
      setProcessName(activeProcess.name);
      setProcessDescription(activeProcess.description);
      setProcessDepartment(activeProcess.department);
      setSteps([...activeProcess.steps]);
    }
  }, [id, activeProcess]);
  
  // Apply template when selected
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setProcessName(template.name.replace(' Template', ''));
        setProcessDescription(template.description);
        setProcessDepartment(template.department);
        setSteps([...template.steps]);
      }
    }
  }, [selectedTemplateId, templates]);
  
  const resetForm = () => {
    setProcessName('');
    setProcessDescription('');
    setProcessDepartment('');
    setSteps([]);
    setErrors({});
    setSelectedTemplateId('');
  };
  
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!processName.trim()) {
      newErrors.name = 'Process name is required';
    }
    
    if (!processDepartment.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }
    
    steps.forEach((step, index) => {
      if (!step.title.trim()) {
        newErrors[`step-${index}-title`] = 'Step title is required';
      }
      
      if (!step.assignee.trim()) {
        newErrors[`step-${index}-assignee`] = 'Assignee is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddStep = () => {
    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
      title: '',
      description: '',
      assignee: '',
      requiresUpload: false,
      requiresCheckbox: false,
      requiresTextConfirmation: false,
      status: 'pending',
    };
    
    setSteps([...steps, newStep]);
  };
  
  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };
  
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];
    
    setSteps(newSteps);
  };
  
  const handleStepChange = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    setSteps(newSteps);
  };
  
  const handleDependencyChange = (stepIndex: number, dependsOnStepId: string) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    
    if (!step.dependsOn) {
      step.dependsOn = [dependsOnStepId];
    } else {
      if (step.dependsOn.includes(dependsOnStepId)) {
        step.dependsOn = step.dependsOn.filter(id => id !== dependsOnStepId);
      } else {
        step.dependsOn.push(dependsOnStepId);
      }
    }
    
    setSteps(newSteps);
  };
  
  const handleRelativeDueDateChange = (stepIndex: number, dependsOnStepId: string, hours: number) => {
    const newSteps = [...steps];
    const step = newSteps[stepIndex];
    
    if (hours > 0) {
      step.relativeDueDate = {
        stepId: dependsOnStepId,
        hours,
      };
    } else {
      delete step.relativeDueDate;
    }
    
    setSteps(newSteps);
  };
  
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    const processData: Omit<Process, 'id' | 'createdAt'> = {
      name: processName,
      description: processDescription,
      department: processDepartment,
      createdBy: '1', // Using mock user ID
      steps,
      status: 'draft',
    };
    
    if (id !== 'new' && activeProcess) {
      // Update existing process
      updateProcess({
        ...activeProcess,
        ...processData,
      });
      navigate(`/process/${activeProcess.id}`);
    } else {
      // Create new process
      const newProcess = createProcess(processData);
      navigate(`/process/${newProcess.id}`);
    }
  };
  
  const handleActivate = () => {
    if (!validateForm()) {
      return;
    }
    
    const processData: Omit<Process, 'id' | 'createdAt'> = {
      name: processName,
      description: processDescription,
      department: processDepartment,
      createdBy: '1', // Using mock user ID
      steps,
      status: 'active',
    };
    
    if (id !== 'new' && activeProcess) {
      // Update existing process
      updateProcess({
        ...activeProcess,
        ...processData,
      });
      navigate(`/process/${activeProcess.id}`);
    } else {
      // Create new process
      const newProcess = createProcess(processData);
      navigate(`/process/${newProcess.id}`);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id === 'new' ? 'Create New Process' : 'Edit Process'}
        </h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
          >
            Save as Draft
          </Button>
          <Button
            variant="secondary"
            onClick={handleActivate}
          >
            Save & Activate
          </Button>
        </div>
      </div>
      
      {id === 'new' && (
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>Start with a Template</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Select a template"
                options={[
                  { value: '', label: 'Choose a template...' },
                  ...templates.map((template) => ({
                    value: template.id,
                    label: template.name,
                  })),
                ]}
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => resetForm()}
                  size="md"
                >
                  Reset Form
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>
      )}
      
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Process Details</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Process Name"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              error={errors.name}
              required
            />
            <Input
              label="Department"
              value={processDepartment}
              onChange={(e) => setProcessDepartment(e.target.value)}
              error={errors.department}
              required
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Description"
              value={processDescription}
              onChange={(e) => setProcessDescription(e.target.value)}
              rows={3}
            />
          </div>
        </Card.Content>
      </Card>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Process Steps</h2>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={handleAddStep}
        >
          Add Step
        </Button>
      </div>
      
      {errors.steps && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {errors.steps}
        </div>
      )}
      
      {steps.map((step, index) => (
        <Card key={step.id} className="mb-4 border-l-4 border-blue-500">
          <Card.Header className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold mr-2">
                {index + 1}
              </span>
              <Card.Title>Step {index + 1}</Card.Title>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveStep(index, 'up')}
                disabled={index === 0}
              >
                <MoveVertical size={18} className="transform rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoveStep(index, 'down')}
                disabled={index === steps.length - 1}
              >
                <MoveVertical size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveStep(index)}
              >
                <Trash2 size={18} className="text-red-500" />
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Step Title"
                value={step.title}
                onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                error={errors[`step-${index}-title`]}
                required
              />
              <Input
                label="Assignee"
                value={step.assignee}
                onChange={(e) => handleStepChange(index, 'assignee', e.target.value)}
                placeholder="Name or role"
                error={errors[`step-${index}-assignee`]}
                required
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Description"
                value={step.description}
                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-md">
                <FileUp className="h-5 w-5 text-blue-600" />
                <Checkbox
                  label="Require file upload"
                  checked={step.requiresUpload}
                  onChange={() => handleStepChange(index, 'requiresUpload', !step.requiresUpload)}
                />
              </div>
              
              <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-md">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <Checkbox
                  label="Require checkbox confirmation"
                  checked={step.requiresCheckbox}
                  onChange={() => handleStepChange(index, 'requiresCheckbox', !step.requiresCheckbox)}
                />
              </div>
              
              <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-md">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                <Checkbox
                  label="Require text confirmation"
                  checked={step.requiresTextConfirmation}
                  onChange={() => handleStepChange(index, 'requiresTextConfirmation', !step.requiresTextConfirmation)}
                />
              </div>
            </div>
            
            {index > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Dependencies
                </h4>
                <div className="space-y-3">
                  {steps.slice(0, index).map((prevStep, prevIndex) => (
                    <div key={prevStep.id} className="flex flex-col sm:flex-row sm:items-center">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <Checkbox
                          label={`Depends on Step ${prevIndex + 1}: ${prevStep.title}`}
                          checked={step.dependsOn?.includes(prevStep.id) || false}
                          onChange={() => handleDependencyChange(index, prevStep.id)}
                        />
                      </div>
                      
                      {step.dependsOn?.includes(prevStep.id) && (
                        <div className="ml-0 sm:ml-auto flex items-center pl-7 sm:pl-0">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">Due</span>
                            <input
                              type="number"
                              min="1"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                              value={step.relativeDueDate?.stepId === prevStep.id ? step.relativeDueDate.hours : ''}
                              onChange={(e) => handleRelativeDueDateChange(index, prevStep.id, parseInt(e.target.value) || 0)}
                              placeholder="Hours"
                            />
                            <span className="text-sm text-gray-500">hours after completion</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      ))}
      
      {steps.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 p-6 rounded text-center">
          <p className="mb-4">No steps added yet</p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleAddStep}
          >
            Add First Step
          </Button>
        </div>
      )}
      
      {steps.length > 0 && (
        <div className="flex justify-end mt-6 space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
          >
            Save as Draft
          </Button>
          <Button
            variant="secondary"
            onClick={handleActivate}
          >
            Save & Activate
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProcessBuilder;