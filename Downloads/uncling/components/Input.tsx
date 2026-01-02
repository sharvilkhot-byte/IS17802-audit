
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-textPrimary mb-2">{label}</label>}
      <input
        id={id}
        className={`w-full px-4 py-3 bg-white/80 rounded-xl border border-moss/50 focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-shadow text-textPrimary ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
