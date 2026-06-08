'use client';

import { memo } from "react";
import type { ComponentType, SVGProps } from "react";

export type StatCardColor = "blue" | "green" | "purple" | "orange" | "slate";

interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  color?: StatCardColor;
  subtitle?: string;
}

export const StatCard = memo(function StatCard({ icon: Icon, label, value, color = "blue", subtitle }: StatCardProps) {
  const colorClasses: Record<StatCardColor, string> = {
    blue: "bg-linear-to-br from-sky-50/70 to-blue-50/70 border-sky-100 text-sky-700 dark:from-sky-950/20 dark:to-blue-950/20 dark:border-sky-900/30 dark:text-sky-400",
    green: "bg-linear-to-br from-emerald-50/70 to-green-50/70 border-emerald-100 text-emerald-700 dark:from-emerald-950/20 dark:to-green-950/20 dark:border-emerald-900/30 dark:text-emerald-400",
    purple: "bg-linear-to-br from-violet-50/70 to-purple-50/70 border-violet-100 text-violet-700 dark:from-violet-950/20 dark:to-purple-950/20 dark:border-purple-900/30 dark:text-purple-400",
    orange: "bg-linear-to-br from-red-50/70 to-red-50/70 border-red-100 text-red-700 dark:from-red-950/20 dark:to-red-950/20 dark:border-red-900/30 dark:text-red-400",
    slate: "bg-linear-to-br from-slate-50/70 to-gray-50/70 border-slate-100 text-slate-700 dark:from-slate-800/20 dark:to-slate-900/20 dark:border-slate-800/30 dark:text-slate-400",
  };

  const iconBgClasses: Record<StatCardColor, string> = {
    blue: "bg-linear-to-br from-sky-100 to-blue-100 border-sky-200 dark:from-sky-900/30 dark:to-blue-900/30 dark:border-sky-800/30",
    green: "bg-linear-to-br from-emerald-100 to-green-100 border-emerald-200 dark:from-emerald-900/30 dark:to-green-900/30 dark:border-emerald-800/30",
    purple: "bg-linear-to-br from-violet-100 to-purple-100 border-violet-200 dark:from-violet-900/30 dark:to-purple-900/30 dark:border-purple-800/30",
    orange: "bg-linear-to-br from-red-100 to-red-100 border-red-200 dark:from-red-900/30 dark:to-red-900/30 dark:border-red-800/30",
    slate: "bg-linear-to-br from-slate-100 to-gray-100 border-slate-200 dark:from-slate-800/30 dark:to-slate-900/30 dark:border-slate-700/30",
  };

  const iconColorClasses: Record<StatCardColor, string> = {
    blue: "text-sky-500 dark:text-sky-400",
    green: "text-emerald-500 dark:text-emerald-400",
    purple: "text-violet-500 dark:text-purple-400",
    orange: "text-red-500 dark:text-red-400",
    slate: "text-slate-500 dark:text-slate-400",
  };

  return (
    <div className={`group relative rounded-xl sm:rounded-2xl ${colorClasses[color]} p-3 sm:p-5 md:p-6 border transition-all duration-300 hover:shadow-lg overflow-hidden backdrop-blur-sm`}>
      {/* Mobile: stack icon above text. sm+: side-by-side row */}
      <div className="relative flex flex-col items-center gap-1.5 sm:flex-row sm:items-center sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${iconBgClasses[color]} border group-hover:scale-110 transition-transform duration-300 shadow-sm shrink-0`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${iconColorClasses[color]}`} />
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-start">
          <div className="text-lg sm:text-2xl md:text-3xl font-bold font-kurdish mb-0.5 sm:mb-1 text-slate-700 dark:text-slate-200 leading-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 font-kurdish font-medium leading-tight">{label}</div>
          {subtitle && (
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 font-kurdish mt-1">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
});
