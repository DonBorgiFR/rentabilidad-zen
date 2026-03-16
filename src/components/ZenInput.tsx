import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface ZenInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  step?: number;
  min?: number;
}

export const ZenInput: React.FC<ZenInputProps> = ({ 
  label, 
  value, 
  onChange, 
  icon, 
  step = 10, 
  min = 0 
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
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          {label}
        </label>
      </div>
      
      <div className="relative flex items-center">
        {/* Decrement Button */}
        <button 
          onClick={decrement}
          className="absolute left-2 z-10 p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all active:scale-90"
          title="Disminuir"
        >
          <Minus size={16} />
        </button>

        <input 
          type="text" 
          value={isEditing ? tempValue : value.toLocaleString('es-ES')} 
          onFocus={() => setIsEditing(true)}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 px-12 font-black text-lg text-center focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all hover:border-slate-300 dark:hover:border-slate-700"
        />

        {/* Increment Button */}
        <button 
          onClick={increment}
          className="absolute right-2 z-10 p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all active:scale-90"
          title="Aumentar"
        >
          <Plus size={16} />
        </button>

        {icon && (
          <div className="absolute left-12 opacity-0 group-focus-within:opacity-20 transition-opacity pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
