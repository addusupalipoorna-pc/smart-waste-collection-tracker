import { Link } from 'react-router-dom';
import { MapPin, Clock, Trash2, ArrowRight } from 'lucide-react';
import type { Complaint } from '@/types';
import { StatusBadge, UrgencyBadge } from '@/components/Badges';
import { timeAgo, classNames } from '@/lib/utils';
import { WASTE_TYPES } from '@/lib/constants';

interface ComplaintCardProps {
  complaint: Complaint;
  to: string;
  showCitizen?: boolean;
  showCollector?: boolean;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

export function ComplaintCard({ complaint, to, showCitizen, showCollector, onDelete, compact }: ComplaintCardProps) {
  const wasteType = WASTE_TYPES.find((w) => w.value === complaint.waste_type);

  return (
    <Link
      to={to}
      className="card card-hover p-4 block group border-slate-200/80 bg-white"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold shadow-2xs"
            style={{ backgroundColor: wasteType?.color || '#166534' }}
          >
            {complaint.waste_type.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{complaint.complaint_code}</p>
            <p className="text-[11px] text-slate-500 font-medium">{complaint.waste_type} Waste</p>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      {!compact && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{complaint.description}</p>
      )}

      <div className="flex items-center flex-wrap gap-1.5 mb-3">
        <UrgencyBadge urgency={complaint.urgency} />
        {showCitizen && complaint.citizen && (
          <span className="badge bg-slate-100 text-slate-600 text-[10px]">
            By {complaint.citizen.full_name}
          </span>
        )}
        {showCollector && complaint.assigned_collector && (
          <span className="badge bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px]">
            Worker: {complaint.assigned_collector.full_name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3 text-slate-400" /> {timeAgo(complaint.created_at)}
          </span>
          {complaint.address && (
            <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
              <MapPin className="h-3 w-3 text-emerald-700 shrink-0" /> {complaint.address}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(complaint.id);
              }}
              className="p-1 text-slate-300 hover:text-red-500 transition-colors"
              title="Delete complaint"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-700 transition-colors" />
        </div>
      </div>
    </Link>
  );
}
