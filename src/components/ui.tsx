import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  trend?: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon, color = '#166534', trend, subtitle }: StatCardProps) {
  return (
    <div className="card p-5 hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">{label}</p>
          <p className="font-bold text-3xl text-slate-900 tracking-tight mt-1">{value}</p>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
      {(trend || subtitle) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="font-semibold text-emerald-700">{trend}</span>}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="card p-10 sm:p-12 text-center border-dashed border-slate-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 text-base mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-5 max-w-md mx-auto leading-relaxed">{message}</p>
      {action && <div className="inline-flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="h-8 w-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 rounded-md w-1/3" />
      <div className="h-8 bg-slate-200 rounded-md w-1/2" />
      <div className="h-3 bg-slate-100 rounded-md w-2/3" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-6 sm:p-8 text-center border-red-200 bg-red-50/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 mx-auto mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">Unable to Load Data</h4>
      <p className="text-xs text-slate-600 max-w-sm mx-auto mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5 mx-auto">
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </button>
      )}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 className="font-bold text-base sm:text-lg text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
