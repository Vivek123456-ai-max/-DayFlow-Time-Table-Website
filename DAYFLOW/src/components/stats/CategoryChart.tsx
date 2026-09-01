import React from 'react';
import { PieChart, Zap } from 'lucide-react';
import { useTasks } from '../../contexts/TaskContext';
import { CategoryType } from '../../types/database.types';

export const CategoryChart: React.FC = () => {
  const { tasks } = useTasks();

  const categories: CategoryType[] = ['Coding', 'Study', 'College', 'Exercise', 'Personal', 'Work', 'Other'];

  const categoryCounts = categories.map((cat) => {
    const count = tasks.filter((t) => t.category === cat).length;
    return {
      category: cat,
      count,
    };
  });

  const totalTasks = tasks.length || 1;

  const CATEGORY_STYLES: Record<CategoryType, { color: string; bg: string }> = {
    Coding: { color: 'text-emerald-400', bg: 'bg-emerald-500' },
    Study: { color: 'text-indigo-400', bg: 'bg-indigo-500' },
    College: { color: 'text-purple-400', bg: 'bg-purple-500' },
    Exercise: { color: 'text-orange-400', bg: 'bg-orange-500' },
    Personal: { color: 'text-pink-400', bg: 'bg-pink-500' },
    Work: { color: 'text-cyan-400', bg: 'bg-cyan-500' },
    Other: { color: 'text-slate-400', bg: 'bg-slate-500' },
  };

  return (
    <div className="glass-card rounded-3xl p-6 relative flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Category Allocation</h3>
            <p className="text-xs text-slate-400">Time distribution across life domains</p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {categoryCounts
          .filter((c) => c.count > 0)
          .map((item) => {
            const percentage = Math.round((item.count / totalTasks) * 100);
            const style = CATEGORY_STYLES[item.category];
            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={style.color}>{item.category}</span>
                  <span className="text-slate-400 font-mono">
                    {item.count} tasks ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${style.bg} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
