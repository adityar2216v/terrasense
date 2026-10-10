import { useState, useEffect, useMemo } from 'react';
import { FileText, Download, Mail, CheckCircle2, FileBarChart, Filter, AlertOctagon, Calendar, Building, Globe } from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../services/api';

export function Reports() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.getIncidents().then(setIncidents);
  }, []);

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      setReportGenerated(true);
    }, 2000);
  };

  const handleAction = (action: string) => {
    setActionSuccess(`${action} successfully!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const criticalIncidents = useMemo(() => incidents.filter(i => i.severity === 'CRITICAL'), [incidents]);
  const highIncidents = useMemo(() => incidents.filter(i => i.severity === 'HIGH'), [incidents]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10 p-4 lg:p-6">
      <div className="flex justify-between items-end mb-8 border-b border-brand-surface pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Report Generator</h1>
          <p className="text-brand-text-secondary text-sm">Compile and distribute standardized environmental compliance and risk assessments.</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button className="flex items-center gap-2 bg-brand-surface border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded text-sm font-semibold transition shadow-sm">
            <Filter size={16} /> Filter Criteria
          </button>
          <button 
            onClick={handleGenerateReport}
            disabled={generatingReport || reportGenerated}
            className="flex items-center gap-2 bg-brand-primary text-black px-4 py-2 rounded font-bold text-sm hover:bg-brand-primary/90 transition disabled:opacity-50 shadow-[0_0_15px_rgba(82,191,244,0.2)]"
          >
            {generatingReport ? (
              <span className="animate-pulse flex items-center gap-2"><FileBarChart size={16}/> Compiling Telemetry...</span>
            ) : reportGenerated ? (
              <>
                <CheckCircle2 size={16} /> Report Active
              </>
            ) : (
              <>
                <FileText size={16} /> Generate Master Report
              </>
            )}
          </button>
        </div>
      </div>
      
      {!reportGenerated ? (
         <div className="flex flex-col items-center justify-center py-32 border border-white/10 border-dashed rounded-xl bg-[#131E2F]/50">
            <FileBarChart size={64} className="text-brand-primary/30 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Awaiting Generation</h3>
            <p className="text-brand-text-secondary text-sm max-w-md text-center">Click "Generate Master Report" to compile current telemetry, aggregate agent findings, and format the executive summary.</p>
         </div>
      ) : (
        <div className="relative">
          {/* Action Bar Overlay */}
          <div className="sticky top-0 z-10 flex justify-end gap-3 py-4 bg-brand-bg-main/90 backdrop-blur-md print:hidden mb-4 border-b border-brand-surface">
            <button onClick={() => { handleAction('Preparing PDF...'); setTimeout(() => window.print(), 800); }} className="flex items-center gap-2 bg-brand-surface hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded text-sm font-semibold transition">
              <Download size={16} /> Export as PDF
            </button>
            <button onClick={() => handleAction('Report Sent to Distribution List')} className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/80 text-black px-4 py-2 rounded text-sm font-semibold transition">
              <Mail size={16} /> Email Distribution
            </button>
            
            {actionSuccess && (
              <div className="absolute top-16 right-0 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded text-sm whitespace-nowrap flex items-center gap-2 animate-in fade-in zoom-in shadow-lg">
                <CheckCircle2 size={16} /> {actionSuccess}
              </div>
            )}
          </div>

          {/* The Actual Report Document */}
          <div className="bg-[#FFFFFF] text-black rounded-sm shadow-2xl p-10 md:p-16 max-w-5xl mx-auto print:shadow-none print:p-0 print:text-black">
            
            {/* Report Header */}
            <header className="border-b-2 border-black pb-8 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold font-display uppercase tracking-tighter text-black mb-2">Executive Incident Brief</h1>
                <h2 className="text-xl text-gray-600 font-medium tracking-wide">TerraSense Global Intelligence Network</h2>
              </div>
              <div className="text-right flex flex-col gap-1 text-sm font-medium text-gray-500">
                <div className="flex justify-end items-center gap-2"><Globe size={14} /> Global Scope</div>
                <div className="flex justify-end items-center gap-2"><Building size={14} /> Compliance Dept.</div>
                <div className="flex justify-end items-center gap-2"><Calendar size={14} /> {new Date().toLocaleDateString()}</div>
                <div className="mt-2 text-red-600 border border-red-600 px-2 py-0.5 inline-block font-bold rounded-sm text-xs self-end uppercase">Confidential</div>
              </div>
            </header>

            {/* Metrics Overview */}
            <div className="grid grid-cols-4 gap-4 mb-10">
              <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Incidents</div>
                <div className="text-3xl font-black">{incidents.length}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-md border border-red-200">
                <div className="text-xs text-red-600 uppercase font-bold tracking-wider mb-1">Critical Priority</div>
                <div className="text-3xl font-black text-red-700">{criticalIncidents.length}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <div className="text-xs text-amber-600 uppercase font-bold tracking-wider mb-1">High Priority</div>
                <div className="text-3xl font-black text-amber-700">{highIncidents.length}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <div className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">AI Confidence</div>
                <div className="text-3xl font-black text-blue-700">94.2%</div>
              </div>
            </div>

            {/* Executive Summary */}
            <section className="mb-10">
              <h3 className="text-lg font-black uppercase tracking-wider border-b border-gray-300 pb-2 mb-4">1. Executive Summary</h3>
              <p className="text-gray-800 leading-relaxed mb-4">
                During the analyzed operational period, the TerraSense grid processed continuous environmental telemetry. 
                A total of <strong>{incidents.length} anomalies</strong> were flagged by the LangGraph multi-agent system. 
                <strong className="text-red-600"> {criticalIncidents.length} of these events required critical escalation</strong>, representing localized concentrations of high-risk activity that violate established EPA and international compliance thresholds.
              </p>
              <p className="text-gray-800 leading-relaxed">
                The overarching risk profile indicates a stabilization in atmospheric pollutants across primary sectors, but a statistically significant rise in localized hydrological toxicity downstream from industrial zones. 
                Immediate intervention is required at the coordinates detailed in Section 2.
              </p>
            </section>

            {/* Critical Escalations Table */}
            <section className="mb-10">
              <h3 className="text-lg font-black uppercase tracking-wider border-b border-gray-300 pb-2 mb-4 flex items-center gap-2">
                <AlertOctagon size={20} className="text-red-600" /> 2. Critical Escalation Ledger
              </h3>
              
              {criticalIncidents.length > 0 ? (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-3 border border-gray-300 font-bold uppercase tracking-wider text-xs">ID</th>
                      <th className="p-3 border border-gray-300 font-bold uppercase tracking-wider text-xs">Title</th>
                      <th className="p-3 border border-gray-300 font-bold uppercase tracking-wider text-xs">Category</th>
                      <th className="p-3 border border-gray-300 font-bold uppercase tracking-wider text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalIncidents.map((incident) => (
                      <tr key={incident.incident_id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 border border-gray-300 font-mono text-xs text-gray-500">{incident.incident_id.substring(0, 8)}...</td>
                        <td className="p-3 border border-gray-300 font-semibold">{incident.title}</td>
                        <td className="p-3 border border-gray-300">{incident.category}</td>
                        <td className="p-3 border border-gray-300">
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold uppercase">{incident.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="bg-gray-50 p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded">
                  No critical incidents recorded in this operational period.
                </div>
              )}
            </section>

            {/* AI Action Items */}
            <section className="mb-10 page-break-before">
              <h3 className="text-lg font-black uppercase tracking-wider border-b border-gray-300 pb-2 mb-4">3. Automated Agent Findings & Actions</h3>
              <div className="space-y-4">
                <div className="bg-white border border-gray-300 p-5 rounded-md shadow-sm">
                  <h4 className="font-bold text-md mb-2 flex justify-between">
                    <span>Air Quality Deviation</span>
                    <span className="text-amber-600 text-xs font-black uppercase bg-amber-100 px-2 py-1 rounded">High Priority</span>
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">Atmospheric mapping indicates elevated particulate density in industrial zones. The Air Intelligence Core inferred a 94% probability of sustained degradation exceeding standard limits.</p>
                  <div className="text-xs font-medium text-gray-500 bg-gray-50 p-2 border border-gray-200 rounded">
                    <strong>Suggested Action:</strong> Issue localized health advisories and dispatch verification drones to exact coordinates.
                  </div>
                </div>

                <div className="bg-white border border-gray-300 p-5 rounded-md shadow-sm">
                  <h4 className="font-bold text-md mb-2 flex justify-between">
                    <span>Hydrological Toxicity Breach</span>
                    <span className="text-red-600 text-xs font-black uppercase bg-red-100 px-2 py-1 rounded">Critical Priority</span>
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">Water quality metrics show critical spikes downstream from recent incident coordinates. Deep learning models strongly correlate this with recent surface containment disruptions.</p>
                  <div className="text-xs font-medium text-gray-500 bg-gray-50 p-2 border border-gray-200 rounded">
                    <strong>Suggested Action:</strong> Immediately isolate local water supply intake. Deploy containment boom logic.
                  </div>
                </div>
              </div>
            </section>
            
            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-300 flex justify-between text-xs text-gray-400">
              <div>TerraSense AI-Generated Document</div>
              <div>Page 1 of 1</div>
              <div>UUID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
