import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import { Plus, AlertTriangle, ShieldAlert, RefreshCw, X, Search, Filter } from 'lucide-react';

export function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Air Quality', description: '', severity: 'MODERATE' as const, latitude: '', longitude: ''
  });
  const [filters, setFilters] = useState<{id: string, label: string, value: string}[]>([
    { id: '1', label: 'Status', value: 'Open' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };
  
  const clearFilters = () => setFilters([]);

  const filteredIncidents = incidents.filter(inc => {
    if (filters.length === 0) return true;
    for (const f of filters) {
      if (f.label === 'Status' && inc.status !== f.value.toUpperCase()) return false;
      if (f.label === 'Severity' && inc.severity !== f.value.toUpperCase()) return false;
      if (f.label === 'Category' && inc.category !== f.value) return false;
    }
    return true;
  });

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createIncident({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        severity: formData.severity,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        source_type: 'MANUAL',
        status: 'OPEN'
      });
      setShowDrawer(false);
      setFormData({ title: '', category: 'Air Quality', description: '', severity: 'MODERATE', latitude: '', longitude: '' });
      loadIncidents();
    } catch (e) {
      console.error(e);
      alert('Failed to create incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg-main relative p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Incidents</h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">Manage and track environmental incidents across regions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadIncidents}
            className="p-1.5 border border-brand-surface bg-brand-bg-secondary hover:bg-brand-surface rounded text-brand-text-secondary transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-brand-primary' : ''} />
          </button>
          <button 
            onClick={() => setShowDrawer(true)}
            className="bg-brand-primary text-[#040A0C] px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 hover:bg-brand-primary/90"
          >
            <Plus size={16} strokeWidth={2.5} /> Create incident
          </button>
        </div>
      </div>

      <div className="flex-1 bg-brand-bg-secondary border border-brand-surface rounded-md flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col border-b border-brand-surface bg-[#131E2F]">
          <div className="flex items-center gap-4 p-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={14} />
              <input 
                type="text" 
                placeholder="Find resources" 
                className="w-full bg-brand-bg-main border border-brand-surface rounded pl-8 pr-3 py-1 text-xs text-brand-text-main focus:outline-none focus:border-brand-primary transition-all"
              />
            </div>
            <button 
              onClick={() => {
                if (!filters.find(f => f.label === 'Severity')) {
                  setFilters([...filters, { id: Date.now().toString(), label: 'Severity', value: 'Critical' }]);
                }
              }}
              className="flex items-center gap-1.5 text-xs text-brand-text-secondary hover:text-white px-2 py-1 rounded hover:bg-brand-surface transition-colors"
            >
              <Filter size={14} /> Add Filter
            </button>
          </div>
          
          {filters.length > 0 && (
            <div className="flex items-center gap-2 px-3 pb-2 pt-1 flex-wrap">
              <span className="text-[10px] text-brand-text-secondary font-medium uppercase tracking-wider mr-1">Active filters:</span>
              {filters.map(f => (
                <div key={f.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-surface border border-white/10 text-xs text-white">
                  <span className="text-brand-text-secondary">{f.label}:</span>
                  <span className="font-semibold">{f.value}</span>
                  <button onClick={() => removeFilter(f.id)} className="hover:text-brand-primary text-brand-text-secondary transition-colors ml-0.5">
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              <button onClick={clearFilters} className="text-xs text-brand-primary hover:underline ml-2 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#182538] sticky top-0 border-b border-brand-surface shadow-sm z-10">
              <tr>
                <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Incident ID</th>
                <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Title</th>
                <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Category</th>
                <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Severity</th>
                <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs">Status</th>
                <th className="px-4 py-2 font-medium text-brand-text-secondary text-xs text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-surface">
              {loading && incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-text-secondary text-xs">Loading incidents...</td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-text-secondary text-xs">No incidents found. Try adjusting your filters.</td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.incident_id} className="hover:bg-brand-surface/40 transition-colors group">
                    <td className="px-4 py-2 font-mono text-[11px] text-brand-primary group-hover:underline cursor-pointer">
                      {inc.incident_id.split('-')[0]}...
                    </td>
                    <td className="px-4 py-2 text-[13px] text-white font-medium truncate max-w-[200px]">{inc.title}</td>
                    <td className="px-4 py-2 text-[12px] text-brand-text-secondary">{inc.category}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${
                        inc.severity === 'CRITICAL' ? 'bg-risk-critical/10 text-risk-critical border-risk-critical/20' :
                        inc.severity === 'HIGH' ? 'bg-risk-high/10 text-risk-high border-risk-high/20' :
                        inc.severity === 'MODERATE' ? 'bg-risk-moderate/10 text-risk-moderate border-risk-moderate/20' :
                        'bg-risk-low/10 text-risk-low border-risk-low/20'
                      }`}>
                        {inc.severity === 'CRITICAL' ? <ShieldAlert size={10} /> : <AlertTriangle size={10} />}
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wide uppercase ${
                        inc.status === 'OPEN' ? 'text-brand-cyan bg-brand-cyan/10' :
                        'text-brand-text-secondary bg-brand-surface'
                      }`}>{inc.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-[11px] text-brand-text-secondary font-mono">
                      {new Date(inc.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Drawer for Create */}
      {showDrawer && (
        <div className="absolute inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          <div className="w-[450px] bg-brand-bg-secondary border-l border-brand-surface shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
            <div className="px-5 py-4 border-b border-brand-surface flex justify-between items-center bg-[#131E2F]">
              <h2 className="text-lg font-bold text-white">Create incident</h2>
              <button onClick={() => setShowDrawer(false)} className="text-brand-text-secondary hover:text-white p-1 rounded-md hover:bg-brand-surface transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-2">General Details</h3>
                
                <div>
                  <label className="block text-xs font-medium text-brand-text-secondary mb-1">Incident Title <span className="text-red-500">*</span></label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-brand-bg-main border border-brand-surface rounded px-3 py-1.5 text-[13px] text-white focus:border-brand-primary focus:outline-none transition-colors" placeholder="e.g. Unidentified factory emissions" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-brand-text-secondary mb-1">Category <span className="text-red-500">*</span></label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-brand-bg-main border border-brand-surface rounded px-3 py-1.5 text-[13px] text-white focus:border-brand-primary focus:outline-none transition-colors">
                      <option>Air Quality</option>
                      <option>Water Contamination</option>
                      <option>Deforestation</option>
                      <option>Waste Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-text-secondary mb-1">Severity <span className="text-red-500">*</span></label>
                    <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value as any})} className="w-full bg-brand-bg-main border border-brand-surface rounded px-3 py-1.5 text-[13px] text-white focus:border-brand-primary focus:outline-none transition-colors">
                      <option value="LOW">Low</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-brand-text-secondary mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-brand-bg-main border border-brand-surface rounded px-3 py-1.5 text-[13px] text-white focus:border-brand-primary focus:outline-none transition-colors min-h-[100px] resize-y" placeholder="Detailed description of the incident..."></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-2">Location Coordinates</h3>
                <p className="text-[11px] text-brand-text-secondary mb-2">Optional. Providing coordinates allows the incident to be tracked on the Live Map.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-brand-text-secondary mb-1">Latitude</label>
                    <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} className="w-full bg-brand-bg-main border border-brand-surface rounded px-3 py-1.5 text-[13px] text-white focus:border-brand-primary focus:outline-none transition-colors" placeholder="e.g. 28.6139" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-text-secondary mb-1">Longitude</label>
                    <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} className="w-full bg-brand-bg-main border border-brand-surface rounded px-3 py-1.5 text-[13px] text-white focus:border-brand-primary focus:outline-none transition-colors" placeholder="e.g. 77.2090" />
                  </div>
                </div>
              </div>

            </form>
            <div className="p-4 border-t border-brand-surface flex justify-end gap-3 bg-[#131E2F]">
              <button type="button" onClick={() => setShowDrawer(false)} className="px-4 py-1.5 text-sm font-medium text-brand-text-main border border-brand-surface bg-brand-bg-main rounded hover:bg-brand-surface transition-colors">
                Cancel
              </button>
              <button disabled={isSubmitting} type="submit" onClick={handleSubmit} className="px-4 py-1.5 text-sm font-bold text-[#040A0C] bg-brand-primary rounded hover:bg-brand-primary/90 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create incident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
