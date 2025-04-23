import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Copy, 
  FileCheck, 
  Search, 
  Filter, 
  Plus,
  ListFilter
} from 'lucide-react';
import { useProcess, Process } from '../context/ProcessContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

interface TemplateCardProps {
  template: Process;
  onSelect: (template: Process) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <Card.Header>
        <Card.Title>{template.name}</Card.Title>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">{template.department}</p>
          </div>
          <div>
            <p className="text-gray-500">Steps</p>
            <p className="font-medium">{template.steps.length}</p>
          </div>
        </div>
      </Card.Content>
      <Card.Footer>
        <Button 
          variant="primary" 
          leftIcon={<Copy size={16} />}
          onClick={() => onSelect(template)}
          className="w-full"
        >
          Use Template
        </Button>
      </Card.Footer>
    </Card>
  );
};

const TemplatesPage: React.FC = () => {
  const { templates } = useProcess();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('');
  const navigate = useNavigate();
  
  const departments = React.useMemo(() => {
    const depts = templates.map((t) => t.department);
    return Array.from(new Set(depts));
  }, [templates]);
  
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = 
        !departmentFilter || template.department === departmentFilter;
      
      return matchesSearch && matchesDepartment;
    });
  }, [templates, searchQuery, departmentFilter]);
  
  const handleSelectTemplate = (template: Process) => {
    navigate(`/process/new?template=${template.id}`);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Process Templates</h1>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/process/new')}
        >
          Create Process
        </Button>
      </div>
      
      <Card className="mb-6">
        <Card.Content className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search templates..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ListFilter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="pl-10 w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
      
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="flex justify-center">
            <FileCheck className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || departmentFilter
              ? "No templates match your filters."
              : "You don't have any templates yet."}
          </p>
          {searchQuery || departmentFilter ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('');
              }}
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              variant="primary"
              className="mt-4"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate('/process/new')}
            >
              Create Process
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;