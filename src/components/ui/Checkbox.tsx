import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          id={checkId}
          ref={ref}
          className={cn(
            'w-4 h-4 rounded border-slate-300 text-[#0f4c81] focus:ring-[#0f4c81] transition-all cursor-pointer accent-[#0f4c81]',
            className
          )}
          {...props}
        />
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
