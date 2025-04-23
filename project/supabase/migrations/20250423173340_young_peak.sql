/*
  # Add Departments Management

  1. New Tables
    - departments
      - id (uuid, primary key)
      - organization_id (uuid, references organizations)
      - name (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Changes
    - Add department_id to users table
    - Update RLS policies

  3. Security
    - Enable RLS on departments table
    - Add policies for department access
*/

-- Create departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add department_id to users
ALTER TABLE users ADD COLUMN department_id uuid REFERENCES departments(id);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_departments_organization ON departments(organization_id);
CREATE INDEX idx_users_department ON users(department_id);

-- Department policies
CREATE POLICY "Users can view departments in their organization"
  ON departments
  FOR SELECT
  TO authenticated
  USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update users policies to include department management
CREATE POLICY "Managers can assign users to their department"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    AND
    (
      role = 'manager'
      OR
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
      )
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();