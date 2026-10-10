import { Wind, AlertTriangle, ChevronRight, Activity, TrendingUp, Globe, ShieldAlert } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { formatCompactNumber } from '../utils/format';

export function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents()
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Compute live statistics
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH').length;
  const openCount = incidents.filter(i => i.status === 'OPEN').length;

  const airCount = incidents.filter(i => i.category.includes('Air')).length;
  const waterCount = incidents.filter(i => i.category.includes('Water')).length;
  const wasteCount = incidents.filter(i => i.category.includes('Waste')).length;

  const systemStatus = criticalCount > 0 ? 'CRITICAL' : (highCount > 0 ? 'DEGRADED' : 'HEALTHY');

  // Generate dynamic chart data based on categories
  const categoryData = [
    { name: 'Air', count: airCount },
    { name: 'Water', count: waterCount },
    { name: 'Waste', count: wasteCount },
    { name: 'Other', count: incidents.length - airCount - waterCount - wasteCount },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass-panel min-h-[200px] flex items-center">
        {/* Abstract Background Artwork */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff9900" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#232f3e" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#146eb4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#232f3e" stopOpacity="0" />
              </linearGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="20%" cy="100%" r="400" fill="url(#g1)" />
            <circle cx="90%" cy="20%" r="500" fill="url(#g2)" />
          </svg>
        </div>

        <div className="relative z-10 p-6 md:p-8 max-w-3xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-semibold mb-4 shadow-sm ${
            systemStatus === 'CRITICAL' ? 'bg-risk-critical/10 border-risk-critical/20 text-risk-critical' :
            systemStatus === 'DEGRADED' ? 'bg-risk-high/10 border-risk-high/20 text-risk-high' :
            'bg-risk-low/10 border-risk-low/20 text-risk-low'
          }`}>
            <Activity size={14} /> Global System Status: {systemStatus}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight leading-tight text-white drop-shadow-md">
            Environmental Intelligence <br /> <span className="text-brand-primary">Command Center</span>
          </h2>
          <p className="text-brand-text-secondary text-base mb-6 max-w-2xl leading-relaxed">
            Real-time geospatial tracking and AI-driven analysis of environmental incidents. Monitor air quality, water contamination, and ecological threats worldwide.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/incidents" className="px-5 py-2.5 text-sm bg-brand-primary text-brand-bg-main font-bold rounded shadow-sm hover:bg-brand-primary/90 transition-all flex items-center gap-2">
              Manage Incidents <ChevronRight size={18} />
            </a>
            <a href="/map" className="px-5 py-2.5 text-sm bg-brand-bg-secondary border border-brand-surface text-brand-text-main font-medium rounded hover:bg-brand-surface transition-all">
              Open Live Map
            </a>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard 
          title="Total Open Incidents" icon={AlertTriangle} score={loading ? "..." : formatCompactNumber(openCount)} unit="Active" 
          status={openCount > 10 ? "HIGH VOLUME" : "NORMAL"} 
          color="text-brand-primary" border="border-brand-primary/30" bg="bg-brand-primary/5"
          details={`${formatCompactNumber(incidents.length)} total recorded lifetime`} 
        />
        <KPICard 
          title="Critical Threats" icon={ShieldAlert} score={loading ? "..." : formatCompactNumber(criticalCount)} unit="CRITICAL" 
          status={criticalCount > 0 ? "ACTION REQUIRED" : "SAFE"} 
          color={criticalCount > 0 ? "text-risk-critical" : "text-brand-text-secondary"} 
          border={criticalCount > 0 ? "border-risk-critical/30" : "border-brand-surface"} 
          bg={criticalCount > 0 ? "bg-risk-critical/5" : "bg-brand-surface"}
          details="Immediate AWS SNS alerts triggered" 
        />
        <KPICard 
          title="High Risk Areas" icon={Activity} score={loading ? "..." : formatCompactNumber(highCount)} unit="Zones" 
          status="MONITORING" color="text-risk-high" border="border-risk-high/30" bg="bg-risk-high/5"
          details="AI agents dispatched for analysis" 
        />
        <KPICard 
          title="Air Quality Reports" icon={Wind} score={loading ? "..." : formatCompactNumber(airCount)} unit="Incidents" 
          status="LIVE" color="text-risk-moderate" border="border-risk-moderate/30" bg="bg-risk-moderate/5"
          details="Tracking atmospheric anomalies" 
        />
      </section>
      
      {/* Lower Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Incident List */}
        <section className="lg:col-span-2 h-[400px] rounded-2xl glass-panel relative overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-brand-surface flex justify-between items-center bg-[#131E2F]">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
              <Globe size={16} className="text-brand-primary"/> Recent Environmental Threats
            </h3>
            <a href="/incidents" className="text-xs text-brand-primary hover:underline">View All</a>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#182538] sticky top-0 border-b border-brand-surface z-10">
                <tr>
                  <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">ID</th>
                  <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Incident</th>
                  <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-surface bg-brand-bg-main">
                {loading ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-xs text-brand-text-secondary">Loading...</td></tr>
                ) : incidents.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-xs text-brand-text-secondary">No incidents reported in the database.</td></tr>
                ) : (
                  incidents.slice(0, 10).map((inc) => (
                    <tr key={inc.incident_id} className="hover:bg-brand-surface/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-brand-primary">{inc.incident_id.split('-')[0]}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">{inc.title}</div>
                        <div className="text-[10px] text-brand-text-secondary mt-0.5">{inc.category}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                          inc.severity === 'CRITICAL' ? 'bg-risk-critical/10 text-risk-critical border-risk-critical/20' :
                          inc.severity === 'HIGH' ? 'bg-risk-high/10 text-risk-high border-risk-high/20' :
                          inc.severity === 'MODERATE' ? 'bg-risk-moderate/10 text-risk-moderate border-risk-moderate/20' :
                          'bg-risk-low/10 text-risk-low border-risk-low/20'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Analytics Side Panel */}
        <div className="flex flex-col gap-6 h-[400px]">
          {/* Category Chart */}
          <section className="glass-panel rounded-2xl p-5 shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-white">
                <TrendingUp size={16} className="text-brand-primary"/> Incident Breakdown
              </h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232f3e" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CB4B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CB4B8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#232f3e'}}
                    contentStyle={{ backgroundColor: '#131E2F', borderColor: '#232f3e', borderRadius: '4px', fontSize: '12px' }}
                    itemStyle={{ color: '#ff9900' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ff9900' : index === 1 ? '#146eb4' : index === 2 ? '#232f3e' : '#58E3A5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, icon: Icon, score, unit, status, color, border, bg, details }: any) {
  return (
    <div className={`glass-card p-5 rounded relative overflow-hidden group hover:border-brand-primary/50 transition-all duration-300 ease-in-out`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${bg} border-l-2 ${border}`}></div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-brand-text-secondary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Icon size={14} className="text-brand-text-secondary group-hover:text-white transition-colors duration-300"/> {title}
        </h3>
        <div className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded ${bg} ${color} border ${border} transition-colors duration-300`}>
          {status}
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <div className="text-3xl font-display font-bold tracking-tight text-white">{score}</div>
        <div className="text-xs text-brand-text-secondary font-medium">{unit}</div>
      </div>
      <div className="text-[10px] text-brand-text-secondary border-t border-brand-surface pt-2 mt-2 font-mono">
        {details}
      </div>
    </div>
  );
}
