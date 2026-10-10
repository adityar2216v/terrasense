import { useState, useEffect } from 'react';
import { Database, Cloud, Bot, Server, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export function Settings() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStatus = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLastRefresh(new Date());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const StatusIndicator = ({ connected }: { connected: boolean }) => (
    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded w-fit ${
      connected ? 'bg-risk-low/10 text-risk-low border border-risk-low/20' : 'bg-risk-critical/10 text-risk-critical border border-risk-critical/20'
    }`}>
      {connected ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {connected ? 'CONNECTED' : 'OFFLINE'}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">System Settings & Health</h1>
          <p className="text-sm text-brand-text-secondary mt-1">Configure environment variables and check integration status.</p>
        </div>
        <button 
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface hover:bg-brand-surface/80 border border-white/10 rounded-md text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-brand-primary' : 'text-brand-text-secondary'} />
          <span className="font-medium text-brand-text-main">Refresh Status</span>
        </button>
      </div>

      <div className="bg-brand-bg-secondary border border-brand-surface rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-[#131E2F] border-b border-brand-surface flex justify-between items-center">
          <h2 className="text-sm font-semibold text-white">Integration Details</h2>
          <span className="text-[11px] text-brand-text-secondary">Last checked: {lastRefresh.toLocaleTimeString()}</span>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-[#182538] text-[11px] uppercase text-brand-text-secondary font-bold tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium border-b border-brand-surface w-1/4">Service</th>
              <th className="px-4 py-3 font-medium border-b border-brand-surface w-1/4">Status</th>
              <th className="px-4 py-3 font-medium border-b border-brand-surface w-1/2">Configuration Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-surface bg-brand-bg-secondary">
            {/* Supabase Row */}
            <tr className="hover:bg-brand-surface/30 transition-colors">
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 rounded bg-brand-surface border border-white/10 text-brand-primary">
                  <Database size={16} />
                </div>
                <div>
                  <div className="font-medium text-white">Supabase PostgreSQL</div>
                  <div className="text-[11px] text-brand-text-secondary">Primary Persistence Layer</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusIndicator connected={status?.persistence_status === 'CONNECTED'} />
              </td>
              <td className="px-4 py-3">
                <code className="text-[12px] bg-brand-bg-main px-2 py-1 rounded border border-white/5 text-brand-primary font-mono">
                  {status?.persistence_layer || 'Checking...'}
                </code>
              </td>
            </tr>

            {/* AWS SNS Row */}
            <tr className="hover:bg-brand-surface/30 transition-colors">
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 rounded bg-brand-surface border border-white/10 text-[#FF9900]">
                  <Cloud size={16} />
                </div>
                <div>
                  <div className="font-medium text-white">AWS Simple Notification Service</div>
                  <div className="text-[11px] text-brand-text-secondary">Critical Alert Triggers</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded w-fit ${
                  status?.aws_sns_integration === 'CONFIGURED' ? 'bg-risk-low/10 text-risk-low border border-risk-low/20' : 'bg-brand-surface text-brand-text-secondary border border-white/10'
                }`}>
                  {status?.aws_sns_integration === 'CONFIGURED' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {status?.aws_sns_integration || 'Checking...'}
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-brand-text-secondary">
                {status?.aws_sns_integration === 'CONFIGURED' 
                  ? 'SNS Topic ARN is configured in environment variables.' 
                  : 'Configure AWS_SNS_TOPIC_ARN in .env to enable hackathon push alerts.'}
              </td>
            </tr>

            {/* LangGraph Row */}
            <tr className="hover:bg-brand-surface/30 transition-colors">
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 rounded bg-brand-surface border border-white/10 text-brand-teal">
                  <Bot size={16} />
                </div>
                <div>
                  <div className="font-medium text-white">LangGraph Engine</div>
                  <div className="text-[11px] text-brand-text-secondary">Multi-Agent Operations</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded w-fit bg-risk-low/10 text-risk-low border border-risk-low/20">
                  <CheckCircle2 size={12} />
                  ACTIVE
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-brand-text-secondary">
                Sequential state-graph coordinator running securely in FastAPI.
              </td>
            </tr>

            {/* Environment Row */}
            <tr className="hover:bg-brand-surface/30 transition-colors">
              <td className="px-4 py-3 flex items-center gap-3">
                <div className="p-1.5 rounded bg-brand-surface border border-white/10 text-brand-cyan">
                  <Server size={16} />
                </div>
                <div>
                  <div className="font-medium text-white">Execution Environment</div>
                  <div className="text-[11px] text-brand-text-secondary">Local Deployment</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  {status?.environment || 'Checking...'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-brand-text-secondary">
                Running in safe development mode. Database connections require active VPN/Localhost.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
