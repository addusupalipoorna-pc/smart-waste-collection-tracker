import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Loader2, AlertCircle, CheckCircle2, Crosshair, ArrowLeft,
  Sparkles, Cpu, Camera, FileText, Send, Check, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PhotoUpload } from '@/components/PhotoUpload';
import { MapView } from '@/components/MapView';
import { PageHeader } from '@/components/DashboardLayout';
import { StatusBadge, UrgencyBadge } from '@/components/Badges';
import { WASTE_TYPES, URGENCY_LEVELS } from '@/lib/constants';
import { createComplaintInStore, classifyWasteImage } from '@/lib/dataStore';
import type { WasteType, Urgency, AIClassificationResult, Complaint } from '@/types';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export function ReportWastePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [wasteType, setWasteType] = useState<WasteType | ''>('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Classifier state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);

  // Success state modal
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    if (newPhotos.length > 0 && !aiResult) {
      setAiAnalyzing(true);
      setTimeout(() => {
        const result = classifyWasteImage(newPhotos[0]);
        setAiResult(result);
        setWasteType(result.detected_category);
        setUrgency(result.severity);
        setAiAnalyzing(false);
      }, 600);
    }
  };

  const VILLAGE_PRESETS = [
    { name: 'Mallaiah Gunta Katta, Ward 4', lat: 22.9734, lng: 78.6569 },
    { name: 'Main Market Road, Ward 4', lat: 22.9730, lng: 78.6565 },
    { name: 'Primary School Gate, Ward 2', lat: 22.9780, lng: 78.6520 },
    { name: 'Bus Stand Main Depot, Central Zone', lat: 22.9765, lng: 78.6540 },
    { name: 'Gram Panchayat Office, Ward 1', lat: 22.9712, lng: 78.6590 },
  ];

  const applyLocation = async (latitude: number, longitude: number, defaultName?: string) => {
    let address = defaultName;

    if (!address) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.display_name) {
            address = data.display_name.split(',').slice(0, 4).join(', ');
          }
        }
      } catch {
        // ignore
      }
    }

    if (!address) {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (res.ok) {
          const data = await res.json();
          const parts = [
            data.locality || data.city || data.localityInfo?.informative?.[0]?.name,
            data.principalSubdivision,
            data.countryName,
          ].filter(Boolean);
          if (parts.length > 0) {
            address = parts.join(', ');
          }
        }
      } catch {
        // ignore
      }
    }

    if (!address) {
      address = `Location (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°)`;
    }

    setLocation({ latitude, longitude, address });
    setLocating(false);
  };

  const captureLocation = useCallback(() => {
    setLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      applyLocation(22.9734, 78.6569, 'Mallaiah Gunta Katta, Ward 4');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude),
      () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => applyLocation(pos.coords.latitude, pos.coords.longitude),
          () => {
            setLocationError('Browser location unavailable. Applied default Village GPS coordinates.');
            applyLocation(22.9734, 78.6569, 'Mallaiah Gunta Katta, Ward 4');
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!wasteType) {
      setError('Please select a waste category.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide a description (at least 10 characters).');
      return;
    }
    if (photos.length === 0) {
      setError('Please upload at least one photo of the waste pile.');
      return;
    }

    setSubmitting(true);
    try {
      const newComplaint = await createComplaintInStore({
        citizen_id: profile?.id || 'demo_citizen_id',
        waste_type: wasteType,
        description: description.trim(),
        urgency,
        photos,
        latitude: location?.latitude || 22.9734,
        longitude: location?.longitude || 78.6569,
        address: location?.address || 'Mallaiah Gunta Katta, Ward 4',
        citizen_name: profile?.full_name,
      });

      setSubmittedComplaint(newComplaint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link to="/citizen" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Step-by-Step Reporting
        </span>
      </div>

      <PageHeader
        title="Report a Waste Issue"
        subtitle="Submit village waste complaints with AI image classification & GPS coordinates."
      />

      {/* Submission Success Screen Modal */}
      <AnimatePresence>
        {submittedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-xl border-emerald-200"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Complaint Submitted Successfully!</h3>
                <p className="text-xs text-slate-500 mt-1">Your complaint is registered and queued for authority review.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Complaint ID:</span>
                  <span className="font-bold text-slate-900">{submittedComplaint.complaint_code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Status:</span>
                  <StatusBadge status={submittedComplaint.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-900">{submittedComplaint.waste_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[180px]">{submittedComplaint.address}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/complaints/${submittedComplaint.id}`)}
                  className="btn-primary flex-1 text-xs py-2.5"
                >
                  Track Complaint ➔
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/citizen')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Waste Details */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">1</span>
            <h3 className="font-bold text-sm text-slate-900">Waste Details & Urgency</h3>
          </div>

          <div>
            <label className="label">Waste Category <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WASTE_TYPES.map((wt) => (
                <button
                  key={wt.value}
                  type="button"
                  onClick={() => setWasteType(wt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    wasteType === wt.value
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-2xs font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: wt.color }} />
                  <span className="truncate">{wt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Description <span className="text-red-500">*</span></label>
              <span className="text-[10px] text-slate-400 font-medium">{description.length} chars</span>
            </div>
            <textarea
              required
              rows={3}
              className="input resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste issue. What kind of waste? How bad is it? Nearby landmarks..."
            />
          </div>

          <div>
            <label className="label">Priority / Urgency Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {URGENCY_LEVELS.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUrgency(u.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    urgency === u.value
                      ? 'text-white border-transparent shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
                  style={urgency === u.value ? { backgroundColor: u.color } : {}}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 2: Upload Photo & AI Vision Scanner */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">2</span>
            <h3 className="font-bold text-sm text-slate-900">Upload Waste Photo & AI Analysis</h3>
          </div>

          <PhotoUpload photos={photos} onChange={handlePhotosChange} label="Waste Photos (Required)" />

          {aiAnalyzing && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-3 animate-pulse">
              <Sparkles className="h-5 w-5 text-purple-600 animate-spin" />
              <div>
                <p className="text-xs font-bold text-purple-900">AI Vision Model Scanning Image...</p>
                <p className="text-[11px] text-purple-700">Detecting waste category, recyclability, and severity level.</p>
              </div>
            </div>
          )}

          {aiResult && !aiAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 space-y-2.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-950 text-xs">AI Waste Classification Result</h4>
                    <p className="text-[10px] text-purple-700">Confidence Score: {aiResult.confidence_percentage}%</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-800">
                  {aiResult.severity.toUpperCase()} SEVERITY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-purple-100">
                <div>
                  <span className="text-[10px] text-slate-500 block">Detected Category:</span>
                  <span className="font-bold text-purple-950">{aiResult.detected_category} Waste</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Recyclable:</span>
                  <span className="font-bold text-slate-800">{aiResult.recyclable ? 'Yes ♻️' : 'No 🚫'}</span>
                </div>
              </div>

              <p className="text-xs text-purple-900 font-medium">
                💡 <span className="font-bold">Recommended Action:</span> {aiResult.recommended_action}
              </p>
            </motion.div>
          )}
        </div>

        {/* STEP 3: Location Details */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">3</span>
            <h3 className="font-bold text-sm text-slate-900">Location & Landmark Details</h3>
          </div>

          {location ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Captured Location</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 leading-tight">{location.address}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">GPS: {location.latitude.toFixed(6)}°, {location.longitude.toFixed(6)}°</p>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 transition-all shrink-0 shadow-2xs"
                >
                  🗺️ Google Maps ➔
                </a>
              </div>

              <div>
                <label className="label text-xs">Refine / Edit Address & Landmark</label>
                <input
                  type="text"
                  className="input text-xs sm:text-sm"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  placeholder="e.g. Door No 4-12, Near Temple Gate, Main Street"
                />
              </div>

              <MapView
                singleMarker={{ lat: location.latitude, lng: location.longitude, label: location.address }}
                height="240px"
                zoom={15}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={captureLocation}
                disabled={locating}
                className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
              >
                {locating ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-emerald-700" /> Capturing GPS Location...</>
                ) : (
                  <><MapPin className="h-4 w-4 text-emerald-700" /> Capture My Location (GPS)</>
                )}
              </button>

              {locationError && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" /> {locationError}
                </p>
              )}
            </div>
          )}

          {/* 1-Click Presets */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Or Select Known Village Landmark Point:</p>
            <div className="flex flex-wrap gap-1.5">
              {VILLAGE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyLocation(p.lat, p.lng, p.name)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium text-slate-700 transition-all border border-slate-200"
                >
                  📍 {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 4: Review Summary & Submit Button */}
        <div className="card p-5 space-y-4 bg-slate-50/50 border-emerald-200/80">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">4</span>
            <h3 className="font-bold text-sm text-slate-900">Review & Submit Complaint</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Category</span>
              <span className="font-bold text-slate-900">{wasteType || 'Not Selected'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Urgency</span>
              <span className="font-bold text-slate-900">{urgency}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Photos</span>
              <span className="font-bold text-slate-900">{photos.length} Attached</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Location</span>
              <span className="font-bold text-slate-900 truncate block">{location ? 'Tagged ✓' : 'Auto Tag'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/citizen')}
              className="btn-secondary flex-1 py-3 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 py-3 text-xs font-bold shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Complaint Now
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
