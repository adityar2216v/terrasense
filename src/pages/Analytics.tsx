import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Activity, FileText, Download, Mail, CheckCircle2, AlertOctagon, ShieldAlert, Clock, BrainCircuit } from 'lucide-react';

const COLORS = ['#52BFF4', '#F472B6', '#F59E0B', '#10B981', '#8B5CF6'];

export function Analytics() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.getIncidents().then(setIncidents).finally(() => setLoading(false));
  }, []);

  const severityData = useMemo(() => [
    { name: 'Critical', count: incidents.filter(i => i.severity === 'CRITICAL').length },
    { name: 'High', count: incidents.filter(i => i.severity === 'HIGH').length },
    { name: 'Moderate', count: incidents.filter(i => i.severity === 'MODERATE').length },
    { name: 'Low', count: incidents.filter(i => i.severity === 'LOW').length },
  ], [incidents]);

  const categoryData = useMemo(() => {
    const categories = Array.from(new Set(incidents.map(i => i.category)));
    return categories.map(c => ({
      name: c,
      value: incidents.filter(i => i.category === c).length
    }));
  }, [incidents]);

  const areaTrendData = [
    { name: 'Mon', Critical: 2, High: 3, Moderate: 5 },
    { name: 'Tue', Critical: 1, High: 4, Moderate: 4 },
    { name: 'Wed', Critical: 4, High: 2, Moderate: 6 },
    { name: 'Thu', Critical: 0, High: 5, Moderate: 3 },
    { name: 'Fri', Critical: 3, High: 3, Moderate: 7 },
    { name: 'Sat', Critical: 1, High: 2, Moderate: 5 },
    { name: 'Sun', Critical: 2, High: 1, Moderate: 4 },
  ];

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      setReportGenerated(true);
    }, 1500);
  };

  const handleAction = (action: string) => {
    setActionSuccess(`${action} successfully!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 p-4 lg:p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics & Telemetry</h1>
          <p className="text-sm text-brand-text-secondary mt-1">Real-time environmental risk distribution and AI agent confidence.</p>
        </div>
        {!reportGenerated && (
          <button 
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="flex items-center gap-2 bg-brand-primary text-black px-4 py-2 rounded font-bold text-sm hover:bg-brand-primary/90 transition disabled:opacity-50 shadow-[0_0_15px_rgba(82,191,244,0.3)]"
          >
            {generatingReport ? (
              <span className="animate-pulse flex items-center gap-2"><Activity size={16}/> Compiling Data...</span>
            ) : (
              <>
                <FileText size={16} />
                Generate Executive Report
              </>
            )}
          </button>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">Total Active Incidents</h3>
            <Activity className="text-[#52BFF4]" size={18} />
          </div>
          <p className="text-3xl font-display font-bold text-white">{incidents.length}</p>
          <div className="mt-2 flex items-center text-xs text-green-400">
            <TrendingUp size={12} className="mr-1" /> +12% from last week
          </div>
        </div>
        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">Critical Alerts</h3>
            <AlertOctagon className="text-risk-critical" size={18} />
          </div>
          <p className="text-3xl font-display font-bold text-white">{severityData[0].count}</p>
          <div className="mt-2 flex items-center text-xs text-red-400">
            <TrendingUp size={12} className="mr-1" /> Requires intervention
          </div>
        </div>
        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">AI Confidence Score</h3>
            <BrainCircuit className="text-purple-400" size={18} />
          </div>
          <p className="text-3xl font-display font-bold text-white">94.2%</p>
          <div className="mt-2 flex items-center text-xs text-gray-400">
            Based on LangGraph consensus
          </div>
        </div>
        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">Mean Time to Detect</h3>
            <Clock className="text-amber-400" size={18} />
          </div>
          <p className="text-3xl font-display font-bold text-white">4.3m</p>
          <div className="mt-2 flex items-center text-xs text-green-400">
            <TrendingUp size={12} className="mr-1 rotate-180" /> -1.2m improvement
          </div>
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (2/3 width) */}
        <section className="bg-brand-surface rounded-2xl border border-white/5 p-6 shadow-lg lg:col-span-2">
          <h3 className="font-semibold text-sm mb-6 flex items-center gap-2 text-white">
            <TrendingUp size={16} className="text-brand-cyan" /> Risk Velocity (7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52BFF4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#52BFF4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#9CB4B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CB4B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#10262A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Critical" stroke="#EF4444" fillOpacity={1} fill="url(#colorCritical)" />
                <Area type="monotone" dataKey="High" stroke="#F59E0B" fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="Moderate" stroke="#52BFF4" fillOpacity={1} fill="url(#colorModerate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Categories Donut Chart (1/3 width) */}
        <section className="bg-brand-surface rounded-2xl border border-white/5 p-6 shadow-lg">
          <h3 className="font-semibold text-sm mb-6 flex items-center gap-2 text-white">
            <ShieldAlert size={16} className="text-brand-cyan" /> Incident Categories
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#10262A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9CB4B8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Severity Distribution Bar Chart */}
        <section className="bg-brand-surface rounded-2xl border border-white/5 p-6 shadow-lg lg:col-span-3">
          <h3 className="font-semibold text-sm mb-6 flex items-center gap-2 text-white">
            <Activity size={16} className="text-brand-cyan" /> Current Severity Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#9CB4B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#9CB4B8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#10262A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'Critical' ? '#EF4444' :
                      entry.name === 'High' ? '#F59E0B' :
                      entry.name === 'Moderate' ? '#EAB308' : '#10B981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>

      {reportGenerated && (
        <div className="mt-8 bg-brand-surface border border-brand-primary/30 rounded-lg p-6 shadow-[0_0_20px_rgba(82,191,244,0.1)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-brand-primary" /> Executive Incident Report
              </h2>
              <p className="text-xs text-brand-text-secondary mt-1">Generated dynamically via TerraSense Engine on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3 relative">
              <button onClick={() => handleAction('Downloaded PDF Report')} className="flex items-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-white px-3 py-1.5 rounded text-xs font-semibold transition">
                <Download size={14} /> Download PDF
              </button>
              <button onClick={() => handleAction('Emailed Report to Stakeholders')} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/80 text-black px-3 py-1.5 rounded text-xs font-semibold transition">
                <Mail size={14} /> Email Stakeholders
              </button>
              
              {actionSuccess && (
                <div className="absolute -top-10 right-0 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded text-xs whitespace-nowrap flex items-center gap-1 animate-in fade-in zoom-in">
                  <CheckCircle2 size={12} /> {actionSuccess}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#0B131E] border border-white/5 rounded p-6">
            <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2 text-white">1. Overview</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              During the analyzed period, TerraSense monitored {incidents.length} environmental anomalies. 
              Of these, <strong className="text-risk-critical">{severityData[0].count}</strong> required critical escalation, representing a localized concentration of high-risk activity that necessitates immediate field intervention.
            </p>
            
            <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2 text-white">2. Key Observations</h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2 mb-6">
              <li>Air quality monitoring indicates elevated particulate density in regions with highest industrial output.</li>
              <li>Water toxicity levels spiked alongside critical severity incident reports, suggesting possible containment failures.</li>
              <li>Agent coordination layer flagged 3 potential cascading failure events within the last 72 hours.</li>
            </ul>

            <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2 text-white">3. Recommended Actions</h3>
            <div className="bg-brand-surface/50 p-4 rounded border-l-4 border-risk-high text-sm text-gray-200">
              <strong className="text-risk-high">Priority Action Required:</strong> Deploy containment resources to the top affected coordinates. Initiate a secondary review loop through the LangGraph agent architecture to validate recent sensor telemetry.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
