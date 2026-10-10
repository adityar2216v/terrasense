import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Globe, Activity, AlertTriangle, BarChart3, FileText, Bot, Settings, Bell, User, ChevronLeft, Menu, Database, ChevronDown, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Layout() {
  const location = useLocation();
  const path = location.pathname;
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [dataMode, setDataMode] = useState<'LIVE' | 'DEMO' | 'PARTIAL'>('LIVE');

  useEffect(() => {
    // In a real app, this would ping the health endpoint
    setBackendStatus('connected');
  }, []);

  const environmentItems = [
    { label: 'Overview', path: '/app', icon: Activity },
    { label: 'Live Map', path: '/app/map', icon: Globe },
    { label: 'Incidents', path: '/app/incidents', icon: AlertTriangle },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Reports', path: '/app/reports', icon: FileText },
  ];

  const intelligenceItems = [
    { label: 'AI Agents', path: '/app/agents', icon: Bot },
    { label: 'Terra AI', path: '/app/assistant', icon: Bot }, // Using Bot for now, maybe Sparkles if available
  ];

  const systemItems = [
    { label: 'Admin Dashboard', path: '/app/admin', icon: ShieldAlert },
    { label: 'Org Workspace', path: '/app/org', icon: User },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const renderNavSection = (title: string, items: typeof environmentItems) => (
    <div className="mb-6">
      {!isSidebarCollapsed && (
        <div className="text-[11px] uppercase font-bold tracking-wider text-brand-text-secondary mb-2 px-4">
          {title}
        </div>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = path === item.path;
          const Icon = item.icon;
          return (
            <li key={item.label} className="px-2">
              <Link
                to={item.path}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-primary text-brand-bg-main'
                    : 'text-brand-text-main hover:bg-brand-surface'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-bg-main' : 'text-brand-text-secondary'} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-brand-bg-main text-brand-text-main font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarCollapsed ? 'w-16' : 'w-60'} border-r border-brand-surface bg-brand-bg-secondary hidden md:flex flex-col relative z-20 transition-all duration-300 print:hidden`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-brand-surface bg-[#131E2F]">
          <div className="flex items-center gap-2 overflow-hidden">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM16 28C9.373 28 4 22.627 4 16C4 9.373 9.373 4 16 4C22.627 4 28 9.373 28 16C28 22.627 22.627 28 16 28Z" fill="var(--color-brand-primary)" fillOpacity="0.2"/>
              <path d="M22.5 10.5C22.5 10.5 19 8 15 8C11 8 8 11 8 15C8 19 10.5 22.5 10.5 22.5" stroke="var(--color-brand-primary)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10.5 22.5C10.5 22.5 14 24 18 24C22 24 24 21 24 17C24 13 22.5 10.5 22.5 10.5" stroke="var(--color-brand-teal)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="4" fill="var(--color-brand-primary)" />
            </svg>
            {!isSidebarCollapsed && (
              <span className="font-display font-bold text-[15px] tracking-tight text-white whitespace-nowrap">
                TerraSense
              </span>
            )}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {renderNavSection('Environment', environmentItems)}
          {renderNavSection('Intelligence', intelligenceItems)}
          {renderNavSection('System', systemItems)}
        </nav>
        
        <div className="p-2 border-t border-brand-surface flex justify-end">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 text-brand-text-secondary hover:text-brand-text-main hover:bg-brand-surface rounded-md transition-colors w-full flex justify-center"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* TopNav */}
        <header className="h-14 border-b border-brand-surface bg-[#131E2F] flex items-center justify-between px-4 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-bg-main border border-brand-surface rounded text-sm cursor-pointer hover:border-brand-primary/50 transition-colors">
              <span className="text-brand-text-secondary text-[12px]">Location:</span>
              <span className="font-medium text-[13px] text-white">Global Scope</span>
              <ChevronDown size={14} className="text-brand-text-secondary" />
            </div>
            
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold tracking-wide uppercase border ${
              dataMode === 'LIVE' 
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                : 'bg-brand-surface border-brand-surface text-brand-text-secondary'
            }`}>
              {dataMode === 'LIVE' && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></div>}
              {dataMode} DATA
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-2.5 text-brand-text-secondary" size={14} />
              <input 
                type="text" 
                placeholder="Search telemetry, incidents, or analyses... (Alt+S)" 
                className="w-80 bg-brand-bg-main border border-brand-surface rounded pl-8 pr-3 py-1 text-[13px] text-brand-text-main focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-brand-text-secondary/50"
              />
            </div>
            
            <div className="w-px h-5 bg-brand-surface mx-1"></div>
            
            <div className="flex items-center gap-2 px-2" title="Backend Status">
              <Database size={14} className={backendStatus === 'connected' ? 'text-green-500' : 'text-red-500'} />
              <span className="text-[12px] text-brand-text-secondary hidden lg:inline">Supabase connected</span>
            </div>

            <button className="p-1.5 text-brand-text-secondary hover:text-white hover:bg-brand-surface rounded transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full border border-[#131E2F]"></span>
            </button>
            
            <button className="flex items-center gap-2 hover:bg-brand-surface p-1 rounded transition-colors ml-1">
              <div className="w-6 h-6 rounded bg-brand-surface border border-white/10 flex items-center justify-center text-brand-text-main">
                <User size={14} />
              </div>
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-brand-bg-main scroll-smooth">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
