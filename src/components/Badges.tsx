import { STATUS_META, URGENCY_LEVELS } from '@/lib/constants';
import type { ComplaintStatus, Urgency } from '@/types';
import { CheckCircle2, Clock, PlayCircle, PackageCheck, AlertTriangle } from 'lucide-react';

const statusIcons: Record<ComplaintStatus, React.ComponentType<{ className?: string }>> = {
  submitted: Clock,
  assigned: Clock,
  in_progress: PlayCircle,
  collected: PackageCheck,
  resolved: CheckCircle2,
  rejected: AlertTriangle,
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const meta = STATUS_META[status] || STATUS_META.submitted;
  const Icon = statusIcons[status] || Clock;

  return (
    <span
      className="badge text-xs"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{meta.label}</span>
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const meta = URGENCY_LEVELS.find((u) => u.value === urgency) || URGENCY_LEVELS[0];

  return (
    <span
      className="badge text-xs"
      style={{ color: meta.color, backgroundColor: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
      <span>{meta.label}</span>
    </span>
  );
}
