import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Upload, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { PhotoUpload } from '@/components/PhotoUpload';
import { classifyWasteImage } from '@/lib/dataStore';
import type { AIClassificationResult } from '@/types';

const SAMPLE_IMAGES = [
  { name: 'Plastic Bottles Pile', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=60' },
  { name: 'Organic Compost Waste', url: 'https://images.unsplash.com/photo-1604186837056-8e7c286756f2?w=800&auto=format&fit=crop&q=60' },
  { name: 'Electronic E-Waste', url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60' },
  { name: 'Medical Disposal Box', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60' },
];

export function AIClassifierPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIClassificationResult | null>(null);

  const handleRunAnalysis = (imgUrl: string) => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      const res = classifyWasteImage(imgUrl);
      setResult(res);
      setAnalyzing(false);
    }, 600);
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    if (newPhotos.length > 0) {
      handleRunAnalysis(newPhotos[0]);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="AI Waste Vision Classifier"
        subtitle="Computer Vision Model for Instant Category, Recyclability & Severity Detection"
      />

      <div className="card p-6 grid lg:grid-cols-2 gap-6 border-slate-200/80">
        {/* Left: Input Column */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Upload Waste Image</h3>
          <PhotoUpload photos={photos} onChange={handlePhotosChange} label="Select or Drag Image" />

          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Or Test Demonstration Sample Images:</p>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => {
                    setPhotos([sample.url]);
                    handleRunAnalysis(sample.url);
                  }}
                  className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left text-xs font-semibold text-slate-700 flex items-center gap-2"
                >
                  <img src={sample.url} className="h-8 w-8 rounded-lg object-cover" alt="" />
                  <span className="truncate">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Output Column */}
        <div className="flex flex-col justify-between space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">AI Classification Output</h3>

          {analyzing && (
            <div className="p-8 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-3 animate-pulse">
              <Sparkles className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
              <p className="font-bold text-purple-900 text-sm">Scanning Waste Image Features...</p>
              <p className="text-xs text-purple-700">Evaluating Neural Network Feature Map & Category Weights</p>
            </div>
          )}

          {!analyzing && !result && (
            <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2 flex-1 flex flex-col justify-center items-center">
              <Cpu className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium max-w-xs">
                Upload a photo or select a sample on the left to trigger the AI Vision model.
              </p>
            </div>
          )}

          {result && !analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100/60 border border-purple-200 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-800 text-white shadow-2xs">
                  {result.detected_category.toUpperCase()} WASTE
                </span>
                <span className="text-xs font-bold text-purple-900">
                  Confidence: {result.confidence_percentage}%
                </span>
              </div>

              {/* Progress Confidence Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-purple-900">
                  <span>Model Confidence</span>
                  <span>{result.confidence_percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-purple-200 overflow-hidden">
                  <div
                    className="h-full bg-purple-700 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence_percentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 bg-white/90 p-3 rounded-xl border border-purple-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Urgency Level:</span>
                  <span className="font-bold text-purple-900">{result.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Weight:</span>
                  <span className="font-bold text-slate-800">{result.estimated_weight_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recyclable:</span>
                  <span className="font-bold text-emerald-700">{result.recyclable ? 'Yes ♻️' : 'No 🚫'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-100/80 border border-purple-200 text-xs text-purple-950">
                <p className="font-bold mb-0.5">Recommended Action:</p>
                <p>{result.recommended_action}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
