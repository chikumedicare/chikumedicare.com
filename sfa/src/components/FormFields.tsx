import React from 'react';
import { toTitleCase } from '../utils/textFormat';

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  autoCapitalizeWords = true,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoCapitalizeWords?: boolean;
}) => {
  const isExcludedType = ['email', 'password', 'number', 'date', 'time', 'datetime-local', 'url'].includes(type);
  const shouldCapitalize = autoCapitalizeWords && !isExcludedType && type === 'text';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (shouldCapitalize) {
      val = toTitleCase(val);
    }
    onChange?.(val);
  };

  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        style={{
          ...(shouldCapitalize ? { textTransform: 'capitalize' } : {}),
          ...(disabled ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}),
        }}
      />
    </label>
  );
};

export const SelectField = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
  disabled?: boolean;
}) => (
  <label>
    {label}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={disabled ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : undefined}
    >
      <option value="">-- Select --</option>
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  </label>
);
