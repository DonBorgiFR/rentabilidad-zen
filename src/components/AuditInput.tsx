import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuditInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  step?: number;
  min?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  tooltip?: string;
}

export const AuditInput: React.FC<AuditInputProps> = ({ 
  label, 
  value, 
  onChange, 
  icon, 
  step = 10, 
  min = 0,
  prefix,
  suffix,
  className,
  tooltip
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    if (!isEditing) {
      setTempValue(value.toString());
    }
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const num = parseFloat(tempValue);
    if (!isNaN(num)) {
      onChange(Math.max(min, num));
    } else {
      setTempValue(value.toString());
    }
  };

  const increment = () => onChange(value + step);
  const decrement = () => onChange(Math.max(min, value - step));

  return (
    <div className={cn("flex flex-col gap-2 group relative", className)}>
      <div className="flex flex-col">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {tooltip && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug font-medium pr-2">
            {tooltip}
          </p>
        )}
      </div>

      <div className="relative flex items-center w-full mt-1">
        {/* Decrement Button */}
        <button 
          onClick={decrement}
          className="absolute left-1 z-10 p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          title="Disminuir"
          type="button"
        >
          <Minus size={16} />
        </button>

        <div className="w-full flex items-stretch bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all shadow-sm">
          {prefix && (
            <div className="flex items-center pl-10 pr-2 text-slate-500 font-bold select-none bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700">
               {prefix}
            </div>
          )}
          
          <input 
            type="text" 
            value={isEditing ? tempValue : value.toLocaleString('es-ES')} 
            onFocus={() => setIsEditing(true)}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className={cn(
               "flex-1 bg-transparent py-3 text-center text-slate-900 dark:text-white font-black text-lg outline-none w-full min-w-0 transition-all",
               !prefix && "pl-10",
               !suffix && "pr-10"
            )}
          />
          
          {suffix && (
            <div className="flex items-center pr-10 pl-3 text-slate-500 font-bold select-none bg-slate-50 dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700">
               {suffix}
            </div>
          )}
        </div>

        {/* Increment Button */}
        <button 
          onClick={increment}
          className="absolute right-1 z-10 p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          title="Aumentar"
          type="button"
        >
          <Plus size={16} />
        </button>

        {icon && (
          <div className="absolute left-10 opacity-0 group-focus-within:opacity-20 transition-opacity pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
