import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, FileText, FileSpreadsheet, Award, Download,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadialBarChart, RadialBar,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useComplaints } from '@/hooks/useComplaints';
import { PageHeader } from '@/components/DashboardLayout';
import { LoadingSpinner } from '@/components/ui';
import { exportComplaintsPDF, exportComplaintsExcel } from '@/lib/export';
import { getComplaintStats, getCleanlinessScore } from '@/lib/utils';
import { WASTE_TYPES, STATUS_META } from '@/lib/constants';
import { format, subDays, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

type Period = 'daily' | 'weekly' | 'monthly';

export function AnalyticsPage() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>('daily');
  const { complaints, loading } = useComplaints({
    query: 'all',
    userId: profile?.id || 'demo_admin_id',
    limit: 500,
  });

  const stats = getComplaintStats(complaints);
  const score = getCleanlinessScore(complaints);

  // Period-based trend data
  const trendData = useMemo(() => {
    if (period === 'daily') {
      return Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return {
          label: format(date, 'MMM d'),
          reported: complaints.filter((c) => isSameDay(new Date(c.created_at), date)).length,
          completed: complaints.filter((c) => c.completed_at && isSameDay(new Date(c.completed_at), date)).length,
        };
      });
    }
    if (period === 'weekly') {
      return Array.from({ length: 8 }, (_, i) => {
        const weekStart = startOfWeek(subDays(new Date(), (7 - i) * 7));
        const weekEnd = endOfWeek(weekStart);
        return {
          label: `W${i + 1}`,
          reported: complaints.filter((c) => {
            const d = new Date(c.created_at);
            return d >= weekStart && d <= weekEnd;
          }).length,
          completed: complaints.filter((c) => {
            if (!c.completed_at) return false;
            const d = new Date(c.completed_at);
            return d >= weekStart && d <= weekEnd;
          }).length,
        };
      });
    }
    // monthly — last 6 months
    return Array.from({ length: 6 }, (_, i) => {
      const refDate = subDays(new Date(), (5 - i) * 30);
      const month = refDate.getMonth();
      const year = refDate.getFullYear();
      return {
        label: format(refDate, 'MMM'),
        reported: complaints.filter((c) => {
          const d = new Date(c.created_at);
          return d.getMonth() === month && d.getFullYear() === year;
        }).length,
        completed: complaints.filter((c) => {
          if (!c.completed_at) return false;
          const d = new Date(c.completed_at);
          return d.getMonth() === month && d.getFullYear() === year;
        }).length,
      };
    });
  }, [complaints, period]);

  // Waste type distribution
  const wasteTypeData = WASTE_TYPES.map((wt) => ({
    name: wt.value,
    value: complaints.filter((c) => c.waste_type === wt.value).length,
    color: wt.color,
  })).filter((d) => d.value > 0);

  // Status distribution
  const statusData = (Object.keys(STATUS_META) as (keyof typeof STATUS_META)[])
    .map((s) => ({
      name: STATUS_META[s].label,
      value: complaints.filter((c) => c.status === s).length,
      color: STATUS_META[s].color,
    }))
    .filter((d) => d.value > 0);

  // Urgency distribution
  const urgencyData = [
    { name: 'Low', value: complaints.filter((c) => c.urgency === 'Low').length, color: '#166534' },
    { name: 'Medium', value: complaints.filter((c) => c.urgency === 'Medium').length, color: '#ca8a04' },
    { name: 'High', value: complaints.filter((c) => c.urgency === 'High').length, color: '#ea580c' },
    { name: 'Critical', value: complaints.filter((c) => c.urgency === 'Critical').length, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  // Collection efficiency
  const efficiency = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const radialData = [{ name: 'Efficiency', value: efficiency, fill: '#166534' }];

  if (loading) return <LoadingSpinner label="Loading analytics telemetry..." />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Analytics & Executive Metrics"
        subtitle="Historical reporting trends, waste breakdown, and sanitation resolution benchmarks."
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => exportComplaintsPDF(complaints, 'Analytics Report')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-red-600" /> Export PDF
            </button>
            <button onClick={() => exportComplaintsExcel(complaints, 'Analytics Report')} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" /> Export Excel
            </button>
          </div>
        }
      />

      {/* Period Selector */}
      <div className="flex items-center gap-1.5">
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              period === p
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p} Breakdown
          </button>
        ))}
      </div>

      {/* Score + Efficiency Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-2">
            <Award className="h-5 w-5 text-emerald-800" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Village Cleanliness Score</h3>
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{score}<span className="text-xl text-slate-400 font-normal">/100</span></p>
            <p className="text-xs text-emerald-800 font-semibold mt-1">
              {score >= 80 ? 'Excellent Status • Village environment well-managed' : score >= 60 ? 'Good • Routine maintenance in progress' : 'Requires Immediate Action'}
            </p>
          </div>
        </div>

        <div className="card p-5 border-slate-200/80 bg-white space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Collection Resolution Rate</h3>
          <ResponsiveContainer width="100%" height={120}>
            <RadialBarChart data={radialData} innerRadius="55%" outerRadius="90%" startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} fill="#166534" background />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-bold" fill="#166534" fontSize="20">
                {efficiency}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-slate-500 text-center font-medium">{stats.completed} resolved out of {stats.total} total reports</p>
        </div>

        <div className="card p-5 border-slate-200/80 bg-white space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Report Distribution</h3>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100"><p className="text-[10px] text-slate-400 font-bold uppercase">Total Reports</p><p className="font-bold text-slate-900 text-base">{stats.total}</p></div>
            <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100"><p className="text-[10px] text-amber-700 font-bold uppercase">Pending</p><p className="font-bold text-amber-700 text-base">{stats.pending}</p></div>
            <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100"><p className="text-[10px] text-blue-700 font-bold uppercase">Active</p><p className="font-bold text-blue-700 text-base">{stats.assigned + stats.inProgress}</p></div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100"><p className="text-[10px] text-emerald-800 font-bold uppercase">Resolved</p><p className="font-bold text-emerald-800 text-base">{stats.completed}</p></div>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-700" /> Resolution Trends Timeline ({period})
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="reported" name="Reported" stroke="#166534" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="completed" name="Resolved" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waste type */}
        <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-emerald-700" /> Waste Category Breakdown
          </h3>
          {wasteTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={wasteTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {wasteTypeData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-slate-400">No data</div>
          )}
        </div>

        {/* Status */}
        <div className="card p-5 space-y-3 border-slate-200/80 bg-white">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-emerald-700" /> Status Distribution
          </h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-slate-400">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
