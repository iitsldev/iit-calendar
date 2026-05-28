import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserChant } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface ChantCardProps {
  chant: UserChant;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function ChantCard({ chant, selected, onClick, onDelete, onView }: ChantCardProps) {
  const lastUsedText = chant.lastUsed 
    ? formatDistanceToNow(chant.lastUsed, { addSuffix: true })
    : 'Never used';

  // Handle keyboard interaction for accessibility since it's now a div
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={cn(
        "w-full text-left p-5 rounded-[1.5rem] transition-all duration-300 border bg-[var(--bg-card)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
        selected 
          ? "border-[var(--accent)] text-[var(--text-primary)] shadow-lg shadow-[var(--accent)]/20" 
          : "border-[var(--border-subtle)] hover:border-[var(--accent)]/30"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "p-3 rounded-2xl flex items-center justify-center transition-colors",
            selected ? "bg-[var(--accent)]" : "bg-[var(--bg-muted)]"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              selected ? "bg-[var(--bg-main)]" : "bg-[var(--text-faint)]"
            )} />
          </div>
          <div>
            <h4 className={cn(
              "text-lg font-bold leading-tight",
              selected ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
            )}>
              {chant.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {selected && <Check size={12} className="text-white/70" />}
              <span className={cn(
                "text-[0.65rem] font-black uppercase tracking-widest",
                selected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}>
                {selected ? 'Active Selection' : lastUsedText}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex gap-2 mb-2">
            {onView && chant.chant && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onView(); }} 
                 className="text-[var(--text-faint)] hover:text-[var(--accent)] p-1 active:scale-90 transition-transform"
               >
                 <Eye size={16} />
               </button>
            )}
            {onDelete && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                 className="text-[var(--text-faint)] hover:text-red-500 p-1 active:scale-90 transition-transform"
               >
                 <Trash2 size={16} />
               </button>
            )}
          </div>
          <p className={cn(
            "text-[0.65rem] font-black uppercase tracking-[0.2em] mb-0.5 mt-auto",
            selected ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
          )}>
            Total
          </p>
          <p className={cn(
            "text-xl font-bold font-mono",
            selected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
          )}>
            {chant.totalCount.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}