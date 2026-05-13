import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserChant } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ChantCardProps {
  chant: UserChant;
  selected: boolean;
  onClick: () => void;
}

export function ChantCard({ chant, selected, onClick }: ChantCardProps) {
  const lastUsedText = chant.lastUsed 
    ? formatDistanceToNow(chant.lastUsed, { addSuffix: true })
    : 'Never used';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-[1.5rem] transition-all duration-300 border",
        selected 
          ? "bg-[#7f5700] border-[#7f5700] text-white shadow-lg shadow-[#7f5700]/20" 
          : "bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50 hover:border-[#7f5700]/30"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "p-3 rounded-2xl flex items-center justify-center transition-colors",
            selected ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              selected ? "bg-white" : "bg-[#7f5700]"
            )} />
          </div>
          <div>
            <h4 className={cn(
              "text-lg font-bold leading-tight",
              selected ? "text-white" : "text-slate-800 dark:text-slate-200"
            )}>
              {chant.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {selected && <Check size={12} className="text-white/70" />}
              <span className={cn(
                "text-[0.65rem] font-black uppercase tracking-widest",
                selected ? "text-white/60" : "text-slate-400"
              )}>
                {selected ? 'Active Selection' : lastUsedText}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-[0.65rem] font-black uppercase tracking-[0.2em] mb-0.5",
            selected ? "text-white/60" : "text-slate-400"
          )}>
            Total
          </p>
          <p className={cn(
            "text-xl font-bold font-mono",
            selected ? "text-white" : "text-slate-700 dark:text-slate-200"
          )}>
            {chant.totalCount.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
