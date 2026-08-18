import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, Download, Calendar, Filter, ClipboardList, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/Badges';
import { getLocalComplaints, getLocalBins, getLocalUsers } from '@/lib/dataStore';
import { exportComplaintsPDF, exportComplaintsExcel } from '@/lib/export';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'complaints' | 'bins' | 'workers';

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-18');

  const complaints = useMemo(() => getLocalComplaints(), []);
  const bins = useMemo(() => getLocalBins(), []);
  const users = useMemo(() => getLocalUsers(), []);

  const handleExportPDF = () => {
    exportComplaintsPDF(complaints);
  };

  const handleExportExcel = () => {
    exportComplaintsExcel(complaints);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Reports & Analytics Center"
        subtitle="Generate and export comprehensive village sanitation and waste management audit reports."
        action={
          <div className="flex items-center gap-2">
            <button onClick={handleExportPDF} className="btn-primary text-xs px-3.5 py-2 flex items-center gap-2 shadow-2xs">
              <FileText className="h-4 w-4" /> Download PDF Report
            </button>
            <button onClick={handleExportExcel} className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" /> Export Excel / CSV
            </button>
          </div>
        }
      />

      {/* Project Attribution Header */}
      <div className="card p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Smart Waste Collection Tracker — Official Major Project Report</h4>
          <p className="text-slate-600 mt-0.5">Author: <strong className="text-slate-900">A. Poorna Chandar</strong> • Annamacharya Institute of Technology and Sciences, Tirupati</p>
          <p className="text-slate-500 text-[11px]">Department of Artificial Intelligence & Data Science</p>
        </div>
        <span className="badge bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 self-start sm:self-auto text-[10px]">
          AI + IoT + GPS Certified
        </span>
      </div>

      {/* Configuration Card */}
      <div className="card p-5 grid sm:grid-cols-3 gap-4 border-slate-200/80 bg-white">
        <div>
          <label className="label">Report Category</label>
          <select
            className="input text-xs"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
          >
            <option value="daily">Daily Waste Summary Report</option>
            <option value="weekly">Weekly Waste Analysis Report</option>
            <option value="monthly">Monthly Waste Collection Report</option>
            <option value="complaints">Citizen Complaints Log Report</option>
            <option value="bins">Smart Bin Fill Telemetry Report</option>
            <option value="workers">Sanitation Worker Performance Report</option>
          </select>
        </div>

        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input text-xs"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            className="input text-xs"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Report Preview Table */}
      <div className="card p-5 space-y-4 border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm capitalize">
            {reportType} Report Preview ({complaints.length} Records)
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Period: {startDate} to {endDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">ID / Code</th>
                <th className="p-3">Location Landmark</th>
                <th className="p-3">Waste Category</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Reported Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{c.complaint_code}</td>
                  <td className="p-3 text-slate-600 truncate max-w-[200px]">{c.address || 'Central Zone'}</td>
                  <td className="p-3 font-semibold text-slate-700">{c.waste_type} Waste</td>
                  <td className="p-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
