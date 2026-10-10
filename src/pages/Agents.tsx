import { Bot, Clock, Activity, CheckCircle, AlertTriangle, Cpu, Network, Zap, Waves, Wind, Trash2, ShieldAlert, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { api } from '../services/api';
import type { WorkflowState, AgentResult } from '../services/api';

export function Agents() {
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prepareMockIncident = async () => {
    const lat = +(Math.random() * 180 - 90).toFixed(4);
    const lng = +(Math.random() * 360 - 180).toFixed(4);
    const mock_incident = {
      title: `Manual Analysis at ${lat}, ${lng}`,
      description: "Triggered from Agents Dashboard",
      category: "Air Quality",
      severity: "HIGH" as const,
      latitude: lat,
      longitude: lng,
      status: "OPEN" as const,
      source_type: "MANUAL"
    };
    return await api.createIncident(mock_incident);
  };

  const getMockInput = (type: string, lat: number = 28.6, lng: number = 77.2) => {
    const base = { latitude: lat, longitude: lng };
    if (type === 'air') return { ...base };
    if (type === 'water') return { ...base, ph: 6.5, turbidity: 25.0, dissolved_oxygen: 5.5 };
    if (type === 'waste') return { ...base, has_image: true, waste_type: 'CHEMICAL' };
    return { ...base, ph: 6.5, turbidity: 25.0, dissolved_oxygen: 5.5, has_image: true, waste_type: 'CHEMICAL' };
  };

  const runFullAnalysis = async () => {
    setLoading(true);
    setActionType('full');
    try {
      const incident = await prepareMockIncident();
      const inputData = getMockInput('all', incident.latitude, incident.longitude);
      const result = await api.runAnalysis(incident.incident_id, inputData);
      setWorkflowState(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  const runAgentAnalysis = async (agent: 'air' | 'water' | 'waste') => {
    setLoading(true);
    setActionType(agent);
    try {
      const incident = await prepareMockIncident();
      const inputData = getMockInput(agent, incident.latitude, incident.longitude);
      
      let res: AgentResult;
      if (agent === 'air') res = await api.runAirAnalysis(incident.incident_id, inputData);
      else if (agent === 'water') res = await api.runWaterAnalysis(incident.incident_id, inputData);
      else res = await api.runWasteAnalysis(incident.incident_id, inputData);

      setWorkflowState(prev => {
        const newState = prev ? { ...prev } : {
          input_data: inputData,
          coordinator_evidence: [],
          recommendations: [],
          execution_status: 'PARTIAL'
        };
        if (agent === 'air') newState.air_result = res;
        if (agent === 'water') newState.water_result = res;
        if (agent === 'waste') newState.waste_result = res;
        return newState;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    setActionType('waste');
    try {
      const file = e.target.files[0];
      await api.uploadWasteImage(file);
      // After upload, run waste analysis
      await runAgentAnalysis('waste');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setActionType('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-6 pb-16">
      <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-brand-surface pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Agent Swarm Operations</h1>
          <p className="text-brand-text-secondary text-sm">Monitor real-time LangGraph multi-agent orchestration and independent node execution.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className={`px-4 py-1.5 border rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mr-2 ${
            loading ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 
            workflowState ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary' : 
            'border-white/10 bg-white/5 text-gray-400'
          }`}>
            <span className="relative flex h-2 w-2">
              {(loading || workflowState) && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
            </span>
            {workflowState ? workflowState.execution_status : (loading ? 'EXECUTING SWARM' : 'SYSTEM IDLE')}
          </div>
          
          <button onClick={() => runAgentAnalysis('air')} disabled={loading} className="px-3 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/50 text-xs font-bold rounded hover:bg-sky-500/30 disabled:opacity-50 transition-all uppercase tracking-wider flex items-center gap-1">
            <Wind size={14} /> Air
          </button>
          <button onClick={() => runAgentAnalysis('water')} disabled={loading} className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 text-xs font-bold rounded hover:bg-blue-500/30 disabled:opacity-50 transition-all uppercase tracking-wider flex items-center gap-1">
            <Waves size={14} /> Water
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="px-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-xs font-bold rounded hover:bg-emerald-500/30 disabled:opacity-50 transition-all uppercase tracking-wider flex items-center gap-1">
            <Upload size={14} /> Upload & Waste
          </button>

          <button 
            onClick={runFullAnalysis}
            disabled={loading}
            className="px-4 py-2 bg-brand-primary text-black font-bold rounded shadow-[0_0_15px_rgba(82,191,244,0.3)] hover:bg-brand-primary/90 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 text-sm uppercase tracking-wider ml-2"
          >
            {loading && actionType === 'full' ? (
              <><Zap size={16} className="animate-pulse" /> Processing...</>
            ) : (
              <><Cpu size={16} /> Run Full Analysis</>
            )}
          </button>
        </div>
      </div>

      <div className="relative p-8 md:p-12 bg-[#0B131E] border border-white/5 shadow-2xl rounded-2xl overflow-hidden min-h-[600px]">
        {/* Background Tech Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          
          {/* Input Node */}
          <div className={`w-80 p-4 rounded border-l-4 shadow-lg flex items-center justify-between transition-all ${loading ? 'bg-amber-500/10 border-amber-500' : workflowState ? 'bg-brand-primary/10 border-brand-primary' : 'bg-[#131E2F] border-gray-600'}`}>
            <div>
              <h3 className="font-bold text-white text-sm tracking-widest uppercase mb-1">Ingestion Gateway</h3>
              <p className="text-xs text-brand-text-secondary">
                {workflowState ? 'Telemetry payload processed.' : (loading ? 'Parsing anomaly telemetry...' : 'Awaiting sensor payload.')}
              </p>
            </div>
            <Network className={loading ? "text-amber-400 animate-pulse" : workflowState ? "text-brand-primary" : "text-gray-500"} size={24} />
          </div>

          {/* Data lines down */}
          <div className="w-full flex justify-center h-16 relative">
            <div className={`w-0.5 h-full ${loading ? 'bg-gradient-to-b from-amber-500 to-amber-500/0 animate-pulse' : workflowState ? 'bg-brand-primary' : 'bg-gray-700'}`}></div>
          </div>
          <div className={`w-full max-w-2xl h-0.5 ${loading ? 'bg-amber-500/50' : workflowState ? 'bg-brand-primary/50' : 'bg-gray-700'}`}></div>
          <div className="w-full max-w-2xl flex justify-between h-8">
            <div className={`w-0.5 h-full ${loading ? 'bg-gradient-to-b from-amber-500/50 to-amber-500/10' : workflowState ? 'bg-brand-primary/50' : 'bg-gray-700'}`}></div>
            <div className={`w-0.5 h-full ${loading ? 'bg-gradient-to-b from-amber-500/50 to-amber-500/10' : workflowState ? 'bg-brand-primary/50' : 'bg-gray-700'}`}></div>
            <div className={`w-0.5 h-full ${loading ? 'bg-gradient-to-b from-amber-500/50 to-amber-500/10' : workflowState ? 'bg-brand-primary/50' : 'bg-gray-700'}`}></div>
          </div>

          {/* Parallel Agents */}
          <div className="flex flex-col md:flex-row gap-6 w-full justify-between relative mt-2">
            <AgentNode 
              title="Atmospheric Intel" 
              status={workflowState?.air_result?.execution_status || (loading && (actionType === 'full' || actionType === 'air') ? 'Running' : 'Idle')} 
              icon={Wind} 
              risk={workflowState?.air_result?.risk_score ?? '--'} 
              evidence={workflowState?.air_result?.evidence}
              errors={workflowState?.air_result?.errors}
              color="text-sky-400"
              bgColor="bg-sky-400/10"
              borderColor={workflowState?.air_result ? 'border-sky-400' : loading && (actionType === 'full' || actionType === 'air') ? 'border-amber-500' : 'border-white/10'}
            />
            <AgentNode 
              title="Hydrological Intel" 
              status={workflowState?.water_result?.execution_status || (loading && (actionType === 'full' || actionType === 'water') ? 'Running' : 'Idle')} 
              icon={Waves} 
              risk={workflowState?.water_result?.risk_score ?? '--'} 
              evidence={workflowState?.water_result?.evidence}
              errors={workflowState?.water_result?.errors}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
              borderColor={workflowState?.water_result ? 'border-blue-500' : loading && (actionType === 'full' || actionType === 'water') ? 'border-amber-500' : 'border-white/10'}
            />
            <AgentNode 
              title="Waste & Topography" 
              status={workflowState?.waste_result?.execution_status || (loading && (actionType === 'full' || actionType === 'waste') ? 'Running' : 'Idle')} 
              icon={Trash2} 
              risk={workflowState?.waste_result?.risk_score ?? '--'} 
              evidence={workflowState?.waste_result?.evidence}
              errors={workflowState?.waste_result?.errors}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
              borderColor={workflowState?.waste_result ? 'border-emerald-500' : loading && (actionType === 'full' || actionType === 'waste') ? 'border-amber-500' : 'border-white/10'}
            />
          </div>

          {/* Data lines combining */}
          <div className="w-full max-w-2xl flex justify-between h-8 mt-2">
            <div className={`w-0.5 h-full ${workflowState?.air_result ? 'bg-gradient-to-b from-sky-400/50 to-brand-primary' : 'bg-gray-700'}`}></div>
            <div className={`w-0.5 h-full ${workflowState?.water_result ? 'bg-gradient-to-b from-blue-500/50 to-brand-primary' : 'bg-gray-700'}`}></div>
            <div className={`w-0.5 h-full ${workflowState?.waste_result ? 'bg-gradient-to-b from-emerald-500/50 to-brand-primary' : 'bg-gray-700'}`}></div>
          </div>
          <div className={`w-full max-w-2xl h-0.5 ${workflowState && (workflowState.air_result || workflowState.water_result || workflowState.waste_result) ? 'bg-brand-primary/50' : 'bg-gray-700'}`}></div>
          <div className="w-full flex justify-center h-16 relative">
            <div className={`w-0.5 h-full ${workflowState && (workflowState.air_result || workflowState.water_result || workflowState.waste_result) ? 'bg-brand-primary' : 'bg-gray-700'}`}></div>
            {workflowState && (workflowState.air_result || workflowState.water_result || workflowState.waste_result) && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-brand-primary rounded-full animate-ping"></div>
            )}
          </div>

          {/* Coordinator Node */}
          <div className={`w-full max-w-md p-6 rounded-xl border ${workflowState && workflowState.execution_status !== 'PARTIAL' ? 'border-brand-primary shadow-[0_0_40px_rgba(82,191,244,0.15)] bg-[#131E2F]' : 'border-white/10 bg-[#131E2F]'} text-center relative`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B131E] px-3 border border-white/10 rounded-full flex items-center gap-2">
              <Bot size={12} className={workflowState ? "text-brand-primary" : "text-gray-500"} />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white">LangGraph Coordinator</span>
            </div>
            
            <h3 className="font-bold text-white text-lg tracking-tight mb-2 mt-2">Fusion Matrix</h3>
            <p className="text-xs text-brand-text-secondary mb-4">
              Synthesizes independent specialist outputs into a deterministic final risk score and action protocol.
            </p>
            
            <div className="bg-[#0B131E] border border-white/5 rounded p-3 text-left mb-4 min-h-[80px]">
              {workflowState?.coordinator_evidence?.length ? (
                workflowState.coordinator_evidence.map((ev, i) => (
                  <div key={i} className="text-xs text-gray-300 mb-1 flex gap-2">
                    <span className="text-brand-primary shrink-0">›</span> {ev}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-600 text-center mt-4">Awaiting agent convergence...</div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center bg-[#0B131E]/50 -mx-6 -mb-6 p-4 rounded-b-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">System Verdict</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase ${workflowState ? 'text-white' : 'text-gray-500'}`}>
                  {workflowState?.final_risk_level || 'PENDING'}
                </span>
                <div className={`text-xl font-black font-mono ${workflowState ? 'text-brand-primary' : 'text-gray-600'}`}>
                  {workflowState?.final_score !== undefined && workflowState?.final_score !== null ? `${workflowState.final_score}/100` : '--/100'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Action Items */}
      {workflowState?.recommendations && workflowState.recommendations.length > 0 && (
        <div className="bg-risk-critical/10 border border-risk-critical/30 rounded-xl p-8 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
           <div className="absolute -right-10 -top-10 opacity-5"><ShieldAlert size={180} /></div>
           <h3 className="text-xl font-bold text-risk-critical mb-6 flex items-center gap-2 uppercase tracking-wider">
             <AlertTriangle /> Critical Protocol Triggered
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
             {workflowState.recommendations.map((rec, i) => (
               <div key={i} className="bg-[#0B131E]/80 backdrop-blur-md p-5 rounded border border-white/10 hover:border-risk-critical/50 transition-colors">
                 <div className="flex justify-between items-start mb-3">
                   <div className="font-bold text-white text-lg">{rec.title}</div>
                   <span className="text-[10px] font-black tracking-widest bg-risk-critical text-white px-2 py-1 rounded uppercase shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                     {rec.priority}
                   </span>
                 </div>
                 <p className="text-sm text-gray-300 mb-4 leading-relaxed">{rec.explanation}</p>
                 <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium p-3 rounded flex flex-col gap-1">
                   <span className="uppercase text-[10px] font-bold tracking-wider opacity-70">Automated Next Step:</span>
                   <span>{rec.suggested_next_step}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}

function AgentNode({ title, status, icon: Icon, risk, evidence, errors, color, bgColor, borderColor }: any) {
  return (
    <div className={`flex-1 min-w-[250px] p-5 bg-[#131E2F] rounded-xl border ${borderColor} relative transition-all duration-500 shadow-lg`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon size={18} className={color} />
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] uppercase font-bold tracking-widest ${status === 'Idle' ? 'bg-white/5 border-white/10 text-gray-500' : status === 'FAILED' || status === 'MODEL_UNAVAILABLE' || status === 'UNAVAILABLE' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-brand-surface border-white/20 text-white'}`}>
          {status === 'Running' && <Activity size={10} className="animate-pulse text-amber-400" />}
          {status === 'SUCCESS' && <CheckCircle size={10} className="text-brand-primary" />}
          {status === 'Idle' && <Clock size={10} />}
          {status}
        </div>
      </div>
      <h4 className="font-bold text-white text-sm tracking-wide mb-2 uppercase">{title}</h4>
      <div className="text-xs text-gray-400 mb-4 h-20 overflow-y-auto bg-[#0B131E]/50 p-2 rounded border border-white/5 scrollbar-thin">
        {errors && errors.length > 0 ? (
          <ul className="space-y-1 text-red-400">
            {errors.map((err: string, i: number) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-red-500">x</span> {err}
              </li>
            ))}
          </ul>
        ) : evidence && evidence.length > 0 ? (
          <ul className="space-y-1">
            {evidence.map((ev: string, i: number) => (
              <li key={i} className="flex gap-1.5">
                <span className={color}>›</span> {ev}
              </li>
            ))}
          </ul>
        ) : (
          <div className="h-full flex items-center justify-center opacity-50">Standby</div>
        )}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">Assessed Risk</span>
        <span className={`font-mono font-black text-sm ${risk !== '--' ? color : 'text-gray-600'}`}>{risk}</span>
      </div>
    </div>
  );
}
