import { useState, useEffect, Suspense, lazy } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import type { Incident } from '../services/api';
import L from 'leaflet';
import { AlertTriangle, ShieldAlert, Crosshair, Filter, RefreshCw, Navigation, Globe as GlobeIcon, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Lazy load the globe component
const TerraEarthGlobe = lazy(() => import('../components/TerraEarthGlobe'));

// Fix leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function LiveMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate();

  const loadMapData = async () => {
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
    loadMapData();
  }, []);

  const mappableIncidents = incidents.filter(i => 
    i.latitude !== null && i.latitude !== undefined && 
    i.longitude !== null && i.longitude !== undefined &&
    (filterText === '' || i.title.toLowerCase().includes(filterText.toLowerCase()) || i.category.toLowerCase().includes(filterText.toLowerCase()))
  );

  const handleAnalyze = (incident: Incident) => {
    navigate(`/app/assistant?incident_id=${incident.incident_id}`);
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg-main p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Live Operations Map</h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">Geospatial visualization of active environmental threats.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bg-brand-surface p-1 rounded-md flex gap-1 mr-4">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === '3d' ? 'bg-brand-primary text-[#040A0C]' : 'text-brand-text-secondary hover:text-white'}`}
            >
              <GlobeIcon size={14} /> 3D Earth
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === '2d' ? 'bg-brand-primary text-[#040A0C]' : 'text-brand-text-secondary hover:text-white'}`}
            >
              <MapIcon size={14} /> 2D Map
            </button>
          </div>
          <button 
            onClick={loadMapData}
            className="flex items-center gap-2 p-1.5 px-3 border border-brand-surface bg-brand-bg-secondary hover:bg-brand-surface rounded text-brand-text-main text-xs font-medium transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand-primary' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 h-[calc(100vh-140px)]">
        {/* Left Side: Map View */}
        <div className="flex-1 bg-brand-bg-secondary border border-brand-surface rounded-md overflow-hidden relative shadow-sm flex flex-col">
          <div className="flex justify-between items-center px-4 py-2 bg-[#131E2F] border-b border-brand-surface z-10 absolute top-0 left-0 right-0 bg-opacity-80 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              {viewMode === '3d' ? 'Global 3D Overview' : 'Tactical 2D View'}
              <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> LIVE
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] bg-brand-surface px-2 py-0.5 rounded text-white flex items-center gap-1"><ShieldAlert size={10} className="text-risk-critical" /> Critical</span>
              <span className="text-[10px] bg-brand-surface px-2 py-0.5 rounded text-white flex items-center gap-1"><AlertTriangle size={10} className="text-risk-high" /> High</span>
            </div>
          </div>
          
          <div className="flex-1 relative bg-[#0a1017] w-full h-full">
            {loading && (
              <div className="absolute inset-0 z-[400] bg-[#0a1017]/80 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-brand-text-secondary">
                  <RefreshCw size={24} className="animate-spin text-brand-primary" />
                  <span className="text-xs font-medium uppercase tracking-widest">Acquiring Satellites...</span>
                </div>
              </div>
            )}
            
            {viewMode === '3d' ? (
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center text-brand-text-secondary">
                  <RefreshCw className="animate-spin mr-2" size={20} /> Loading 3D Earth...
                </div>
              }>
                <TerraEarthGlobe 
                  incidents={mappableIncidents} 
                  onSelectIncident={setSelectedIncident}
                  selectedIncidentId={selectedIncident?.incident_id}
                />
              </Suspense>
            ) : (
              <MapContainer 
                center={[28.6139, 77.2090]} 
                zoom={3} 
                zoomControl={false}
                style={{ height: '100%', width: '100%', backgroundColor: '#0a1017', marginTop: '40px' }}
              >
                <ZoomControl position="topright" />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="map-tiles-dark"
                />
                {mappableIncidents.map(incident => (
                  <Marker 
                    key={incident.incident_id} 
                    position={[incident.latitude!, incident.longitude!]}
                    eventHandlers={{
                      click: () => setSelectedIncident(incident)
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 min-w-[200px]">
                        <div className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${
                          incident.severity === 'CRITICAL' ? 'text-risk-critical' :
                          incident.severity === 'HIGH' ? 'text-risk-high' :
                          incident.severity === 'MODERATE' ? 'text-risk-moderate' : 'text-risk-low'
                        }`}>
                          {incident.severity} PRIORITY
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">{incident.title}</h3>
                        <p className="text-[11px] font-mono text-gray-600 mb-2 border-b pb-2">{incident.incident_id.split('-')[0]}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                          <div>
                            <span className="text-gray-500 block">Category</span>
                            <span className="font-medium text-gray-800">{incident.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Status</span>
                            <span className="font-medium text-gray-800">{incident.status}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAnalyze(incident)}
                          className="w-full bg-[#0F172A] text-white text-[11px] py-1.5 rounded hover:bg-[#1E293B] transition-colors font-medium flex items-center justify-center gap-1"
                        >
                          Analyze Location <ChevronRight size={12} />
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
            
            {/* Global CSS to invert OpenStreetMap to look dark-themed */}
            <style>{`
              .map-tiles-dark {
                filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
              }
            `}</style>
          </div>
        </div>

        {/* Right Side: Incident List Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          
          {/* Selected Incident Details Panel */}
          {selectedIncident && (
            <div className="bg-brand-bg-secondary border border-brand-surface rounded-md flex flex-col shadow-sm shrink-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-blue-500"></div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm inline-block ${
                    selectedIncident.severity === 'CRITICAL' ? 'bg-risk-critical/20 text-risk-critical border border-risk-critical/30' :
                    selectedIncident.severity === 'HIGH' ? 'bg-risk-high/20 text-risk-high border border-risk-high/30' :
                    selectedIncident.severity === 'MODERATE' ? 'bg-risk-moderate/20 text-risk-moderate border border-risk-moderate/30' : 
                    'bg-risk-low/20 text-risk-low border border-risk-low/30'
                  }`}>
                    {selectedIncident.severity}
                  </div>
                  <button onClick={() => setSelectedIncident(null)} className="text-gray-500 hover:text-white">✕</button>
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{selectedIncident.title}</h3>
                <p className="text-[11px] font-mono text-brand-text-secondary mb-3">{selectedIncident.incident_id.split('-')[0]}</p>
                
                <p className="text-[11px] text-gray-300 mb-4 line-clamp-3">{selectedIncident.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-brand-surface/50 p-2 rounded">
                    <span className="text-[10px] text-brand-text-secondary block mb-0.5">Category</span>
                    <span className="text-[11px] font-bold text-white">{selectedIncident.category}</span>
                  </div>
                  <div className="bg-brand-surface/50 p-2 rounded">
                    <span className="text-[10px] text-brand-text-secondary block mb-0.5">Coordinates</span>
                    <span className="text-[11px] font-bold text-white font-mono">{selectedIncident.latitude?.toFixed(2)}, {selectedIncident.longitude?.toFixed(2)}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleAnalyze(selectedIncident)}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-[#040A0C] font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(45,212,191,0.2)]"
                >
                  <RefreshCw size={12} /> Run AI Analysis
                </button>
              </div>
            </div>
          )}

          {/* List Panel */}
          <div className="bg-brand-bg-secondary border border-brand-surface rounded-md flex flex-col shadow-sm flex-1 overflow-hidden">
            <div className="px-4 py-3 bg-[#131E2F] border-b border-brand-surface flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Active Threats</span>
              <span className="text-[10px] bg-brand-surface text-white px-2 py-0.5 rounded font-bold">{mappableIncidents.length} LOCATIONS</span>
            </div>
            
            <div className="p-2 border-b border-brand-surface bg-brand-bg-main">
              <div className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={12} />
                <input 
                  type="text" 
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter by title or category..." 
                  className="w-full bg-brand-surface border border-brand-surface rounded pl-7 pr-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-primary transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {mappableIncidents.length === 0 ? (
                <div className="text-center p-6 flex flex-col items-center text-brand-text-secondary">
                  <Navigation size={24} className="mb-2 opacity-50" />
                  <p className="text-xs font-medium">No valid coordinates</p>
                  <p className="text-[10px] mt-1 text-center">Incidents must have latitude and longitude to appear on the map.</p>
                </div>
              ) : (
                mappableIncidents.map(inc => (
                  <div 
                    key={inc.incident_id} 
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 bg-brand-bg-main border rounded cursor-pointer transition-colors group relative overflow-hidden ${
                      selectedIncident?.incident_id === inc.incident_id 
                        ? 'border-brand-primary shadow-[0_0_8px_rgba(45,212,191,0.1)]' 
                        : 'border-brand-surface hover:border-brand-text-secondary'
                    }`}
                  >
                    {selectedIncident?.incident_id === inc.incident_id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary"></div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono text-brand-text-secondary group-hover:text-gray-300 transition-colors">{inc.incident_id.split('-')[0]}</span>
                      <span className={`w-2 h-2 rounded-full ${
                          inc.severity === 'CRITICAL' ? 'bg-risk-critical shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                          inc.severity === 'HIGH' ? 'bg-risk-high shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                          inc.severity === 'MODERATE' ? 'bg-risk-moderate shadow-[0_0_8px_rgba(234,179,8,0.5)]' :
                          'bg-risk-low shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                      }`}></span>
                    </div>
                    <h4 className="text-[11px] font-bold text-white leading-tight mb-1.5 line-clamp-2 pr-2">{inc.title}</h4>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-surface/50">
                      <div className="text-[9px] text-gray-400 font-medium px-1.5 py-0.5 bg-brand-surface rounded">{inc.category}</div>
                      <div className="flex items-center gap-1 text-[9px] font-mono text-brand-text-secondary">
                        <Crosshair size={9} /> {inc.latitude?.toFixed(2)}, {inc.longitude?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

