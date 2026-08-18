import { useState } from 'react';
import type { Complaint } from '@/types';
import { STATUS_META, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import { Navigation, MapPin, Layers, ExternalLink, Compass } from 'lucide-react';

interface MapViewProps {
  complaints?: Complaint[];
  customMarkers?: { lat: number; lng: number; label?: string; color?: string }[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showPopups?: boolean;
  singleMarker?: { lat: number; lng: number; label?: string };
  onMarkerClick?: (id: string) => void;
}

export function MapView({
  complaints = [],
  customMarkers = [],
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM,
  height = '400px',
  showPopups = true,
  singleMarker,
  onMarkerClick,
}: MapViewProps) {
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' for Google Standard Road, 'k' for Google Satellite

  // Determine primary latitude and longitude to focus
  let targetLat = center[0];
  let targetLng = center[1];

  if (singleMarker) {
    targetLat = singleMarker.lat;
    targetLng = singleMarker.lng;
  } else if (customMarkers.length > 0) {
    targetLat = customMarkers[0].lat;
    targetLng = customMarkers[0].lng;
  } else if (complaints.length > 0 && complaints[0].latitude != null && complaints[0].longitude != null) {
    targetLat = complaints[0].latitude;
    targetLng = complaints[0].longitude;
  }

  // Google Maps Embed URL
  const embedUrl = `https://maps.google.com/maps?q=${targetLat},${targetLng}&t=${mapType}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}&travelmode=driving`;

  return (
    <div style={{ height }} className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col bg-slate-100 group">
      {/* Top Google Maps Bar Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 pointer-events-auto">
          <MapPin className="h-4 w-4 text-red-600 animate-bounce" />
          <span className="text-xs font-bold text-slate-800">Google Maps</span>
          <span className="text-[10px] font-bold text-slate-400 border-l border-slate-200 pl-1.5 uppercase">Live GPS Tagging</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapType((prev) => (prev === 'm' ? 'k' : 'm'))}
            className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-xs font-bold text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            title="Toggle Standard Roadmap / Satellite mode"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-800" />
            {mapType === 'm' ? 'Satellite' : 'Roadmap'}
          </button>

          <a
            href={gmapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs px-3 py-1.5 shadow-xs flex items-center gap-1.5"
            title="Open in Google Maps Application"
          >
            <Navigation className="h-3.5 w-3.5" />
            Navigate
          </a>
        </div>
      </div>

      {/* Google Maps iFrame */}
      <iframe
        title="Google Maps Location View"
        src={embedUrl}
        width="100%"
        height="100%"
        className="w-full h-full border-0 rounded-2xl"
        loading="lazy"
        allowFullScreen
      />

      {/* Bottom Pins Overlay List for Multiple Markers */}
      {(complaints.length > 0 || customMarkers.length > 0) && (
        <div className="absolute bottom-2 left-2 right-2 z-10 overflow-x-auto pb-1 flex gap-2 pointer-events-auto">
          {customMarkers.map((m, idx) => (
            <a
              key={idx}
              href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-bold text-slate-800 shrink-0 flex items-center gap-1.5 hover:border-emerald-500 transition-all"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color || '#166534' }} />
              <span>{m.label || `Point ${idx + 1}`}</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          ))}

          {complaints.map((c) => {
            if (c.latitude == null || c.longitude == null) return null;
            const meta = STATUS_META[c.status];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onMarkerClick && onMarkerClick(c.id)}
                className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-bold text-slate-800 shrink-0 flex items-center gap-1.5 hover:border-emerald-500 transition-all"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span>{c.complaint_code} ({c.waste_type})</span>
                <span className="text-[10px] text-slate-500">[{meta.label}]</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
