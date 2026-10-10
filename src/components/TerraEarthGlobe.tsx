import { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import type { Incident } from '../services/api';

interface TerraEarthGlobeProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId?: string | null;
}

export default function TerraEarthGlobe({ incidents, onSelectIncident, selectedIncidentId }: TerraEarthGlobeProps) {
  const globeEl = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    // Initial size
    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    });
    return () => observer.disconnect();
  }, []);

  // Configure globe
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      // Start zoomed out then fly in
      globeEl.current.pointOfView({ altitude: 3 }, 0);
      setTimeout(() => {
        if (globeEl.current) {
          globeEl.current.pointOfView({ altitude: 2 }, 2000);
        }
      }, 100);
    }
  }, []);

  // When selected incident changes externally, fly to it
  useEffect(() => {
    if (selectedIncidentId && globeEl.current) {
      const selected = incidents.find(i => i.incident_id === selectedIncidentId);
      if (selected && selected.latitude !== null && selected.longitude !== null) {
        globeEl.current.controls().autoRotate = false;
        globeEl.current.pointOfView({ lat: selected.latitude, lng: selected.longitude, altitude: 1.2 }, 1500);
      }
    }
  }, [selectedIncidentId, incidents]);

  // Format data for globe
  const markersData = useMemo(() => {
    return incidents
      .filter(i => i.latitude !== null && i.latitude !== undefined && i.longitude !== null && i.longitude !== undefined)
      .map(incident => {
        const isSelected = selectedIncidentId === incident.incident_id;
        return {
          lat: incident.latitude,
          lng: incident.longitude,
          size: isSelected ? 1.5 : (incident.severity === 'CRITICAL' ? 1.0 : incident.severity === 'HIGH' ? 0.7 : 0.5),
          color: isSelected ? '#FFFFFF' : (
               incident.severity === 'CRITICAL' ? '#EF4444' : 
               incident.severity === 'HIGH' ? '#F59E0B' : 
               incident.severity === 'MODERATE' ? '#EAB308' : '#10B981'),
          incident
        };
      });
  }, [incidents, selectedIncidentId]);

  // Handle marker click
  const handleMarkerClick = (marker: any) => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = false;
    }
    onSelectIncident(marker.incident);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-move bg-[#0a1017]">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        // We keep pointsData to handle the actual clicking/interaction (invisible)
        pointsData={markersData}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => 'rgba(0,0,0,0)'} // invisible, just for click target
        pointAltitude={0.01}
        pointRadius={1.5} // big enough to click easily
        pointsMerge={false}
        onPointClick={handleMarkerClick}
        pointResolution={32}
        // Use HTML elements to draw the custom SVG pins visually
        htmlElementsData={markersData}
        htmlElement={(d: any) => {
          const el = document.createElement('div');
          el.className = 'pointer-events-none cursor-pointer flex flex-col items-center';
          el.innerHTML = `
            <div class="${d.incident.severity === 'CRITICAL' && d.incident.incident_id !== selectedIncidentId ? 'animate-bounce' : ''} transition-transform transform ${d.incident.incident_id === selectedIncidentId ? 'scale-125' : 'scale-100'}">
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5));">
                <path d="M12 0C5.373 0 0 5.373 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.373 18.627 0 12 0Z" fill="${d.color}"/>
                <circle cx="12" cy="12" r="5" fill="#131E2F"/>
                ${d.incident.incident_id === selectedIncidentId ? '<circle cx="12" cy="12" r="2" fill="white"/>' : ''}
              </svg>
            </div>
            ${d.incident.incident_id === selectedIncidentId ? `
              <div class="mt-1 bg-black/80 backdrop-blur-md border border-white/50 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap shadow-lg z-50 font-bold">
                ${d.incident.title.substring(0, 20)}${d.incident.title.length > 20 ? '...' : ''}
              </div>
            ` : ''}
          `;
          return el;
        }}
      />
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-3 w-48 shadow-xl pointer-events-auto">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Controls</h3>
          <div className="flex flex-col gap-1 text-[11px] text-gray-300">
            <div className="flex justify-between"><span>Rotate</span><span>Left Click + Drag</span></div>
            <div className="flex justify-between"><span>Zoom</span><span>Scroll</span></div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
              <span>Auto-rotate</span>
              <button 
                onClick={() => {
                  if (globeEl.current) {
                    const currentState = globeEl.current.controls().autoRotate;
                    globeEl.current.controls().autoRotate = !currentState;
                  }
                }}
                className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors"
              >
                Toggle
              </button>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Reset View</span>
              <button 
                onClick={() => {
                  if (globeEl.current) {
                    globeEl.current.pointOfView({ altitude: 2 }, 1500);
                  }
                }}
                className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
