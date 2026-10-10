import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Wind, Droplets, Shield, ArrowRight, Activity, Globe, ShieldAlert } from 'lucide-react';

export const HeroLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Simulate authentication delay for a more premium "SaaS" feel
    setTimeout(() => {
      const userEmail = email.toLowerCase();
      if (userEmail.includes('admin') || userEmail.includes('root')) {
        navigate('/app/admin');
      } else if (userEmail.includes('org') || userEmail.includes('water') || userEmail.includes('agency')) {
        navigate('/app/org');
      } else {
        navigate('/app');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#040A0C] text-white flex flex-col md:flex-row font-sans">
      {/* Left side - Hero / SaaS Presentation */}
      <div className="md:w-3/5 p-8 lg:p-16 flex flex-col justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#132A33] via-[#040A0C] to-[#040A0C]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/30">
              <Activity className="w-6 h-6 text-brand-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-widest text-white uppercase">TerraSense</h1>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-[1.1] tracking-tight">
            Planetary <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-cyan to-blue-400">
              Intelligence
            </span>
          </h2>
          
          <p className="text-lg text-brand-text-secondary mb-10 leading-relaxed font-light">
            The enterprise-grade environmental telemetry and multi-agent analysis platform. Unifying global sensor data with LangGraph-orchestrated AI to detect, analyze, and resolve ecological threats in real-time.
          </p>

          <div className="grid grid-cols-2 gap-4 lg:gap-8 max-w-lg">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#131E2F] border border-white/5 rounded-lg shrink-0 shadow-lg"><Globe className="w-5 h-5 text-brand-primary" /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Global Telemetry</h4>
                <p className="text-xs text-brand-text-secondary leading-snug">Aggregated multi-sensor data fusion.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#131E2F] border border-white/5 rounded-lg shrink-0 shadow-lg"><Wind className="w-5 h-5 text-brand-cyan" /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Air & Water Quality</h4>
                <p className="text-xs text-brand-text-secondary leading-snug">Continuous tracking & predictive modeling.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#131E2F] border border-white/5 rounded-lg shrink-0 shadow-lg"><Shield className="w-5 h-5 text-emerald-400" /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Risk Protocols</h4>
                <p className="text-xs text-brand-text-secondary leading-snug">Automated standard operating procedures.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#131E2F] border border-white/5 rounded-lg shrink-0 shadow-lg"><Activity className="w-5 h-5 text-blue-400" /></div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Agent Swarms</h4>
                <p className="text-xs text-brand-text-secondary leading-snug">Specialized LLM analysis consensus.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="md:w-2/5 p-8 lg:p-12 flex flex-col justify-center bg-[#0B131E] border-l border-white/5 relative">
        <div className="absolute top-8 right-8">
          <Link to="/sos" className="flex items-center gap-2 text-risk-critical bg-risk-critical/10 hover:bg-risk-critical/20 border border-risk-critical/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all">
            <ShieldAlert size={14} /> Emergency SOS
          </Link>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-2 text-white">System Access</h3>
            <p className="text-brand-text-secondary text-sm">Enter your credentials to access your designated workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#131E2F] border border-white/10 rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none text-white placeholder-gray-600 shadow-inner"
                placeholder="analyst@terrasense.gov"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-brand-primary hover:text-white transition-colors">Recover Access</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#131E2F] border border-white/10 rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary transition-all outline-none text-white placeholder-gray-600 shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="w-full mt-4 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-[#040A0C] rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(82,191,244,0.4)] disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isAuthenticating ? (
                <><Activity className="w-5 h-5 animate-pulse" /> Authenticating...</>
              ) : (
                <>Initialize Session <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            
            <div className="mt-8 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                <strong className="text-brand-primary">Demo Routing Logic:</strong><br/>
                Use <code className="bg-[#131E2F] px-1 rounded text-white">admin@</code> for Admin Dashboard<br/>
                Use <code className="bg-[#131E2F] px-1 rounded text-white">org@</code> for Organization Dashboard<br/>
                Use anything else for Standard Dashboard
              </p>
            </div>
          </form>

          <div className="mt-8 text-center text-gray-600 text-[10px] uppercase tracking-widest font-bold">
            Secure access portal • TerraSense v2.0
          </div>
        </div>
      </div>
    </div>
  );
};
