import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate?: string;
  requiresUpload: boolean;
  requiresCheckbox: boolean;
  requiresTextConfirmation: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dependsOn?: string[];
  relativeDueDate?: {
    stepId: string;
    hours: number;
  };
  completedAt?: string;
  completedBy?: string;
  attachments?: string[];
  completionNotes?: string;
}

export interface Process {
  id: string;
  name: string;
  description: string;
  department: string;
  createdBy: string;
  createdAt: string;
  steps: ProcessStep[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  requiresAdminApproval?: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

interface ProcessContextType {
  processes: Process[];
  templates: Process[];
  activeProcess: Process | null;
  setActiveProcess: (process: Process | null) => void;
  createProcess: (process: Omit<Process, 'id' | 'createdAt'>) => Process;
  updateProcess: (process: Process) => void;
  saveAsTemplate: (process: Process) => void;
  completeStep: (processId: string, stepId: string, data?: any) => void;
  approveProcess: (processId: string) => void;
  checkOverdueSteps: () => void;
}

// Mock notification function (in a real app, this would send emails)
const sendNotification = (to: string, subject: string, message: string) => {
  console.log('📧 Notification sent:', {
    to,
    subject,
    message,
    timestamp: new Date().toISOString(),
  });
};

// Sample data for demo purposes
const MOCK_TEMPLATES: Process[] = [
  {
    id: 'template-1',
    name: 'New Employee Onboarding',
    description: 'Process for setting up new employees with all necessary resources and training',
    department: 'HR',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: 'step-1',
        title: 'Complete paperwork',
        description: 'Have employee fill out all required forms and documents',
        assignee: 'HR Manager',
        requiresUpload: true,
        requiresCheckbox: true,
        requiresTextConfirmation: false,
        status: 'pending',
      },
      {
        id: 'step-2',
        title: 'Setup workstation',
        description: 'Prepare computer, desk, and necessary equipment',
        assignee: 'IT Support',
        requiresUpload: false,
        requiresCheckbox: true,
        requiresTextConfirmation: false,
        status: 'pending',
        dependsOn: ['step-1'],
      },
      {
        id: 'step-3',
        title: 'System access setup',
        description: 'Create accounts and provide access to required systems',
        assignee: 'IT Support',
        requiresUpload: false,
        requiresCheckbox: true,
        requiresTextConfirmation: false,
        status: 'pending',
        dependsOn: ['step-2'],
        relativeDueDate: {
          stepId: 'step-2',
          hours: 24,
        },
      },
      {
        id: 'step-4',
        title: 'Department orientation',
        description: 'Introduce employee to team and department procedures',
        assignee: 'Department Manager',
        requiresUpload: false,
        requiresCheckbox: true,
        requiresTextConfirmation: true,
        status: 'pending',
        dependsOn: ['step-3'],
      },
    ],
    status: 'draft',
    requiresAdminApproval: true,
  },
  // ... other templates
];

const MOCK_PROCESSES: Process[] = [
  {
    id: 'process-1',
    name: 'Jane Smith Onboarding',
    description: 'Onboarding process for new marketing specialist',
    department: 'HR',
    createdBy: '1',
    createdAt: '2025-04-01T09:00:00Z',
    steps: [
      {
        id: 'step-1',
        title: 'Complete paperwork',
        description: 'Have employee fill out all required forms and documents',
        assignee: 'HR Manager',
        requiresUpload: true,
        requiresCheckbox: true,
        requiresTextConfirmation: false,
        status: 'completed',
        completedAt: '2025-04-01T10:00:00Z',
        completedBy: 'HR Manager',
        attachments: ['onboarding-forms.pdf'],
      },
      {
        id: 'step-2',
        title: 'Setup workstation',
        description: 'Prepare computer, desk, and necessary equipment',
        assignee: 'IT Support',
        requiresUpload: false,
        requiresCheckbox: true,
        requiresTextConfirmation: false,
        status: 'in-progress',
        dependsOn: ['step-1'],
      },
      {
        id: 'step-3',
        title: 'System access setup',
        description: 'Create accounts and provide access to required systems',
        assignee: 'IT Support',
        requiresUpload: false,
        requiresCheckbox: true,
        requiresTextConfirmation: false,
        status: 'pending',
        dependsOn: ['step-2'],
        relativeDueDate: {
          stepId: 'step-2',
          hours: 24,
        },
      },
      {
        id: 'step-4',
        title: 'Department orientation',
        description: 'Introduce employee to team and department procedures',
        assignee: 'Department Manager',
        requiresUpload: false,
        requiresCheckbox: true,
        requiresTextConfirmation: true,
        status: 'pending',
        dependsOn: ['step-3'],
      },
    ],
    status: 'active',
    requiresAdminApproval: true,
  },
];

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

export const ProcessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [processes, setProcesses] = useState<Process[]>(MOCK_PROCESSES);
  const [templates, setTemplates] = useState<Process[]>(MOCK_TEMPLATES);
  const [activeProcess, setActiveProcess] = useState<Process | null>(null);

  // Check for overdue steps periodically
  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      
      setProcesses((currentProcesses) =>
        currentProcesses.map((process) => {
          if (process.status !== 'active') return process;
          
          const updatedSteps = process.steps.map((step) => {
            if (step.status !== 'in-progress' || !step.dueDate) return step;
            
            const dueDate = new Date(step.dueDate);
            if (now > dueDate && step.status !== 'overdue') {
              // Send notification
              sendNotification(
                'admin@example.com',
                `Overdue Step: ${step.title}`,
                `Step "${step.title}" in process "${process.name}" is overdue. Due date was ${dueDate.toLocaleString()}.`
              );
              
              return { ...step, status: 'overdue' };
            }
            
            return step;
          });
          
          return { ...process, steps: updatedSteps };
        })
      );
    };
    
    // Check every minute
    const interval = setInterval(checkOverdue, 60000);
    return () => clearInterval(interval);
  }, []);

  const createProcess = (processData: Omit<Process, 'id' | 'createdAt'>) => {
    const newProcess: Process = {
      ...processData,
      id: `process-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setProcesses([...processes, newProcess]);
    return newProcess;
  };

  const updateProcess = (updatedProcess: Process) => {
    setProcesses(
      processes.map((p) => (p.id === updatedProcess.id ? updatedProcess : p))
    );
    
    if (activeProcess?.id === updatedProcess.id) {
      setActiveProcess(updatedProcess);
    }
  };

  const saveAsTemplate = (process: Process) => {
    const template: Process = {
      ...process,
      id: `template-${Date.now()}`,
      name: `${process.name} Template`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      steps: process.steps.map(step => ({
        ...step,
        status: 'pending',
        completedAt: undefined,
        completedBy: undefined,
        attachments: undefined,
        completionNotes: undefined,
      })),
    };
    
    setTemplates([...templates, template]);
  };

  const completeStep = (processId: string, stepId: string, data?: any) => {
    setProcesses(
      processes.map((process) => {
        if (process.id !== processId) return process;
        
        const updatedSteps = process.steps.map((step) => {
          if (step.id !== stepId) return step;
          
          const completedStep = {
            ...step,
            status: 'completed',
            completedAt: new Date().toISOString(),
            completedBy: 'Current User', // In a real app, this would be the actual user
            attachments: data?.fileUploaded ? ['uploaded-file.pdf'] : undefined,
            completionNotes: data?.notes,
          };
          
          // Send notification about step completion
          sendNotification(
            'admin@example.com',
            `Step Completed: ${step.title}`,
            `Step "${step.title}" in process "${process.name}" has been completed by ${completedStep.completedBy}.`
          );
          
          return completedStep;
        });
        
        // Auto-start next steps that depend on this one
        updatedSteps.forEach((step) => {
          if (step.dependsOn?.includes(stepId) && step.status === 'pending') {
            step.status = 'in-progress';
            
            // Set due date based on relative time if configured
            if (step.relativeDueDate?.stepId === stepId) {
              const hours = step.relativeDueDate.hours;
              const dueDate = new Date();
              dueDate.setHours(dueDate.getHours() + hours);
              step.dueDate = dueDate.toISOString();
              
              // Send notification about new step with deadline
              sendNotification(
                step.assignee,
                `New Task: ${step.title}`,
                `You have been assigned to "${step.title}" in process "${process.name}". Due by ${dueDate.toLocaleString()}.`
              );
            }
          }
        });
        
        // Check if all steps are completed
        const allCompleted = updatedSteps.every(
          (step) => step.status === 'completed'
        );
        
        const updatedProcess = {
          ...process,
          steps: updatedSteps,
          status: allCompleted && !process.requiresAdminApproval ? 'completed' : process.status,
        };
        
        if (allCompleted && process.requiresAdminApproval) {
          // Notify admin about process ready for approval
          sendNotification(
            'admin@example.com',
            `Process Ready for Approval: ${process.name}`,
            `All steps in process "${process.name}" have been completed. Please review and approve.`
          );
        }
        
        if (activeProcess?.id === processId) {
          setActiveProcess(updatedProcess);
        }
        
        return updatedProcess;
      })
    );
  };

  const approveProcess = (processId: string) => {
    setProcesses(
      processes.map((process) => {
        if (process.id !== processId) return process;
        
        const updatedProcess = {
          ...process,
          status: 'completed',
          approvedBy: 'Admin User', // In a real app, this would be the actual admin
          approvedAt: new Date().toISOString(),
        };
        
        // Send notification about process completion
        sendNotification(
          process.createdBy,
          `Process Completed: ${process.name}`,
          `Process "${process.name}" has been completed and approved by ${updatedProcess.approvedBy}.`
        );
        
        if (activeProcess?.id === processId) {
          setActiveProcess(updatedProcess);
        }
        
        return updatedProcess;
      })
    );
  };

  const checkOverdueSteps = () => {
    const now = new Date();
    
    setProcesses(
      processes.map((process) => {
        if (process.status !== 'active') return process;
        
        const updatedSteps = process.steps.map((step) => {
          if (step.status !== 'in-progress' || !step.dueDate) return step;
          
          const dueDate = new Date(step.dueDate);
          if (now > dueDate && step.status !== 'overdue') {
            // Send notification
            sendNotification(
              'admin@example.com',
              `Overdue Step: ${step.title}`,
              `Step "${step.title}" in process "${process.name}" is overdue. Due date was ${dueDate.toLocaleString()}.`
            );
            
            return { ...step, status: 'overdue' };
          }
          
          return step;
        });
        
        return { ...process, steps: updatedSteps };
      })
    );
  };

  const value = {
    processes,
    templates,
    activeProcess,
    setActiveProcess,
    createProcess,
    updateProcess,
    saveAsTemplate,
    completeStep,
    approveProcess,
    checkOverdueSteps,
  };

  return <ProcessContext.Provider value={value}>{children}</ProcessContext.Provider>;
};

export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (context === undefined) {
    throw new Error('useProcess must be used within a ProcessProvider');
  }
  return context;
};

export default ProcessContext;