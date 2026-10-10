import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { Building2, Waves, FileText, Filter, Navigation, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OrgDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents().then(setIncidents).finally(() => setLoading(false));
  }, []);

  // For demo purposes, let's assume this is the "Water Quality Authority" organization.
  // They only care about "Water Quality" incidents.
  const orgIncidents = incidents.filter(i => i.category === 'Water Quality');
  const openIncidents = orgIncidents.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS');

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 lg:p-6">
      <div className="flex justify-between items-end border-b border-brand-surface pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">Partner Organization</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Building2 className="text-brand-text-secondary" /> Water Quality Authority
          </h1>
          <p className="text-sm text-brand-text-secondary mt-1">Manage assigned incidents and dispatch field teams.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Assigned Incidents</div>
            <div className="text-2xl font-bold text-white">{orgIncidents.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-[#131E2F] p-4 rounded-xl border border-white/5">
            <h2 className="font-bold flex items-center gap-2 text-white"><Waves size={18} className="text-blue-400"/> Active Water Incidents</h2>
            <button className="flex items-center gap-1 text-xs bg-brand-surface px-3 py-1.5 rounded text-white hover:bg-white/10 transition"><Filter size={14}/> Filter</button>
          </div>

          <div className="space-y-3">
            {openIncidents.length > 0 ? openIncidents.map(inc => (
              <div key={inc.incident_id} className="bg-[#131E2F] border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-brand-primary/30 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${
                    inc.severity === 'CRITICAL' ? 'bg-risk-critical' : 
                    inc.severity === 'HIGH' ? 'bg-risk-high' : 
                    inc.severity === 'MODERATE' ? 'bg-risk-moderate' : 'bg-risk-low'
                  }`}></div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{inc.title}</h3>
                    <div className="text-xs text-brand-text-secondary flex gap-3">
                      <span className="font-mono">{inc.incident_id.split('-')[0]}</span>
                      <span>•</span>
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="uppercase text-blue-400">{inc.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/app/assistant?incident_id=${inc.incident_id}`} className="bg-brand-surface text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-white/10 transition">
                    View AI Intel
                  </Link>
                  <button className="bg-brand-primary text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-brand-primary/90 transition">
                    Dispatch Team
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 bg-[#131E2F] rounded-xl border border-white/5">
                <Navigation size={32} className="mx-auto mb-3 text-brand-text-secondary opacity-50" />
                <p className="text-gray-400">No active water incidents assigned to your organization.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#131E2F] rounded-xl border border-white/5 p-6 shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-brand-text-secondary" /> Organization Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex justify-between items-center text-sm text-gray-300 hover:text-white p-2 hover:bg-brand-surface rounded transition">
                  Standard Operating Procedures <ArrowRight size={14} />
                </a>
              </li>
              <li>
                <a href="#" className="flex justify-between items-center text-sm text-gray-300 hover:text-white p-2 hover:bg-brand-surface rounded transition">
                  Field Dispatch Guidelines <ArrowRight size={14} />
                </a>
              </li>
              <li>
                <a href="#" className="flex justify-between items-center text-sm text-gray-300 hover:text-white p-2 hover:bg-brand-surface rounded transition">
                  Upload Post-Cleanup Report <ArrowRight size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
