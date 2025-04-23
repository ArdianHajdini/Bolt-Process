import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helper?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helper,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={checkboxId} className="font-medium text-gray-700">
          {label}
        </label>
        {helper && !error && (
          <p className="text-gray-500">{helper}</p>
        )}
        {error && (
          <p className="text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Checkbox;