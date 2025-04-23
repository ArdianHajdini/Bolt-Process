import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useDepartments } from '../context/DepartmentContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const DepartmentsPage: React.FC = () => {
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingDepartment, setEditingDepartment] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    setIsSubmitting(true);
    try {
      await createDepartment(newDepartmentName);
      setNewDepartmentName('');
    } catch (error) {
      console.error('Failed to create department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment || !editingDepartment.name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateDepartment(editingDepartment.id, editingDepartment.name);
      setEditingDepartment(null);
    } catch (error) {
      console.error('Failed to update department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await deleteDepartment(id);
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
      </div>

      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Add New Department</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleCreateDepartment} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Department name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Plus size={16} />}
              isLoading={isSubmitting}
              disabled={!newDepartmentName.trim() || isSubmitting}
            >
              Add Department
            </Button>
          </form>
        </Card.Content>
      </Card>

      <div className="grid gap-4">
        {departments.map((department) => (
          <Card key={department.id}>
            <Card.Content className="py-4">
              {editingDepartment?.id === department.id ? (
                <form onSubmit={handleUpdateDepartment} className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={editingDepartment.name}
                      onChange={(e) =>
                        setEditingDepartment({ ...editingDepartment, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSubmitting}
                      disabled={!editingDepartment.name.trim() || isSubmitting}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDepartment(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{department.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditingDepartment({ id: department.id, name: department.name })
                      }
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDepartment(department.id)}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>
        ))}

        {departments.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No departments yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first department to start organizing your team
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentsPage;