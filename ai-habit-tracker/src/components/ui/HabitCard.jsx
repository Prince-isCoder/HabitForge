import React from 'react';
import { cn } from '../../utils/cn';
import * as Icons from 'lucide-react';

const HabitCard = ({ habit, onClick, onDelete }) => {
  const IconComponent = Icons[habit.icon] || Icons.HelpCircle;

  return (
    <div
      onClick={onClick}
      className={cn(
        "card card-hover cursor-pointer flex items-center justify-between group relative overflow-hidden active:scale-95 transition-transform duration-150",
        habit.completed ? "border-success/30 bg-success/5" : ""
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        habit.completed ? "bg-success" : "bg-transparent group-hover:bg-border"
      )} />

      <div className="flex items-center gap-4 pl-2">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-colors",
          habit.color,
          habit.completed ? "opacity-50" : "opacity-100"
        )}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>

        <div>
          <h3 className={cn(
            "text-base font-semibold mb-1 transition-colors",
            habit.completed ? "text-textMuted line-through" : "text-text group-hover:text-primary"
          )}>
            {habit.title}
          </h3>
          <p className="text-xs text-textMuted flex items-center gap-2">
            <span className="bg-surfaceLight px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">{habit.category}</span>
            <span>•</span>
            <span>{habit.target}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">

        {/* 🔥 DELETE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent card click
            onDelete && onDelete(habit._id);
          }}
          className="text-red-500 hover:scale-110 transition"
        >
          🗑
        </button>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs text-textMuted mb-0.5">Streak</span>
          <span className="text-sm font-bold text-text flex items-center gap-1">
            <Icons.Flame className={cn("w-4 h-4", habit.streak > 0 ? "text-orange-500" : "text-textMuted")} />
            {habit.streak}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent card click conflict
            onClick && onClick(); // 🔥 trigger toggle
          }}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            habit.completed
              ? "bg-success border-success text-white"
              : "border-border text-transparent hover:border-primary group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          )}
        >
          <Icons.Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
