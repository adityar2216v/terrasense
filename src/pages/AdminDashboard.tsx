import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { Activity, Users, Database, Shield, Server, ArrowRight, Settings, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents().then(setIncidents).finally(() => setLoading(false));
  }, []);

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  
  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 lg:p-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="text-brand-primary" /> Admin Command Center
          </h1>
          <p className="text-sm text-brand-text-secondary mt-1">Global system overview and access control.</p>
        </div>
        <Link 
          to="/app/settings"
          className="flex items-center gap-2 bg-brand-surface text-white px-4 py-2 rounded text-sm hover:bg-white/10 transition"
        >
          <Settings size={16} /> Global Settings
        </Link>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">System Health</h3>
            <Activity className="text-green-500" size={18} />
          </div>
          <p className="text-2xl font-display font-bold text-white">OPTIMAL</p>
          <div className="mt-2 text-xs text-green-400">All services running</div>
        </div>
        
        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">LangGraph Agents</h3>
            <Bot className="text-purple-400" size={18} />
          </div>
          <p className="text-2xl font-display font-bold text-white">3 ACTIVE</p>
          <div className="mt-2 text-xs text-gray-400">Air, Water, Waste nodes</div>
        </div>

        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">Total Users</h3>
            <Users className="text-blue-400" size={18} />
          </div>
          <p className="text-2xl font-display font-bold text-white">1,248</p>
          <div className="mt-2 text-xs text-green-400">+12 this week</div>
        </div>

        <div className="bg-[#131E2F] border border-white/5 rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-text-secondary text-sm font-medium">Database Load</h3>
            <Database className="text-amber-400" size={18} />
          </div>
          <p className="text-2xl font-display font-bold text-white">24%</p>
          <div className="mt-2 text-xs text-gray-400">Supabase connected</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131E2F] rounded-xl border border-white/5 p-6 shadow-lg">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Server size={18} className="text-brand-text-secondary" /> Recent System Logs
          </h3>
          <div className="space-y-3">
            {[
              { time: '10:24 AM', msg: 'System backup completed successfully.', type: 'info' },
              { time: '09:12 AM', msg: 'New organization (AquaTech) onboarded.', type: 'success' },
              { time: '08:45 AM', msg: 'High load detected on LangGraph Coordinator node.', type: 'warn' },
              { time: '07:30 AM', msg: 'Admin login: aditya@terrasense.ai', type: 'info' },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 text-sm border-b border-white/5 pb-2 last:border-0">
                <span className="text-gray-500 font-mono shrink-0">{log.time}</span>
                <span className={`${
                  log.type === 'warn' ? 'text-amber-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-gray-300'
                }`}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#131E2F] rounded-xl border border-white/5 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Shield size={18} className="text-brand-text-secondary" /> Incident Escalations
            </h3>
            <p className="text-sm text-gray-400 mb-6">There are currently {criticalCount} incidents requiring administrative override or special organization assignment.</p>
            
            <div className="bg-risk-critical/10 border border-risk-critical/20 rounded p-4 flex justify-between items-center">
              <div>
                <div className="text-risk-critical font-bold">{criticalCount} Critical Incidents</div>
                <div className="text-xs text-gray-400 mt-1">Pending review across all orgs</div>
              </div>
              <Link to="/app/incidents" className="text-white bg-risk-critical/80 hover:bg-risk-critical px-3 py-1.5 rounded text-xs font-bold transition">
                Review Now
              </Link>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <Link to="/app" className="text-brand-primary text-sm font-medium hover:underline flex items-center justify-center gap-1">
              Go to Main App Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
