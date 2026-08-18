import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, MapPin, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { MapView } from '@/components/MapView';
import { StatusBadge } from '@/components/Badges';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import { STATUS_META } from '@/lib/constants';
import { speakNavigationRoute, stopSpeaking, getGoogleMapsDirectionsUrl, generateTurnByTurnSteps } from '@/lib/voiceGuidance';

export function CollectorRouteMapPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeVoiceId, setActiveVoiceId] = useState<string | null>(null);

  const { complaints, loading } = useComplaints({
    query: 'assigned',
    userId: profile?.id || 'demo_collector_id',
  });

  const geoComplaints = complaints.filter((c) => c.latitude != null && c.longitude != null);

  const handleToggleVoice = (e: React.MouseEvent, id: string, address: string, lat: number, lng: number) => {
    e.stopPropagation();
    if (activeVoiceId === id) {
      stopSpeaking();
      setActiveVoiceId(null);
    } else {
      setActiveVoiceId(id);
      const navInfo = generateTurnByTurnSteps(address, lat, lng);
      speakNavigationRoute(address, navInfo.distanceKm, navInfo.steps, () => {
        setActiveVoiceId(null);
      });
    }
  };

  if (loading) return <LoadingSpinner label="Loading collector route coordinates..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Collector Navigation & Route Map"
        subtitle="GPS Location Waypoints, Google Maps Directions & Turn-by-Turn Spoken Guidance"
      />

      {geoComplaints.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-8 w-8" />}
          title="No mappable tasks in queue"
          message="When tasks with GPS coordinates are assigned to you by administrators, they will appear plotted here."
        />
      ) : (
        <div className="space-y-6">
          <MapView
            complaints={geoComplaints}
            height="440px"
            zoom={14}
            onMarkerClick={(id) => navigate(`/complaints/${id}`)}
          />

          <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Assigned Task Waypoints ({geoComplaints.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Click a card to view full report</span>
            </div>

            <div className="space-y-2.5">
              {geoComplaints.map((c) => {
                const gmapsUrl = getGoogleMapsDirectionsUrl(c.latitude!, c.longitude!);
                const isVoiceActive = activeVoiceId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{c.complaint_code}</p>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{c.address || `${c.latitude}, ${c.longitude}`}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={(e) => handleToggleVoice(e, c.id, c.address || 'Task location', c.latitude!, c.longitude!)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          isVoiceActive
                            ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                            : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                        }`}
                        title="Listen to turn-by-turn voice directions"
                      >
                        {isVoiceActive ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{isVoiceActive ? 'Stop' : '🔊 Voice'}</span>
                      </button>

                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-2xs"
                        title="Open Google Maps Driving Directions"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Navigate ➔
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
