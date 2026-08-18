import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { MapView } from '@/components/MapView';
import { StatusBadge } from '@/components/Badges';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { STATUS_META } from '@/lib/constants';

export function AdminLiveMapPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { complaints, loading } = useComplaints({
    query: 'all',
    userId: profile?.id || 'demo_admin_id',
    limit: 200,
  });

  const geoComplaints = complaints.filter((c) => c.latitude != null && c.longitude != null);

  if (loading) return <LoadingSpinner label="Loading live map coordinates..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Live Village Complaint Map"
        subtitle={`${geoComplaints.length} active complaints with GPS coordinates plotted on Google Maps.`}
      />

      {/* Legend */}
      <div className="card p-3.5 border-slate-200/80 bg-white">
        <div className="flex items-center flex-wrap gap-3 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Status Legend:</span>
          {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_META[s].color }} />
              <span className="text-slate-600 text-xs">{STATUS_META[s].label}</span>
            </span>
          ))}
        </div>
      </div>

      {geoComplaints.length === 0 ? (
        <EmptyState
          icon={<MapIcon className="h-8 w-8" />}
          title="No complaints on the map"
          message="No complaints have GPS coordinates yet. The map will show locations as citizens submit reports."
        />
      ) : (
        <div className="space-y-4">
          <MapView complaints={geoComplaints} height="520px" zoom={14} onMarkerClick={(id) => navigate(`/complaints/${id}`)} />

          <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">All Village Location Points ({geoComplaints.length})</h3>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {geoComplaints.map((c) => {
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-xs">{c.complaint_code}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5">{c.address || `${c.latitude}, ${c.longitude}`}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{c.waste_type} Waste • Reported by {c.citizen?.full_name || 'Citizen'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-primary text-[11px] px-2.5 py-1.5 flex items-center gap-1 shadow-2xs"
                        title="Open Google Maps Driving Directions"
                      >
                        <Navigation className="h-3 w-3" /> Navigate
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
