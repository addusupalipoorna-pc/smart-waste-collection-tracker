import { STATUS_META, URGENCY_LEVELS } from '@/lib/constants';
import type { ComplaintStatus, Urgency } from '@/types';
import { CheckCircle2, Clock, PlayCircle, PackageCheck, AlertTriangle } from 'lucide-react';

function normalizeStatusKey(status: string): ComplaintStatus {
  if (!status) return 'Pending';
  const s = status.toLowerCase().replace('_', ' ').trim();
  if (s === 'pending' || s === 'submitted') return 'Pending';
  if (s === 'assigned') return 'Assigned';
  if (s === 'in progress' || s === 'inprogress') return 'In Progress';
  if (s === 'completed' || s === 'resolved' || s === 'collected') return 'Completed';
  if (s === 'rejected') return 'Rejected';
  return (status as ComplaintStatus) || 'Pending';
}

export function StatusBadge({ status }: { status: ComplaintStatus | string }) {
  const normKey = normalizeStatusKey(status);
  const meta = STATUS_META[normKey] || STATUS_META.Pending;

  const Icon =
    normKey === 'Pending'
      ? Clock
      : normKey === 'Assigned'
      ? Clock
      : normKey === 'In Progress'
      ? PlayCircle
      : normKey === 'Completed'
      ? CheckCircle2
      : AlertTriangle;

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

export function UrgencyBadge({ urgency }: { urgency: Urgency | string }) {
  const meta = URGENCY_LEVELS.find((u) => u.value.toLowerCase() === (urgency || '').toLowerCase()) || URGENCY_LEVELS[0];

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
