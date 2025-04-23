/*
  # Initial Schema Setup for Flowly

  1. Tables
    - organizations
    - users
    - processes
    - process_steps
    - process_templates
    - process_assignments
    - files

  2. Security
    - RLS policies for each table
    - Organization-based isolation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  full_name text,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Processes table
CREATE TABLE processes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  description text,
  department text,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_by uuid REFERENCES users(id),
  requires_approval boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Process steps table
CREATE TABLE process_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_id uuid REFERENCES processes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assignee_id uuid REFERENCES users(id),
  position integer NOT NULL,
  requires_upload boolean DEFAULT false,
  requires_checkbox boolean DEFAULT false,
  requires_text boolean DEFAULT false,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  depends_on uuid[] DEFAULT ARRAY[]::uuid[],
  relative_due_hours integer,
  relative_due_to_step uuid REFERENCES process_steps(id),
  due_at timestamptz,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id),
  completion_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Process templates table
CREATE TABLE process_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  description text,
  department text,
  created_by uuid REFERENCES users(id),
  requires_approval boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Template steps table
CREATE TABLE template_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid REFERENCES process_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  position integer NOT NULL,
  requires_upload boolean DEFAULT false,
  requires_checkbox boolean DEFAULT false,
  requires_text boolean DEFAULT false,
  depends_on uuid[] DEFAULT ARRAY[]::uuid[],
  relative_due_hours integer,
  relative_due_to_step uuid REFERENCES template_steps(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Files table
CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id),
  process_id uuid REFERENCES processes(id),
  step_id uuid REFERENCES process_steps(id),
  name text NOT NULL,
  size integer NOT NULL,
  mime_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Organization access policy
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Users access policies
CREATE POLICY "Users can view members of their organization"
  ON users
  FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Processes access policies
CREATE POLICY "Users can view processes in their organization"
  ON processes
  FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create processes in their organization"
  ON processes
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update processes in their organization"
  ON processes
  FOR UPDATE
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Process steps access policies
CREATE POLICY "Users can view steps in their organization"
  ON process_steps
  FOR SELECT
  TO authenticated
  USING (
    process_id IN (
      SELECT id FROM processes 
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create steps in their organization"
  ON process_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    process_id IN (
      SELECT id FROM processes 
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update steps in their organization"
  ON process_steps
  FOR UPDATE
  TO authenticated
  USING (
    process_id IN (
      SELECT id FROM processes 
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Templates access policies
CREATE POLICY "Users can view templates in their organization"
  ON process_templates
  FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create templates in their organization"
  ON process_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Template steps access policies
CREATE POLICY "Users can view template steps in their organization"
  ON template_steps
  FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM process_templates 
      WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Files access policies
CREATE POLICY "Users can view files in their organization"
  ON files
  FOR SELECT
  TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can upload files to their organization"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Create indexes for better query performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_processes_organization ON processes(organization_id);
CREATE INDEX idx_process_steps_process ON process_steps(process_id);
CREATE INDEX idx_templates_organization ON process_templates(organization_id);
CREATE INDEX idx_template_steps_template ON template_steps(template_id);
CREATE INDEX idx_files_organization ON files(organization_id);
CREATE INDEX idx_files_process ON files(process_id);
CREATE INDEX idx_files_step ON files(step_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processes_updated_at
    BEFORE UPDATE ON processes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_steps_updated_at
    BEFORE UPDATE ON process_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_templates_updated_at
    BEFORE UPDATE ON process_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_steps_updated_at
    BEFORE UPDATE ON template_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();