import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Camera, User, CheckCircle2, AlertCircle,
  Navigation, Loader2, Trash2, XCircle, PlayCircle, Flag, Volume2, VolumeX,
  Sparkles, Check, Send, Shield, Truck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MapView } from '@/components/MapView';
import { PhotoUpload } from '@/components/PhotoUpload';
import { StatusBadge, UrgencyBadge } from '@/components/Badges';
import { LoadingSpinner, ErrorState } from '@/components/ui';
import { WASTE_TYPES, STATUS_META } from '@/lib/constants';
import { formatDateTime, timeAgo, classNames } from '@/lib/utils';
import { sendNotification } from '@/lib/notifications';
import { getComplaintDetails, updateComplaintInStore, fetchCollectors, deleteComplaintFromStore } from '@/lib/dataStore';
import { speakNavigationRoute, stopSpeaking, getGoogleMapsDirectionsUrl, generateTurnByTurnSteps } from '@/lib/voiceGuidance';
import type { Complaint, Profile } from '@/types';

export function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectors, setCollectors] = useState<Profile[]>([]);
  const [selectedCollector, setSelectedCollector] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [collectionPhotos, setCollectionPhotos] = useState<string[]>([]);
  const [completionPhotos, setCompletionPhotos] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleVoiceNav = (locationName: string, lat: number, lng: number) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const routeInfo = generateTurnByTurnSteps(locationName, lat, lng);
      speakNavigationRoute(locationName, routeInfo.distanceKm, routeInfo.steps, () => {
        setIsSpeaking(false);
      });
    }
  };

  const fetchComplaint = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getComplaintDetails(id);
      if (!data) {
        setError('Complaint not found.');
        return;
      }
      setComplaint(data);
      setCollectionPhotos(data.collection_photos || []);
      setCompletionPhotos(data.completion_photos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Fetch available sanitation workers for assignment
  useEffect(() => {
    fetchCollectors().then((cols) => {
      setCollectors(cols);
      if (cols.length > 0) {
        setSelectedCollector((prev) => prev || cols[0].id);
      }
    });
  }, []);

  const wasteType = complaint ? WASTE_TYPES.find((w) => w.value === complaint.waste_type) : null;

  // === Admin actions ===
  const handleAssign = async () => {
    if (!complaint || !selectedCollector) return;
    setActionLoading(true);
    try {
      const updated = await updateComplaintInStore(complaint.id, {
        assigned_collector_id: selectedCollector,
        status: 'Assigned',
        admin_notes: adminNotes || complaint.admin_notes || null,
      });

      sendNotification(
        selectedCollector,
        'New Task Assigned',
        `You've been assigned complaint ${complaint.complaint_code} (${complaint.waste_type} waste).`,
        'assignment',
        complaint.id
      );
      sendNotification(
        complaint.citizen_id,
        'Collector Assigned',
        `Your complaint ${complaint.complaint_code} has been assigned to a collector.`,
        'status',
        complaint.id
      );

      if (updated) setComplaint(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to assign collector.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!complaint || !confirm('Reject this complaint?')) return;
    setActionLoading(true);
    try {
      const updated = await updateComplaintInStore(complaint.id, {
        status: 'Rejected',
        admin_notes: adminNotes || complaint.admin_notes || null,
      });

      sendNotification(
        complaint.citizen_id,
        'Complaint Rejected',
        `Your complaint ${complaint.complaint_code} has been reviewed and rejected. ${adminNotes ? `Reason: ${adminNotes}` : ''}`,
        'status',
        complaint.id
      );
      if (updated) setComplaint(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reject complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  // === Collector actions ===
  const handleStartProgress = async () => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      const updated = await updateComplaintInStore(complaint.id, {
        status: 'In Progress',
        started_at: new Date().toISOString(),
      });

      sendNotification(
        complaint.citizen_id,
        'Collection Started',
        `Your complaint ${complaint.complaint_code} is now being processed by the collector.`,
        'status',
        complaint.id
      );
      if (updated) setComplaint(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadCollectionPhotos = async () => {
    if (!complaint) return;
    setActionLoading(true);
    try {
      const updated = await updateComplaintInStore(complaint.id, {
        collection_photos: collectionPhotos,
      });
      if (updated) setComplaint(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload photos.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!complaint || completionPhotos.length === 0) {
      setError('Please upload at least one after-cleaning photo to mark as completed.');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await updateComplaintInStore(complaint.id, {
        status: 'Completed',
        completed_at: new Date().toISOString(),
        completion_photos: completionPhotos,
      });

      sendNotification(
        complaint.citizen_id,
        'Waste Issue Resolved!',
        `Your reported waste issue (${complaint.complaint_code}) has been successfully resolved. Thank you for keeping our village clean.`,
        'completion',
        complaint.id
      );
      if (updated) setComplaint(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to mark as completed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading complaint details..." />;
  if (error && !complaint) return <ErrorState message={error} onRetry={fetchComplaint} />;
  if (!complaint) return <ErrorState message="Complaint not found." />;

  const isAdmin = profile?.role === 'admin';
  const isCollector = profile?.role === 'collector' && complaint.assigned_collector_id === profile?.id;
  const canStartProgress = isCollector && complaint.status === 'Assigned';
  const canComplete = isCollector && complaint.status === 'In Progress';

  const timelineSteps = [
    { key: 'submitted', label: 'Reported', done: true, date: complaint.created_at },
    { key: 'assigned', label: 'Assigned', done: complaint.status !== 'Pending' && complaint.status !== 'Rejected', date: complaint.status !== 'Pending' ? complaint.updated_at : null },
    { key: 'in_progress', label: 'In Progress', done: complaint.status === 'In Progress' || complaint.status === 'Completed', date: complaint.started_at },
    { key: 'collected', label: 'Collected', done: complaint.collection_photos?.length > 0 || complaint.status === 'Completed', date: complaint.started_at },
    { key: 'resolved', label: 'Resolved', done: complaint.status === 'Completed', date: complaint.completed_at },
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to List
        </button>
        <span className="text-xs font-semibold text-slate-400">
          Reported {timeAgo(complaint.created_at)}
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Main Header Card */}
      <div className="card p-6 border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{complaint.complaint_code}</h1>
              <StatusBadge status={complaint.status} />
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <UrgencyBadge urgency={complaint.urgency} />
              <span
                className="badge text-white"
                style={{ backgroundColor: wasteType?.color || '#166534' }}
              >
                {complaint.waste_type} Waste
              </span>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={async () => {
                if (confirm('Delete this complaint permanently?')) {
                  await deleteComplaintFromStore(complaint.id);
                  navigate('/admin/complaints');
                }
              }}
              className="btn-ghost text-red-600 hover:bg-red-50 text-xs px-3 py-1.5 self-start"
            >
              <Trash2 className="h-4 w-4" /> Delete Report
            </button>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
          {complaint.description}
        </p>
      </div>

      {/* 5-Step Workflow Status Timeline */}
      <div className="card p-5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4">Collection Progress Workflow</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {timelineSteps.map((step, i) => (
            <div
              key={step.key}
              className={classNames(
                'p-3 rounded-xl border text-center flex flex-col justify-between transition-all',
                step.done
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-2xs font-bold'
                  : 'bg-slate-50 border-slate-200/60 text-slate-400 font-medium'
              )}
            >
              <div className="flex items-center justify-center mb-1">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                ) : (
                  <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                    {i + 1}
                  </span>
                )}
              </div>
              <p className="text-xs">{step.label}</p>
              <p className="text-[10px] text-slate-400 mt-1 truncate">
                {step.date ? timeAgo(step.date) : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Photos + Location */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reported Photos */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-slate-400" /> Reported Photo Evidence ({complaint.photos.length})
            </h3>
            {complaint.photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {complaint.photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(p)}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-emerald-500 transition-all"
                  >
                    <img src={p} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No photos attached.</p>
            )}
          </div>

          {/* Location & Voice Turn-by-Turn Directions */}
          {complaint.latitude != null && complaint.longitude != null && (() => {
            const navInfo = generateTurnByTurnSteps(complaint.address || 'Complaint location', complaint.latitude, complaint.longitude);
            const gmapsUrl = getGoogleMapsDirectionsUrl(complaint.latitude, complaint.longitude);

            return (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-700" /> Exact Location & Navigation
                  </h3>
                  <button
                    onClick={() => handleToggleVoiceNav(complaint.address || 'Complaint location', complaint.latitude!, complaint.longitude!)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      isSpeaking
                        ? 'bg-purple-600 text-white border-purple-600 animate-pulse'
                        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    {isSpeaking ? 'Stop Voice' : '🔊 Voice Directions'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Landmark / Address</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{complaint.address || 'Village Area'}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Coordinates: {complaint.latitude.toFixed(6)}°, {complaint.longitude.toFixed(6)}°</p>
                  </div>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs px-3 py-2 shrink-0 shadow-2xs"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Google Maps ➔
                  </a>
                </div>

                <MapView
                  singleMarker={{ lat: complaint.latitude, lng: complaint.longitude, label: complaint.address || 'Complaint location' }}
                  height="260px"
                  zoom={15}
                />

                {/* Turn-by-Turn Navigation Box */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Navigation className="h-4 w-4 text-emerald-700" /> Turn-by-Turn Driving Steps
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                      {navInfo.distanceKm} km • ~{navInfo.estTimeMinutes} mins
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    {navInfo.steps.map((step, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-emerald-700 shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Collection Proof & Completion Photos */}
          {(complaint.collection_photos.length > 0 || complaint.completion_photos.length > 0 || canComplete) && (
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" /> Collection Verification Photos
              </h3>

              {complaint.collection_photos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">During Collection Photos:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {complaint.collection_photos.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhoto(p)}
                        className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-emerald-500"
                      >
                        <img src={p} alt={`Collection ${i + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {complaint.completion_photos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-800 mb-2">After-Cleaning Verified Proof:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {complaint.completion_photos.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhoto(p)}
                        className="aspect-square rounded-xl overflow-hidden border border-emerald-300 hover:ring-2 hover:ring-emerald-500"
                      >
                        <img src={p} alt={`After ${i + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {canComplete && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <PhotoUpload photos={completionPhotos} onChange={setCompletionPhotos} label="Upload After-Cleaning Verification Photo" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: People Info + Action Controls */}
        <div className="space-y-6">
          {/* People & Assignment Card */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Personnel & Assignment</h3>
            <dl className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <dt className="text-slate-400 font-bold uppercase text-[10px]">Reported By</dt>
                <dd className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5 text-sm">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  {complaint.citizen?.full_name || 'Citizen'}
                </dd>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <dt className="text-slate-400 font-bold uppercase text-[10px]">Assigned Worker</dt>
                <dd className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5 text-sm">
                  <Truck className="h-3.5 w-3.5 text-emerald-700" />
                  {complaint.assigned_collector?.full_name || 'Unassigned (Pending)'}
                </dd>
              </div>

              <div className="flex justify-between text-slate-500 pt-1">
                <span>Submitted:</span>
                <span className="font-semibold text-slate-800">{formatDateTime(complaint.created_at)}</span>
              </div>
            </dl>
          </div>

          {/* Admin Assignment Controls */}
          {isAdmin && complaint.status !== 'Completed' && complaint.status !== 'Rejected' && (
            <div className="card p-5 space-y-3 border-emerald-200">
              <h3 className="font-bold text-sm text-slate-900">Assign Sanitation Worker</h3>
              <select
                className="input text-xs"
                value={selectedCollector}
                onChange={(e) => setSelectedCollector(e.target.value)}
              >
                <option value="">Select a worker...</option>
                {collectors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}{c.zone ? ` (${c.zone})` : ''}
                  </option>
                ))}
              </select>

              <textarea
                className="input resize-none text-xs"
                rows={2}
                placeholder="Instructions or notes for collector..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />

              <button
                onClick={handleAssign}
                disabled={!selectedCollector || actionLoading}
                className="btn-primary w-full text-xs py-2.5"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Assign Worker ➔</>}
              </button>

              {complaint.status === 'Pending' && (
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="btn-ghost text-red-600 hover:bg-red-50 w-full text-xs py-2"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject Report
                </button>
              )}
            </div>
          )}

          {/* Collector Action Controls */}
          {canStartProgress && (
            <div className="card p-5 space-y-3 border-amber-200 bg-amber-50/40">
              <h3 className="font-bold text-sm text-slate-900">Start Collection Task</h3>
              <p className="text-xs text-slate-600">Mark this task as in progress and navigate to the location.</p>
              <button
                onClick={handleStartProgress}
                disabled={actionLoading}
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlayCircle className="h-4 w-4" /> Start Collection</>}
              </button>
            </div>
          )}

          {canComplete && (
            <div className="card p-5 space-y-3 border-emerald-200 bg-emerald-50/40">
              <h3 className="font-bold text-sm text-slate-900">Complete Collection</h3>
              <p className="text-xs text-slate-600">Attach after-cleaning photos and mark the complaint as resolved.</p>
              <button
                onClick={handleComplete}
                disabled={actionLoading || completionPhotos.length === 0}
                className="btn-success w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Mark as Completed</>}
              </button>
              {completionPhotos.length === 0 && (
                <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Upload after-cleaning photo first.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <img src={activePhoto} alt="Full view" className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl" />
          <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
